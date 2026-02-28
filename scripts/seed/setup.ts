/**
 * Gather3 Seed Setup
 *
 * Generates wallets and prints addresses to fund via faucet.
 * Run this first, then fund each address, then run `npm run seed`.
 *
 * Usage:
 *   npm run seed:setup
 */

import { TOTAL_WALLETS, chain } from "./config";
import { getOrCreateWallets, printWalletsForFunding } from "./wallets";

console.log("=== Gather3 Seed Setup ===\n");
console.log(`Chain: ${chain.name} (${chain.id})`);

console.log(`\nGenerating ${TOTAL_WALLETS} wallets...`);
const wallets = getOrCreateWallets(TOTAL_WALLETS);

printWalletsForFunding(wallets);

console.log(`\n  After funding all wallets, run:`);
console.log(`  npm run seed\n`);
