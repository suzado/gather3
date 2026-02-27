import { arkivChain } from "@/lib/wallet/config";

export const APP_ID = "gather3.club";
export const FAUCET_URL = `https://${arkivChain.network}.hoodi.arkiv.network/faucet/`;

export const EVENT_CATEGORIES = [
  { value: "conference", label: "Conference", icon: "Presentation" },
  { value: "meetup", label: "Meetup", icon: "Users" },
  { value: "workshop", label: "Workshop", icon: "Wrench" },
  { value: "hackathon", label: "Hackathon", icon: "Code" },
  { value: "social", label: "Social", icon: "PartyPopper" },
] as const;

export const LOCATION_TYPES = [
  { value: "in-person", label: "In Person", icon: "MapPin" },
  { value: "online", label: "Online", icon: "Globe" },
  { value: "hybrid", label: "Hybrid", icon: "Monitor" },
] as const;

export const EVENT_STATUSES = [
  { value: "upcoming", label: "Upcoming", color: "blue" },
  { value: "live", label: "Live", color: "green" },
  { value: "ended", label: "Ended", color: "gray" },
  { value: "cancelled", label: "Cancelled", color: "red" },
] as const;

export const RSVP_STATUSES = [
  { value: "confirmed", label: "Confirmed" },
  { value: "waitlisted", label: "Waitlisted" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number]["value"];
export type LocationType = (typeof LOCATION_TYPES)[number]["value"];
export type EventStatus = (typeof EVENT_STATUSES)[number]["value"];
export type RsvpStatus = (typeof RSVP_STATUSES)[number]["value"];

// Cover image constraints
export const COVER_IMAGE_MAX_WIDTH = 800;
export const COVER_IMAGE_MAX_HEIGHT = 450;
export const COVER_IMAGE_QUALITY = 0.75;
export const COVER_IMAGE_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB input limit
export const COVER_IMAGE_MAX_PAYLOAD_SIZE = 80 * 1024; // 80KB target after resize
