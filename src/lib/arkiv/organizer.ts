import { jsonToPayload } from "@arkiv-network/sdk/utils";
import { ExpirationTime } from "@arkiv-network/sdk/utils";
import { eq } from "@arkiv-network/sdk/query";
import { arkivPublic } from "./client";
import type { ArkivWalletClient } from "./client";
import type { OrganizerPayload, OrganizerEntity } from "./types";
import type { Hex } from "viem";
import { nowUnix } from "@/lib/utils/dates";

const ENTITY_TYPE = "organizer";

export async function createOrganizer(
  walletClient: ArkivWalletClient,
  data: OrganizerPayload,
  walletAddress: string
) {
  const payload: OrganizerPayload = {
    name: data.name,
    bio: data.bio,
    avatarUrl: data.avatarUrl,
    website: data.website,
    twitter: data.twitter,
  };

  const { entityKey, txHash } = await walletClient.createEntity({
    payload: jsonToPayload(payload),
    contentType: "application/json",
    attributes: [
      { key: "type", value: ENTITY_TYPE },
      { key: "wallet", value: walletAddress.toLowerCase() },
      { key: "name", value: data.name },
      { key: "createdAt", value: nowUnix() },
    ],
    expiresIn: ExpirationTime.fromYears(1),
  });

  return { entityKey, txHash };
}

export async function updateOrganizer(
  walletClient: ArkivWalletClient,
  entityKey: Hex,
  data: OrganizerPayload,
  walletAddress: string
) {
  const { txHash } = await walletClient.updateEntity({
    entityKey,
    payload: jsonToPayload(data),
    contentType: "application/json",
    attributes: [
      { key: "type", value: ENTITY_TYPE },
      { key: "wallet", value: walletAddress.toLowerCase() },
      { key: "name", value: data.name },
      { key: "createdAt", value: nowUnix() },
    ],
    expiresIn: ExpirationTime.fromYears(1),
  });

  return { txHash };
}

export async function getOrganizerByWallet(
  walletAddress: string
): Promise<OrganizerEntity | null> {
  const result = await arkivPublic
    .buildQuery()
    .where([
      eq("type", ENTITY_TYPE),
      eq("wallet", walletAddress.toLowerCase()),
    ])
    .withAttributes(true)
    .withPayload(true)
    .withMetadata(true)
    .limit(1)
    .fetch();

  if (result.entities.length === 0) return null;

  return parseOrganizerEntity(result.entities[0]);
}

export async function getOrganizerByKey(
  entityKey: Hex
): Promise<OrganizerEntity | null> {
  try {
    const entity = await arkivPublic.getEntity(entityKey);
    return parseOrganizerEntity(entity);
  } catch {
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseOrganizerEntity(entity: any): OrganizerEntity {
  const data = entity.toJson() as OrganizerPayload;
  const attrs = Object.fromEntries(
    entity.attributes.map((a: { key: string; value: string | number }) => [a.key, a.value])
  );

  return {
    entityKey: entity.key,
    owner: entity.owner,
    name: data.name,
    bio: data.bio,
    avatarUrl: data.avatarUrl,
    website: data.website,
    twitter: data.twitter,
    wallet: attrs.wallet as string,
    createdAt: attrs.createdAt as number,
  };
}
