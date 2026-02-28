import { jsonToPayload, ExpirationTime } from "@arkiv-network/sdk/utils";
import type { Hex } from "viem";
import { APP_ID, ENTITY_TYPES } from "./config";
import type { SeedWallet } from "./wallets";
import { createSeedWalletClient } from "./wallets";
import type { GeneratedOrganizer, GeneratedEvent } from "./generate";

// SDK divides expiresIn by BLOCK_TIME (2) internally, so odd values cause
// a BigInt conversion error. Round up to the nearest even number.
function safeExpiresIn(expiresIn: number): number {
  const floored = Math.floor(expiresIn);
  return floored % 2 === 0 ? floored : floored + 1;
}

function nowUnix(): number {
  return Math.floor(Date.now() / 1000);
}

// --- Organizer creation ---

export interface CreatedOrganizer {
  entityKey: Hex;
  wallet: SeedWallet;
  name: string;
}

export async function createOrganizers(
  wallets: SeedWallet[],
  profiles: GeneratedOrganizer[]
): Promise<CreatedOrganizer[]> {
  const created: CreatedOrganizer[] = [];

  for (let i = 0; i < Math.min(wallets.length, profiles.length); i++) {
    const wallet = wallets[i];
    const profile = profiles[i];
    const client = createSeedWalletClient(wallet);

    try {
      const { entityKey } = await client.createEntity({
        payload: jsonToPayload({
          name: profile.name,
          bio: profile.bio,
          avatarUrl: profile.avatarUrl,
          website: profile.website,
          twitter: profile.twitter,
        }),
        contentType: "application/json",
        attributes: [
          { key: "app", value: APP_ID },
          { key: "type", value: ENTITY_TYPES.organizer },
          { key: "wallet", value: wallet.address.toLowerCase() },
          { key: "name", value: profile.name },
          { key: "createdAt", value: nowUnix() },
        ],
        expiresIn: ExpirationTime.fromYears(1),
      });

      created.push({ entityKey, wallet, name: profile.name });
      console.log(`  [${i + 1}/${profiles.length}] Organizer "${profile.name}" → ${entityKey}`);
    } catch (err: any) {
      console.error(`  [${i + 1}/${profiles.length}] FAILED organizer "${profile.name}": ${err.message}`);
    }
  }

  return created;
}

// --- Event creation ---

export interface CreatedEvent {
  entityKey: Hex;
  organizerKey: Hex;
  ownerWallet: SeedWallet;
  title: string;
  description: string;
  category: string;
  endDate: number;
  capacity: number;
  // Stored for cover image linking (updateEntity needs the full payload/attrs)
  originalPayload: any;
  originalAttributes: Array<{ key: string; value: string | number }>;
  originalExpiresIn: number;
}

export async function createEvents(
  organizers: CreatedOrganizer[],
  events: GeneratedEvent[]
): Promise<CreatedEvent[]> {
  const created: CreatedEvent[] = [];
  const BUFFER_DAYS = 30;

  // Distribute events across organizers
  let orgIdx = 0;
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const organizer = organizers[orgIdx % organizers.length];
    orgIdx++;

    const client = createSeedWalletClient(organizer.wallet);
    const expirationDate = new Date((event.endDate + BUFFER_DAYS * 86400) * 1000);
    const city = event.city || event.location.split(",")[0].trim();

    const payload = {
      title: event.title,
      description: event.description,
      location: event.location,
      venue: event.venue,
      startDate: event.startDate,
      endDate: event.endDate,
      timezone: event.timezone,
      capacity: event.capacity,
      tags: event.tags,
      externalUrl: event.externalUrl,
    };
    const attributes: Array<{ key: string; value: string | number }> = [
      { key: "app", value: APP_ID },
      { key: "type", value: ENTITY_TYPES.event },
      { key: "organizerKey", value: organizer.entityKey },
      { key: "status", value: "upcoming" },
      { key: "category", value: event.category },
      { key: "locationType", value: event.locationType },
      { key: "startDate", value: event.startDate },
      { key: "endDate", value: event.endDate },
      { key: "capacity", value: event.capacity },
      { key: "city", value: city },
    ];
    const expiresIn = safeExpiresIn(ExpirationTime.fromDate(expirationDate));

    try {
      const { entityKey } = await client.createEntity({
        payload: jsonToPayload(payload),
        contentType: "application/json",
        attributes,
        expiresIn,
      });

      created.push({
        entityKey,
        organizerKey: organizer.entityKey,
        ownerWallet: organizer.wallet,
        title: event.title,
        description: event.description,
        category: event.category,
        endDate: event.endDate,
        capacity: event.capacity,
        originalPayload: payload,
        originalAttributes: attributes,
        originalExpiresIn: expiresIn,
      });
      console.log(`  [${i + 1}/${events.length}] Event "${event.title}" → ${entityKey}`);
    } catch (err: any) {
      console.error(`  [${i + 1}/${events.length}] FAILED event "${event.title}": ${err.message}`);
    }
  }

  return created;
}

// --- RSVP creation ---

export interface CreatedRsvp {
  entityKey: Hex;
  eventKey: Hex;
  attendeeWallet: string;
}

export async function createRsvps(
  allWallets: SeedWallet[],
  events: CreatedEvent[],
  rsvpsMin: number,
  rsvpsMax: number
): Promise<CreatedRsvp[]> {
  const created: CreatedRsvp[] = [];
  const BUFFER_DAYS = 7;

  for (const wallet of allWallets) {
    // Pick random number of events to RSVP to
    const count = rsvpsMin + Math.floor(Math.random() * (rsvpsMax - rsvpsMin + 1));

    // Filter out events owned by this wallet, then pick random ones
    const available = events.filter(
      (e) => e.ownerWallet.address.toLowerCase() !== wallet.address.toLowerCase()
    );
    const shuffled = available.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(count, shuffled.length));

    const client = createSeedWalletClient(wallet);
    const shortAddr = `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`;

    for (const event of selected) {
      const expirationDate = new Date((event.endDate + BUFFER_DAYS * 86400) * 1000);

      try {
        const { entityKey } = await client.createEntity({
          payload: jsonToPayload({
            displayName: shortAddr,
            message: undefined,
          }),
          contentType: "application/json",
          attributes: [
            { key: "app", value: APP_ID },
            { key: "type", value: ENTITY_TYPES.rsvp },
            { key: "eventKey", value: event.entityKey },
            { key: "status", value: "confirmed" },
            { key: "rsvpDate", value: nowUnix() },
            { key: "attendeeWallet", value: wallet.address.toLowerCase() },
          ],
          expiresIn: safeExpiresIn(ExpirationTime.fromDate(expirationDate)),
        });

        created.push({
          entityKey,
          eventKey: event.entityKey,
          attendeeWallet: wallet.address,
        });
      } catch (err: any) {
        // Silently skip individual RSVP failures to keep noise low
      }
    }

    console.log(
      `  RSVPs for ${shortAddr}: ${selected.length} events`
    );
  }

  return created;
}
