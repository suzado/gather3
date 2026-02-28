import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI API key not configured" },
      { status: 503 }
    );
  }

  try {
    const { title, description, category, style } = await req.json();

    if (!title) {
      return NextResponse.json(
        { error: "Event title is required" },
        { status: 400 }
      );
    }

    const prompt = buildPrompt(title, description, category, style);

    const response = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
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
      }
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error("OpenAI API error:", errData);
      return NextResponse.json(
        {
          error:
            errData?.error?.message || "Image generation failed",
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const imageBase64 = data.data[0].b64_json;

    return NextResponse.json({ imageBase64 });
  } catch (err) {
    console.error("Generate cover error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const IMAGE_STYLES = {
  "dark-futuristic": {
    label: "Dark & Futuristic",
    prompt:
      "Dark background with purple/violet and blue accent colors. Subtle gradients and glowing neon elements. Futuristic and inviting atmosphere.",
  },
  "colorful-vibrant": {
    label: "Colorful & Vibrant",
    prompt:
      "Bold, vivid color palette with energetic gradients. Warm and cool tones blending together. Lively and dynamic feel.",
  },
  "minimal-clean": {
    label: "Minimal & Clean",
    prompt:
      "Minimalist composition with plenty of negative space. Soft, muted tones. Elegant and understated with geometric accents.",
  },
  "abstract-artistic": {
    label: "Abstract & Artistic",
    prompt:
      "Expressive abstract shapes and textures. Painterly or generative-art feel with rich layering. Bold and creative.",
  },
  "nature-organic": {
    label: "Nature & Organic",
    prompt:
      "Organic forms, soft light, and nature-inspired palette. Earthy greens, warm golds, and gentle gradients. Calm and welcoming.",
  },
  anime: {
    label: "Anime",
    prompt:
      "Anime and manga-inspired art style. Vivid saturated colors, dramatic lighting with lens flares, cel-shaded look. Dynamic composition with speed lines or sparkles.",
  },
  cyberpunk: {
    label: "Cyberpunk",
    prompt:
      "Cyberpunk aesthetic with neon pink, cyan, and electric blue lights. Rain-soaked city reflections, holographic elements, glitch effects. Gritty yet high-tech atmosphere.",
  },
  retro: {
    label: "Retro",
    prompt:
      "Retro 80s/90s aesthetic with synthwave sunset gradients, chrome reflections, and grid lines. Warm pink, orange, and purple tones. Nostalgic and stylized.",
  },
  "pixel-art": {
    label: "Pixel Art",
    prompt:
      "Pixel art style with clearly visible pixels and limited color palette. Retro game-inspired composition with dithering effects. Charming and nostalgic 16-bit era feel.",
  },
} as const;

export type ImageStyleKey = keyof typeof IMAGE_STYLES;

function buildPrompt(
  title: string,
  description: string,
  category: string,
  style?: string
): string {
  const categoryDescriptions: Record<string, string> = {
    conference:
      "a professional technology conference with stages and screens",
    meetup: "a casual community meetup gathering",
    workshop: "a hands-on learning workshop with collaboration",
    hackathon: "an energetic coding hackathon with developers",
    social: "a vibrant social networking event",
  };

  const categoryContext =
    categoryDescriptions[category] || "a community event";

  const styleKey = (style && style in IMAGE_STYLES ? style : "dark-futuristic") as ImageStyleKey;
  const stylePrompt = IMAGE_STYLES[styleKey].prompt;

  return `Create a modern, visually striking event cover image for ${categoryContext}. The event is titled "${title}". ${description ? `Event description: "${description.slice(0, 200)}".` : ""} Style: Clean, modern design. ${stylePrompt} Abstract and atmospheric. IMPORTANT: Do not include any text, words, letters, numbers, watermarks, or typography anywhere in the image. No logos, no specific faces. Think of a premium tech event banner.`;
}
