import {
  createPublicClient as createArkivPublicClient,
  createWalletClient as createArkivWalletClient,
  http,
} from "@arkiv-network/sdk";
import { mendoza } from "@arkiv-network/sdk/chains";
import type { Account, Chain, Transport } from "viem";

// Singleton public client for read operations (no wallet needed)
export const arkivPublic = createArkivPublicClient({
  chain: mendoza,
  transport: http(),
});

// Create wallet client from a viem Account (from wagmi/RainbowKit)
export function createArkivWallet(account: Account) {
  return createArkivWalletClient({
    chain: mendoza,
    transport: http(),
    account,
  });
}

export type ArkivPublicClient = typeof arkivPublic;
export type ArkivWalletClient = ReturnType<typeof createArkivWallet>;
