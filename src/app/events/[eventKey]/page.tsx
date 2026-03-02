import type { Metadata } from "next";
import type { Hex } from "viem";
import { getEvent } from "@/lib/arkiv/events";
import EventDetailClient from "./EventDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ eventKey: string }>;
}): Promise<Metadata> {
  const { eventKey } = await params;
  const event = await getEvent(eventKey as Hex);

  if (!event) {
    return { title: "Event not found — Gather3" };
  }

  const description = event.description
    ? event.description.slice(0, 160)
    : `${event.title} — ${event.location}`;

  const images = event.coverImageKey
    ? [{ url: `/api/cover-image/${event.coverImageKey}`, width: 800, height: 450 }]
    : undefined;

  return {
    title: `${event.title} — Gather3`,
    description,
    openGraph: {
      title: event.title,
      description,
      type: "website",
      siteName: "Gather3",
      ...(images && { images }),
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description,
      ...(images && { images }),
    },
  };
}

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ eventKey: string }>;
}) {
  return <EventDetailClient params={params} />;
}
