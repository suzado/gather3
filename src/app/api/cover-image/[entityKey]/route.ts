import { NextResponse } from "next/server";
import type { Hex } from "viem";
import { getCoverImage } from "@/lib/arkiv/images";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ entityKey: string }> }
) {
  const { entityKey } = await params;

  try {
    const data = await getCoverImage(entityKey as Hex);

    if (!data) {
      return new NextResponse(null, { status: 404 });
    }

    return new NextResponse(Buffer.from(data), {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}
