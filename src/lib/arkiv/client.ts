import {
  createPublicClient as createArkivPublicClient,
  createWalletClient as createArkivWalletClient,
  http,
} from "@arkiv-network/sdk";
import { mendoza } from "@arkiv-network/sdk/chains";
import type { Account, Chain, Transport } from "viem";
import { custom } from "viem";
import type { WalletClient } from "viem";

// Singleton public client for read operations (no wallet needed)
export const arkivPublic = createArkivPublicClient({
  chain: mendoza,
  transport: http(),
});

// Create wallet client using the browser wallet's transport (from wagmi/RainbowKit)
export function createArkivWallet(walletClient: WalletClient) {
  return createArkivWalletClient({
    chain: mendoza,
    transport: custom(walletClient),
    account: walletClient.account!,
  });
}

export type ArkivPublicClient = typeof arkivPublic;
export type ArkivWalletClient = ReturnType<typeof createArkivWallet>;
