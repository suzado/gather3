import { jsonToPayload } from "@arkiv-network/sdk/utils";
import { ExpirationTime } from "@arkiv-network/sdk/utils";
import { eq } from "@arkiv-network/sdk/query";
import { desc } from "@arkiv-network/sdk/query";
import { arkivPublic } from "./client";
import { trackedFetch } from "./rpcTracker";
import type { ArkivWalletClient } from "./client";
import type { RsvpPayload, RsvpEntity, EventEntity } from "./types";
import type { RsvpStatus } from "@/lib/utils/constants";
import type { Hex } from "viem";
import { nowUnix } from "@/lib/utils/dates";
import { getEvent } from "./events";
import { APP_ID } from "@/lib/utils/constants";

const ENTITY_TYPE = "rsvp";
const BUFFER_DAYS = 7;

export async function createRsvp(
  walletClient: ArkivWalletClient,
  eventKey: Hex,
  displayName: string,
  message: string,
  attendeeWallet: string
) {
  // Get event to determine expiration
  const event = await getEvent(eventKey);
  if (!event) throw new Error("Event not found");

  const expirationDate = new Date((event.endDate + BUFFER_DAYS * 86400) * 1000);

  const payload: RsvpPayload = {
    displayName,
    message: message || undefined,
  };

  const { entityKey, txHash } = await walletClient.createEntity({
    payload: jsonToPayload(payload),
    contentType: "application/json",
    attributes: [
      { key: "app", value: APP_ID },
      { key: "type", value: ENTITY_TYPE },
      { key: "eventKey", value: eventKey },
      { key: "status", value: "confirmed" as RsvpStatus },
      { key: "rsvpDate", value: nowUnix() },
      { key: "attendeeWallet", value: attendeeWallet.toLowerCase() },
    ],
    expiresIn: ExpirationTime.fromDate(expirationDate),
  });

  return { entityKey, txHash };
}

export async function cancelRsvp(
  walletClient: ArkivWalletClient,
  entityKey: Hex
) {
  const { txHash } = await walletClient.deleteEntity({ entityKey });
  return { txHash };
}

export async function getRsvpsForEvent(
  eventKey: Hex,
  limit = 100
): Promise<RsvpEntity[]> {
  const result = await trackedFetch(
    arkivPublic
      .buildQuery()
      .where([
        eq("app", APP_ID),
        eq("type", ENTITY_TYPE),
        eq("eventKey", eventKey),
        eq("status", "confirmed"),
      ])
      .withAttributes(true)
      .withPayload(true)
      .withMetadata(true)
      .orderBy(desc("rsvpDate", "number"))
      .fetch()
  );

  return result.entities.map(parseRsvpEntity);
}

export async function getMyRsvps(
  walletAddress: string,
  limit = 50
): Promise<RsvpEntity[]> {
  const result = await trackedFetch(
    arkivPublic
      .buildQuery()
      .where([
        eq("app", APP_ID),
        eq("type", ENTITY_TYPE),
        eq("attendeeWallet", walletAddress.toLowerCase()),
        eq("status", "confirmed"),
      ])
      .withAttributes(true)
      .withPayload(true)
      .withMetadata(true)
      .orderBy(desc("rsvpDate", "number"))
      .fetch()
  );

  return result.entities.map(parseRsvpEntity);
}

export async function hasUserRsvpd(
  eventKey: Hex,
  walletAddress: string
): Promise<RsvpEntity | null> {
  const result = await trackedFetch(
    arkivPublic
      .buildQuery()
      .where([
        eq("app", APP_ID),
        eq("type", ENTITY_TYPE),
        eq("eventKey", eventKey),
        eq("attendeeWallet", walletAddress.toLowerCase()),
        eq("status", "confirmed"),
      ])
      .withAttributes(true)
      .withPayload(true)
      .fetch()
  );

  if (result.entities.length === 0) return null;
  return parseRsvpEntity(result.entities[0]);
}

export async function queryRecentRsvps(limit = 10): Promise<RsvpEntity[]> {
  const result = await trackedFetch(
    arkivPublic
      .buildQuery()
      .where([
        eq("app", APP_ID),
        eq("type", ENTITY_TYPE),
        eq("status", "confirmed"),
      ])
      .withAttributes(true)
      .withPayload(true)
      .withMetadata(true)
      .orderBy(desc("rsvpDate", "number"))
      .fetch()
  );

  return result.entities.map(parseRsvpEntity);
}

export async function getRsvpCount(eventKey: Hex): Promise<number> {
  return trackedFetch(
    arkivPublic
      .buildQuery()
      .where([
        eq("app", APP_ID),
        eq("type", ENTITY_TYPE),
        eq("eventKey", eventKey),
        eq("status", "confirmed"),
      ])
      .count()
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseRsvpEntity(entity: any): RsvpEntity {
  const data = entity.toJson() as RsvpPayload;
  const attrs = Object.fromEntries(
    entity.attributes.map((a: { key: string; value: string | number }) => [a.key, a.value])
  );

  return {
    entityKey: entity.key,
    owner: entity.owner,
    displayName: data.displayName,
    message: data.message,
    eventKey: attrs.eventKey as string,
    status: attrs.status as RsvpStatus,
    rsvpDate: attrs.rsvpDate as number,
    attendeeWallet: attrs.attendeeWallet as string,
  };
}
