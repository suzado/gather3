import type { Metadata } from "next";
import { getOrganizerByWallet } from "@/lib/arkiv/organizer";
import OrganizerProfileClient from "./OrganizerProfileClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ wallet: string }>;
}): Promise<Metadata> {
  const { wallet } = await params;
  const organizer = await getOrganizerByWallet(wallet);

  if (!organizer) {
    return { title: "Organizer not found — Gather3" };
  }

  const description = organizer.bio
    ? organizer.bio.slice(0, 160)
    : `${organizer.name} — Event organizer on Gather3`;

  return {
    title: `${organizer.name} — Gather3`,
    description,
    openGraph: {
      title: organizer.name,
      description,
      type: "profile",
      siteName: "Gather3",
    },
    twitter: {
      card: "summary_large_image",
      title: organizer.name,
      description,
    },
  };
}

export default function OrganizerProfilePage({
  params,
}: {
  params: Promise<{ wallet: string }>;
}) {
  return <OrganizerProfileClient params={params} />;
}
