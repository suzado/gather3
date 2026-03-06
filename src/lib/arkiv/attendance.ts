import { jsonToPayload } from "@arkiv-network/sdk/utils";
import { ExpirationTime } from "@arkiv-network/sdk/utils";
import { eq } from "@arkiv-network/sdk/query";
import { desc } from "@arkiv-network/sdk/query";
import { arkivPublic } from "./client";
import { trackedFetch } from "./rpcTracker";
import type { ArkivWalletClient } from "./client";
import type { AttendancePayload, AttendanceEntity } from "./types";
import type { Hex } from "viem";
import { APP_ID } from "@/lib/utils/constants";

const ENTITY_TYPE = "attendance";

export async function checkInAttendee(
  walletClient: ArkivWalletClient,
  eventKey: Hex,
  attendeeWallet: string
) {
  const payload: AttendancePayload = {
    checkedInAt: Math.floor(Date.now() / 1000),
  };

  const { entityKey, txHash } = await walletClient.createEntity({
    payload: jsonToPayload(payload),
    contentType: "application/json",
    attributes: [
      { key: "app", value: APP_ID },
      { key: "type", value: ENTITY_TYPE },
      { key: "eventKey", value: eventKey },
      { key: "attendeeWallet", value: attendeeWallet.toLowerCase() },
      { key: "checkedInAt", value: payload.checkedInAt },
    ],
    expiresIn: ExpirationTime.fromMonths(6),
  });

  return { entityKey, txHash };
}

export async function getAttendanceForEvent(
  eventKey: Hex
): Promise<AttendanceEntity[]> {
  const result = await trackedFetch(
    arkivPublic
      .buildQuery()
      .where([
        eq("app", APP_ID),
        eq("type", ENTITY_TYPE),
        eq("eventKey", eventKey),
      ])
      .withAttributes(true)
      .withPayload(true)
      .orderBy(desc("checkedInAt", "number"))
      .fetch()
  );

  return result.entities.map(parseAttendanceEntity);
}

export async function hasAttendeeCheckedIn(
  eventKey: Hex,
  attendeeWallet: string
): Promise<boolean> {
  const result = await trackedFetch(
    arkivPublic
      .buildQuery()
      .where([
        eq("app", APP_ID),
        eq("type", ENTITY_TYPE),
        eq("eventKey", eventKey),
        eq("attendeeWallet", attendeeWallet.toLowerCase()),
      ])
      .fetch()
  );

  return result.entities.length > 0;
}

export async function getAttendanceCount(eventKey: Hex): Promise<number> {
  return trackedFetch(
    arkivPublic
      .buildQuery()
      .where([
        eq("app", APP_ID),
        eq("type", ENTITY_TYPE),
        eq("eventKey", eventKey),
      ])
      .count()
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseAttendanceEntity(entity: any): AttendanceEntity {
  const data = entity.toJson() as AttendancePayload;
  const attrs = Object.fromEntries(
    entity.attributes.map((a: { key: string; value: string | number }) => [a.key, a.value])
  );

  return {
    entityKey: entity.key,
    owner: entity.owner,
    checkedInAt: data.checkedInAt,
    note: data.note,
    eventKey: attrs.eventKey as string,
    attendeeWallet: attrs.attendeeWallet as string,
  };
}
