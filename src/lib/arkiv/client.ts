import {
  createPublicClient as createArkivPublicClient,
  createWalletClient as createArkivWalletClient,
  http,
} from "@arkiv-network/sdk";
import { arkivChain } from "@/lib/wallet/config";
import { custom } from "viem";
import type { WalletClient } from "viem";

// Singleton public client for read operations (no wallet needed)
export const arkivPublic = createArkivPublicClient({
  chain: arkivChain,
  transport: http(),
});

// Create wallet client using the browser wallet's transport (from wagmi/RainbowKit)
export function createArkivWallet(walletClient: WalletClient) {
  return createArkivWalletClient({
    chain: arkivChain,
    transport: custom(walletClient),
    account: walletClient.account!,
  });
}

export type ArkivPublicClient = typeof arkivPublic;
export type ArkivWalletClient = ReturnType<typeof createArkivWallet>;
