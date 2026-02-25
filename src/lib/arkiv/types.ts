import type { Hex } from "viem";
import type {
  EventCategory,
  EventStatus,
  LocationType,
  RsvpStatus,
} from "@/lib/utils/constants";

// --- Payload Types (stored as JSON in entity payload) ---

export interface OrganizerPayload {
  name: string;
  bio: string;
  avatarUrl?: string;
  website?: string;
  twitter?: string;
}

export interface EventPayload {
  title: string;
  description: string;
  location: string;
  venue?: string;
  imageUrl?: string;
  coverImageKey?: string; // entityKey of Arkiv image entity
  startDate: number; // unix timestamp
  endDate: number;
  timezone: string;
  capacity: number;
  tags: string[];
  externalUrl?: string;
}

export interface RsvpPayload {
  displayName: string;
  message?: string;
}

export interface AttendancePayload {
  checkedInAt: number;
  note?: string;
}

// --- Parsed Entity Types (entity + decoded payload + attributes) ---

export interface OrganizerEntity {
  entityKey: Hex;
  owner: Hex;
  name: string;
  bio: string;
  avatarUrl?: string;
  website?: string;
  twitter?: string;
  wallet: string;
  createdAt: number;
}

export interface EventEntity {
  entityKey: Hex;
  owner: Hex;
  title: string;
  description: string;
  location: string;
  venue?: string;
  imageUrl?: string;
  coverImageKey?: string;
  startDate: number;
  endDate: number;
  timezone: string;
  capacity: number;
  tags: string[];
  externalUrl?: string;
  organizerKey: string;
  status: EventStatus;
  category: EventCategory;
  locationType: LocationType;
  city: string;
  rsvpCount?: number;
}

export interface RsvpEntity {
  entityKey: Hex;
  owner: Hex;
  displayName: string;
  message?: string;
  eventKey: string;
  status: RsvpStatus;
  rsvpDate: number;
  attendeeWallet: string;
}

export interface AttendanceEntity {
  entityKey: Hex;
  owner: Hex;
  checkedInAt: number;
  note?: string;
  eventKey: string;
  attendeeWallet: string;
}

// --- Query Filter Types ---

export interface EventFilters {
  category?: EventCategory;
  locationType?: LocationType;
  status?: EventStatus;
  city?: string;
  startDateAfter?: number;
  startDateBefore?: number;
  organizerKey?: string;
  ownerWallet?: Hex;
}
