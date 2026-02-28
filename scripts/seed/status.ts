/**
 * Gather3 Seed Status
 *
 * Checks balances of all generated wallets.
 *
 * Usage:
 *   npm run seed:status
 */

import { createPublicClient, http } from "@arkiv-network/sdk";
import { formatEther } from "viem";
import { chain, TOTAL_WALLETS, ORGANIZER_COUNT } from "./config";
import { getOrCreateWallets } from "./wallets";

const publicClient = createPublicClient({
  chain,
  transport: http(),
});

async function main() {
  console.log("=== Gather3 Seed Wallet Status ===\n");
  console.log(`Chain: ${chain.name} (${chain.id})\n`);

  const wallets = getOrCreateWallets(TOTAL_WALLETS);

  let funded = 0;
  let totalBalance = BigInt(0);

  for (let i = 0; i < wallets.length; i++) {
    const wallet = wallets[i];
    const role = i < ORGANIZER_COUNT ? "organizer" : "attendee ";
    try {
      const balance = await publicClient.getBalance({ address: wallet.address });
      const status = balance > BigInt(0) ? "OK" : "--";
      const ethStr = formatEther(balance).slice(0, 10).padEnd(10);
      console.log(`  [${String(i + 1).padStart(2)}] ${status}  ${ethStr} ETH  ${role}  ${wallet.address}`);
      if (balance > BigInt(0)) {
        funded++;
        totalBalance += balance;
      }
    } catch {
      console.log(`  [${String(i + 1).padStart(2)}] ??  (RPC error)     ${role}  ${wallet.address}`);
    }
  }

  console.log(`\n  Total: ${funded}/${wallets.length} funded, ${formatEther(totalBalance)} ETH`);

  if (funded === 0) {
    console.log(`\n  Fund wallets via faucet: https://${chain.network}.hoodi.arkiv.network/faucet/`);
  } else if (funded < wallets.length) {
    console.log(`\n  ${wallets.length - funded} wallets still need funding.`);
  } else {
    console.log(`\n  All wallets funded! Run: npm run seed`);
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
