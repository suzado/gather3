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
    const { title, description, category } = await req.json();

    if (!title) {
      return NextResponse.json(
        { error: "Event title is required" },
        { status: 400 }
      );
    }

    const prompt = buildPrompt(title, description, category);

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

function buildPrompt(
  title: string,
  description: string,
  category: string
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

  return `Create a modern, visually striking event cover image for ${categoryContext}. The event is titled "${title}". ${description ? `Event description: "${description.slice(0, 200)}".` : ""} Style: Clean, modern design with subtle gradients. Dark background with purple/violet and blue accent colors. Abstract and atmospheric — no text, no logos, no specific faces. Think of a premium tech event banner that feels futuristic and inviting.`;
}
