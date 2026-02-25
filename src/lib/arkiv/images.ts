import { ExpirationTime } from "@arkiv-network/sdk/utils";
import { arkivPublic } from "./client";
import type { ArkivWalletClient } from "./client";
import type { Hex } from "viem";
import { APP_ID } from "@/lib/utils/constants";

const ENTITY_TYPE = "cover-image";

function safeExpiresIn(expiresIn: number): number {
  const floored = Math.floor(expiresIn);
  return floored % 2 === 0 ? floored : floored + 1;
}

export async function createCoverImage(
  walletClient: ArkivWalletClient,
  imageData: Uint8Array,
  eventEntityKey?: string
) {
  const { entityKey, txHash } = await walletClient.createEntity({
    payload: imageData,
    contentType: "image/jpeg",
    attributes: [
      { key: "app", value: APP_ID },
      { key: "type", value: ENTITY_TYPE },
      ...(eventEntityKey
        ? [{ key: "eventKey", value: eventEntityKey }]
        : []),
    ],
    expiresIn: safeExpiresIn(ExpirationTime.fromYears(1)),
  });

  return { entityKey, txHash };
}

export async function getCoverImage(
  entityKey: Hex
): Promise<Uint8Array | null> {
  try {
    const entity = await arkivPublic.getEntity(entityKey);
    return entity.payload ?? null;
  } catch {
    return null;
  }
}

export async function updateCoverImage(
  walletClient: ArkivWalletClient,
  entityKey: Hex,
  imageData: Uint8Array
) {
  const { txHash } = await walletClient.updateEntity({
    entityKey,
    payload: imageData,
    contentType: "image/jpeg",
    attributes: [
      { key: "app", value: APP_ID },
      { key: "type", value: ENTITY_TYPE },
    ],
    expiresIn: safeExpiresIn(ExpirationTime.fromYears(1)),
  });

  return { txHash };
}

export async function deleteCoverImage(
  walletClient: ArkivWalletClient,
  entityKey: Hex
) {
  const { txHash } = await walletClient.deleteEntity({ entityKey });
  return { txHash };
}
