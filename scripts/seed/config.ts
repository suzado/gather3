import { kaolin, mendoza } from "@arkiv-network/sdk/chains";

// --- Chain ---
// Note: env vars are read at import time, before dotenv loads.
// Set ARKIV_CHAIN in your shell, or rely on the default (kaolin).
const chains = { kaolin, mendoza } as const;
type ChainName = keyof typeof chains;
const envChain = (process.env.ARKIV_CHAIN ?? process.env.NEXT_PUBLIC_ARKIV_CHAIN) as ChainName | undefined;
export const chain = chains[envChain ?? "kaolin"];

// --- App ---
export const APP_ID = "gather3.club";

// --- Scale ---
export const ORGANIZER_COUNT = 15;
export const EXTRA_ATTENDEE_COUNT = 15;
export const TOTAL_WALLETS = ORGANIZER_COUNT + EXTRA_ATTENDEE_COUNT;
export const EVENTS_MIN = 1;
export const EVENTS_MAX = 3;
export const TARGET_EVENTS = 25;
export const RSVPS_MIN = 2;
export const RSVPS_MAX = 4;

// --- Entity types ---
export const ENTITY_TYPES = {
  organizer: "organizer",
  event: "event",
  rsvp: "rsvp",
  attendance: "attendance",
} as const;

// --- Event categories & location types ---
export const EVENT_CATEGORIES = [
  "conference",
  "meetup",
  "workshop",
  "hackathon",
  "social",
] as const;

export const LOCATION_TYPES = ["in-person", "online", "hybrid"] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];
export type LocationType = (typeof LOCATION_TYPES)[number];
