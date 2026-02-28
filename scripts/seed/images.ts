import sharp from "sharp";
import { ExpirationTime } from "@arkiv-network/sdk/utils";
import type { Hex } from "viem";
import { APP_ID } from "./config";
import type { SeedWallet } from "./wallets";
import { createSeedWalletClient } from "./wallets";
import type { GeneratedEvent } from "./generate";

const COVER_MAX_WIDTH = 800;
const COVER_MAX_HEIGHT = 450;
const COVER_QUALITY = 75;
const COVER_MAX_PAYLOAD = 80 * 1024; // 80KB

const IMAGE_STYLES = [
  "dark-futuristic",
  "colorful-vibrant",
  "minimal-clean",
  "abstract-artistic",
  "cyberpunk",
  "retro",
] as const;

const STYLE_PROMPTS: Record<string, string> = {
  "dark-futuristic":
    "Dark background with purple/violet and blue accent colors. Subtle gradients and glowing neon elements. Futuristic and inviting atmosphere.",
  "colorful-vibrant":
    "Bold, vivid color palette with energetic gradients. Warm and cool tones blending together. Lively and dynamic feel.",
  "minimal-clean":
    "Minimalist composition with plenty of negative space. Soft, muted tones. Elegant and understated with geometric accents.",
  "abstract-artistic":
    "Expressive abstract shapes and textures. Painterly or generative-art feel with rich layering. Bold and creative.",
  cyberpunk:
    "Cyberpunk aesthetic with neon pink, cyan, and electric blue lights. Rain-soaked city reflections, holographic elements. Gritty yet high-tech.",
  retro:
    "Retro 80s/90s aesthetic with synthwave sunset gradients, chrome reflections, and grid lines. Warm pink, orange, and purple tones.",
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  conference: "a professional technology conference with stages and screens",
  meetup: "a casual community meetup gathering",
  workshop: "a hands-on learning workshop with collaboration",
  hackathon: "an energetic coding hackathon with developers",
  social: "a vibrant social networking event",
};

function buildPrompt(title: string, description: string, category: string): string {
  const style = IMAGE_STYLES[Math.floor(Math.random() * IMAGE_STYLES.length)];
  const stylePrompt = STYLE_PROMPTS[style];
  const categoryContext = CATEGORY_DESCRIPTIONS[category] || "a community event";

  return `Create a modern, visually striking event cover image for ${categoryContext}. The event is titled "${title}". ${description ? `Event description: "${description.slice(0, 200)}".` : ""} Style: Clean, modern design. ${stylePrompt} Abstract and atmospheric. IMPORTANT: Do not include any text, words, letters, numbers, watermarks, or typography anywhere in the image. No logos, no specific faces. Think of a premium tech event banner.`;
}

/** Generate a cover image via OpenAI and compress it */
async function generateAndCompressImage(
  title: string,
  description: string,
  category: string
): Promise<Uint8Array> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not set");

  const prompt = buildPrompt(title, description, category);

  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt,
      n: 1,
      size: "1536x1024",
      quality: "low",
      output_format: "jpeg",
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(`OpenAI image API error ${res.status}: ${JSON.stringify(errData)}`);
  }

  const data = await res.json();
  const base64 = data.data[0].b64_json;
  const rawBuffer = Buffer.from(base64, "base64");

  // Compress with sharp: resize to 800x450, JPEG
  let compressed = await sharp(rawBuffer)
    .resize(COVER_MAX_WIDTH, COVER_MAX_HEIGHT, { fit: "cover" })
    .jpeg({ quality: COVER_QUALITY })
    .toBuffer();

  // If still too large, reduce quality
  if (compressed.length > COVER_MAX_PAYLOAD) {
    compressed = await sharp(rawBuffer)
      .resize(COVER_MAX_WIDTH, COVER_MAX_HEIGHT, { fit: "cover" })
      .jpeg({ quality: 50 })
      .toBuffer();
  }

  return new Uint8Array(compressed);
}

function safeExpiresIn(expiresIn: number): number {
  const floored = Math.floor(expiresIn);
  return floored % 2 === 0 ? floored : floored + 1;
}

/** Generate and store cover images for events, return map of eventKey → coverImageKey */
export async function createCoverImages(
  events: Array<{
    entityKey: Hex;
    ownerWallet: SeedWallet;
    title: string;
    category: string;
    description: string;
  }>
): Promise<Map<string, Hex>> {
  const coverMap = new Map<string, Hex>();

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const client = createSeedWalletClient(event.ownerWallet);

    try {
      console.log(`  [${i + 1}/${events.length}] Generating image for "${event.title}"...`);
      const imageData = await generateAndCompressImage(
        event.title,
        event.description,
        event.category
      );

      const { entityKey: coverKey } = await client.createEntity({
        payload: imageData,
        contentType: "image/jpeg",
        attributes: [
          { key: "app", value: APP_ID },
          { key: "type", value: "cover-image" },
          { key: "eventKey", value: event.entityKey },
        ],
        expiresIn: safeExpiresIn(ExpirationTime.fromYears(1)),
      });

      coverMap.set(event.entityKey, coverKey);
      console.log(`  [${i + 1}/${events.length}] Cover image → ${coverKey} (${(imageData.length / 1024).toFixed(0)}KB)`);
    } catch (err: any) {
      console.warn(`  [${i + 1}/${events.length}] SKIP cover for "${event.title}": ${err.message}`);
    }
  }

  return coverMap;
}

/** Update events with coverImageKey in their payload */
export async function linkCoverImages(
  events: Array<{
    entityKey: Hex;
    ownerWallet: SeedWallet;
    originalPayload: any;
    originalAttributes: Array<{ key: string; value: string | number }>;
    originalExpiresIn: number;
  }>,
  coverMap: Map<string, Hex>
): Promise<number> {
  let linked = 0;

  for (const event of events) {
    const coverKey = coverMap.get(event.entityKey);
    if (!coverKey) continue;

    const client = createSeedWalletClient(event.ownerWallet);

    try {
      const { jsonToPayload } = await import("@arkiv-network/sdk/utils");
      await client.updateEntity({
        entityKey: event.entityKey,
        payload: jsonToPayload({
          ...event.originalPayload,
          coverImageKey: coverKey,
        }),
        contentType: "application/json",
        attributes: event.originalAttributes,
        expiresIn: event.originalExpiresIn,
      });
      linked++;
    } catch (err: any) {
      console.warn(`  Failed to link cover to event ${event.entityKey}: ${err.message}`);
    }
  }

  return linked;
}
