import { jsonToPayload } from "@arkiv-network/sdk/utils";
import { ExpirationTime } from "@arkiv-network/sdk/utils";
import { eq, gt, lt, or } from "@arkiv-network/sdk/query";
import { desc } from "@arkiv-network/sdk/query";
import { arkivPublic } from "./client";
import { trackedFetch } from "./rpcTracker";
import type { ArkivWalletClient } from "./client";
import type {
  EventPayload,
  EventEntity,
  EventFilters,
} from "./types";
import type { EventStatus, EventCategory, LocationType } from "@/lib/utils/constants";
import type { Hex } from "viem";
import { nowUnix } from "@/lib/utils/dates";
import { APP_ID } from "@/lib/utils/constants";

const ENTITY_TYPE = "event";
const BUFFER_DAYS = 30;

// SDK divides expiresIn by BLOCK_TIME (2) internally, so odd values cause
// a BigInt conversion error. Round up to the nearest even number.
function safeExpiresIn(expiresIn: number): number {
  const floored = Math.floor(expiresIn);
  return floored % 2 === 0 ? floored : floored + 1;
}

export async function createEvent(
  walletClient: ArkivWalletClient,
  data: EventPayload,
  organizerKey: string,
  category: string,
  locationType: string,
  city: string
) {
  const expirationDate = new Date((data.endDate + BUFFER_DAYS * 86400) * 1000);

  const { entityKey, txHash } = await walletClient.createEntity({
    payload: jsonToPayload(data),
    contentType: "application/json",
    attributes: [
      { key: "app", value: APP_ID },
      { key: "type", value: ENTITY_TYPE },
      { key: "organizerKey", value: organizerKey },
      { key: "status", value: "upcoming" as EventStatus },
      { key: "category", value: category },
      { key: "locationType", value: locationType },
      { key: "startDate", value: data.startDate },
      { key: "endDate", value: data.endDate },
      { key: "capacity", value: data.capacity },
      { key: "city", value: city },
    ],
    expiresIn: safeExpiresIn(ExpirationTime.fromDate(expirationDate)),
  });

  return { entityKey, txHash };
}

export async function updateEvent(
  walletClient: ArkivWalletClient,
  entityKey: Hex,
  data: EventPayload,
  organizerKey: string,
  status: EventStatus,
  category: string,
  locationType: string,
  city: string
) {
  const expirationDate = new Date((data.endDate + BUFFER_DAYS * 86400) * 1000);

  const { txHash } = await walletClient.updateEntity({
    entityKey,
    payload: jsonToPayload(data),
    contentType: "application/json",
    attributes: [
      { key: "app", value: APP_ID },
      { key: "type", value: ENTITY_TYPE },
      { key: "organizerKey", value: organizerKey },
      { key: "status", value: status },
      { key: "category", value: category },
      { key: "locationType", value: locationType },
      { key: "startDate", value: data.startDate },
      { key: "endDate", value: data.endDate },
      { key: "capacity", value: data.capacity },
      { key: "city", value: city },
    ],
    expiresIn: safeExpiresIn(ExpirationTime.fromDate(expirationDate)),
  });

  return { txHash };
}

export async function updateEventStatus(
  walletClient: ArkivWalletClient,
  entityKey: Hex,
  newStatus: EventStatus
) {
  const entity = await trackedFetch(arkivPublic.getEntity(entityKey));
  const data = entity.toJson() as EventPayload;
  const attrs = Object.fromEntries(
    entity.attributes.map((a: { key: string; value: string | number }) => [a.key, a.value])
  );

  const expirationDate = new Date((data.endDate + BUFFER_DAYS * 86400) * 1000);

  const { txHash } = await walletClient.updateEntity({
    entityKey,
    payload: jsonToPayload(data),
    contentType: "application/json",
    attributes: [
      { key: "app", value: APP_ID },
      { key: "type", value: ENTITY_TYPE },
      { key: "organizerKey", value: attrs.organizerKey as string },
      { key: "status", value: newStatus },
      { key: "category", value: attrs.category as string },
      { key: "locationType", value: attrs.locationType as string },
      { key: "startDate", value: attrs.startDate as number },
      { key: "endDate", value: attrs.endDate as number },
      { key: "capacity", value: attrs.capacity as number },
      { key: "city", value: attrs.city as string },
    ],
    expiresIn: safeExpiresIn(ExpirationTime.fromDate(expirationDate)),
  });

  return { txHash };
}

