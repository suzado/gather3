import { createPublicClient, createWalletClient, http } from "@arkiv-network/sdk";
import { privateKeyToAccount, generatePrivateKey } from "@arkiv-network/sdk/accounts";
import type { Hex } from "viem";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { chain, TOTAL_WALLETS } from "./config";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WALLETS_FILE = join(__dirname, ".wallets.json");

export interface SeedWallet {
  privateKey: Hex;
  address: Hex;
}

/** Generate or load wallets from cache file */
export function getOrCreateWallets(count: number = TOTAL_WALLETS): SeedWallet[] {
  if (existsSync(WALLETS_FILE)) {
    const cached = JSON.parse(readFileSync(WALLETS_FILE, "utf-8")) as SeedWallet[];
    if (cached.length >= count) {
      console.log(`  Loaded ${count} wallets from cache`);
      return cached.slice(0, count);
    }
  }

  console.log(`  Generating ${count} new wallets...`);
  const wallets: SeedWallet[] = [];
  for (let i = 0; i < count; i++) {
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);
    wallets.push({ privateKey, address: account.address });
  }

  writeFileSync(WALLETS_FILE, JSON.stringify(wallets, null, 2));
  console.log(`  Saved wallets to ${WALLETS_FILE}`);
  return wallets;
}

/** Check balances and return only funded wallets */
export async function getFundedWallets(wallets: SeedWallet[]): Promise<SeedWallet[]> {
  const publicClient = createPublicClient({
    chain,
    transport: http(),
  });

  const funded: SeedWallet[] = [];
  for (const wallet of wallets) {
    try {
      const balance = await publicClient.getBalance({ address: wallet.address });
      if (balance > BigInt(0)) {
        funded.push(wallet);
      }
    } catch {
      // skip
    }
  }
  return funded;
}

/** Print wallet addresses for manual faucet funding */
export function printWalletsForFunding(wallets: SeedWallet[]): void {
  console.log("\n  Fund each address via the faucet:");
  console.log(`  https://${chain.network}.hoodi.arkiv.network/faucet/\n`);
  for (let i = 0; i < wallets.length; i++) {
    console.log(`  [${i + 1}/${wallets.length}] ${wallets[i].address}`);
  }
}

/** Print balance status of all wallets */
export async function printBalanceStatus(wallets: SeedWallet[]): Promise<{ funded: number; unfunded: number }> {
  const publicClient = createPublicClient({
    chain,
    transport: http(),
  });

  let funded = 0;
  let unfunded = 0;

  for (const wallet of wallets) {
    try {
      const balance = await publicClient.getBalance({ address: wallet.address });
      if (balance > BigInt(0)) {
        funded++;
      } else {
        unfunded++;
      }
    } catch {
      unfunded++;
    }
  }

  console.log(`  Funded: ${funded}/${wallets.length}, Unfunded: ${unfunded}/${wallets.length}`);
  return { funded, unfunded };
}

/** Create an Arkiv wallet client for a seed wallet */
export function createSeedWalletClient(wallet: SeedWallet) {
  return createWalletClient({
    chain,
    transport: http(),
    account: privateKeyToAccount(wallet.privateKey),
  });
}
