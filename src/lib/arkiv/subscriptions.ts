import { arkivPublic } from "./client";
import type { Hex } from "viem";

export interface RsvpEvent {
  entityKey: Hex;
  owner: Hex;
  type: "created" | "deleted";
}

export function subscribeToEntityEvents(
  onCreated?: (event: { entityKey: Hex; owner: Hex }) => void,
  onDeleted?: (event: { entityKey: Hex; owner: Hex }) => void,
  pollingInterval = 3000
) {
  return arkivPublic.subscribeEntityEvents(
    {
      onEntityCreated: onCreated
        ? (event) => onCreated({ entityKey: event.entityKey, owner: event.owner })
        : undefined,
      onEntityDeleted: onDeleted
        ? (event) => onDeleted({ entityKey: event.entityKey, owner: event.owner })
        : undefined,
      onError: (err) => console.error("[Arkiv subscription error]", err),
    },
    pollingInterval
  );
}