export async function deleteEvent(
  walletClient: ArkivWalletClient,
  entityKey: Hex
) {
  const { txHash } = await walletClient.deleteEntity({ entityKey });
  return { txHash };
}

export async function transferEvent(
  walletClient: ArkivWalletClient,
  entityKey: Hex,
  newOwner: Hex
) {
  const { txHash } = await walletClient.changeOwnership({
    entityKey,
    newOwner,
  });
  return { txHash };
}

export async function getEvent(
  entityKey: Hex
): Promise<EventEntity | null> {
  try {
    const entity = await trackedFetch(arkivPublic.getEntity(entityKey));
    return parseEventEntity(entity);
  } catch {
    return null;
  }
}

export async function queryEvents(
  filters: EventFilters = {},
  limit = 20
): Promise<EventEntity[]> {
  const predicates = [eq("app", APP_ID), eq("type", ENTITY_TYPE)];

  if (filters.category) predicates.push(eq("category", filters.category));
  if (filters.locationType) predicates.push(eq("locationType", filters.locationType));
  if (filters.status) predicates.push(eq("status", filters.status));
  if (filters.city) predicates.push(eq("city", filters.city));
  if (filters.organizerKey) predicates.push(eq("organizerKey", filters.organizerKey));
  if (filters.startDateAfter) predicates.push(gt("startDate", filters.startDateAfter));
  if (filters.startDateBefore) predicates.push(lt("startDate", filters.startDateBefore));

  let query = arkivPublic
    .buildQuery()
    .where(predicates)
    .withAttributes(true)
    .withPayload(true)
    .withMetadata(true)
    .orderBy(desc("startDate", "number"));

  if (filters.ownerWallet) {
    query = query.ownedBy(filters.ownerWallet);
  }

  const result = await trackedFetch(query.fetch());
  return result.entities.map(parseEventEntity).slice(0, limit);
}

export async function queryUpcomingEvents(limit = 20): Promise<EventEntity[]> {
  return queryEvents(
    {
      status: "upcoming",
      startDateAfter: nowUnix(),
    },
    limit
  );
}

export async function queryLiveEvents(limit = 20): Promise<EventEntity[]> {
  return queryEvents({ status: "live" }, limit);
}

export async function getRsvpCount(eventKey: Hex): Promise<number> {
  return trackedFetch(
    arkivPublic
      .buildQuery()
      .where([eq("app", APP_ID), eq("type", "rsvp"), eq("eventKey", eventKey), eq("status", "confirmed")])
      .count()
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseEventEntity(entity: any): EventEntity {
  const data = entity.toJson() as EventPayload;
  const attrs = Object.fromEntries(
    entity.attributes.map((a: { key: string; value: string | number }) => [a.key, a.value])
  );

  return {
    entityKey: entity.key,
    owner: entity.owner,
    title: data.title ?? "Untitled Event",
    description: data.description ?? "",
    location: data.location ?? attrs.location as string ?? "",
    venue: data.venue,
    imageUrl: data.imageUrl,
    coverImageKey: data.coverImageKey,
    startDate: data.startDate ?? (attrs.startDate as number) ?? (attrs.event_timestamp as number) ?? 0,
    endDate: data.endDate ?? (attrs.endDate as number) ?? 0,
    timezone: data.timezone ?? "",
    capacity: data.capacity ?? (attrs.capacity as number) ?? 0,
    tags: data.tags ?? [],
    externalUrl: data.externalUrl,
    socialLinks: data.socialLinks,
    organizerKey: (attrs.organizerKey as string) ?? "",
    status: (attrs.status as EventStatus) ?? "upcoming",
    category: (attrs.category as EventCategory) ?? "meetup",
    locationType: (attrs.locationType as LocationType) ?? "in-person",
    city: (attrs.city as string) ?? "",
  };
}
