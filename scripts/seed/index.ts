/**
 * Gather3 Seed Tool
 *
 * Populates the Gather3 platform with realistic users, events, and RSVPs.
 * Uses OpenAI to generate content (text + cover images) and the Arkiv SDK
 * to create on-chain entities.
 *
 * Usage:
 *   1. npm run seed:setup    — generate wallets & print addresses
 *   2. Fund each address via faucet
 *   3. npm run seed           — create all content
 *
 * Requires:
 *   - OPENAI_API_KEY: OpenAI API key (in .env.local or environment)
 *   - Funded wallets (run seed:setup first)
 */

import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import {
  ORGANIZER_COUNT,
  TOTAL_WALLETS,
  RSVPS_MIN,
  RSVPS_MAX,
  chain,
} from "./config";
import {
  getOrCreateWallets,
  getFundedWallets,
  printBalanceStatus,
  printWalletsForFunding,
} from "./wallets";
import { generateOrganizers, generateEvents } from "./generate";
import { createOrganizers, createEvents, createRsvps } from "./entities";
import { createCoverImages, linkCoverImages } from "./images";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local from gather3 root
config({ path: resolve(__dirname, "../../.env.local") });

async function main() {
  console.log("=== Gather3 Seed Tool ===\n");
  console.log(`Chain: ${chain.name} (${chain.id})`);

  // --- Validate env ---
  if (!process.env.OPENAI_API_KEY) {
    console.error("ERROR: OPENAI_API_KEY is required (set in .env.local or environment).");
    process.exit(1);
  }

  const startTime = Date.now();

  // --- Step 1: Load wallets ---
  console.log("\n[1/8] Loading wallets...");
  const wallets = getOrCreateWallets(TOTAL_WALLETS);

  // --- Step 2: Check balances ---
  console.log("\n[2/8] Checking wallet balances...");
  const { funded: fundedCount, unfunded } = await printBalanceStatus(wallets);

  if (fundedCount === 0) {
    console.error("\n  ERROR: No funded wallets found!");
    console.error("  Run 'npm run seed:setup' first, then fund wallets via faucet.");
    printWalletsForFunding(wallets);
    process.exit(1);
  }

  if (unfunded > 0) {
    console.warn(`\n  WARNING: ${unfunded} wallets are unfunded. Proceeding with ${fundedCount} funded wallets.`);
  }

  const fundedWallets = await getFundedWallets(wallets);
  const organizerWallets = fundedWallets.slice(0, Math.min(ORGANIZER_COUNT, fundedWallets.length));
  const allWallets = fundedWallets;
  console.log(`  Using ${organizerWallets.length} organizers + ${allWallets.length - organizerWallets.length} extra attendees`);

  // --- Step 3: Generate content via OpenAI ---
  console.log("\n[3/8] Generating content via OpenAI...");
  const [organizerProfiles, eventData] = await Promise.all([
    generateOrganizers(),
    generateEvents(),
  ]);

  // --- Step 4: Create organizers on Arkiv ---
  console.log("\n[4/8] Creating organizers on Arkiv...");
  const organizers = await createOrganizers(organizerWallets, organizerProfiles);
  console.log(`  ${organizers.length} organizers created`);

  if (organizers.length === 0) {
    console.error("\n  ERROR: No organizers created. Cannot continue.");
    process.exit(1);
  }

  // --- Step 5: Create events on Arkiv ---
  console.log("\n[5/8] Creating events on Arkiv...");
  const events = await createEvents(organizers, eventData);
  console.log(`  ${events.length} events created`);

  // --- Step 6: Generate cover images via OpenAI ---
  console.log("\n[6/8] Generating cover images via OpenAI (this takes a while)...");
  const coverMap = await createCoverImages(events);
  console.log(`  ${coverMap.size} cover images created`);

  // --- Step 7: Link cover images to events ---
  console.log("\n[7/8] Linking cover images to events...");
  const linked = await linkCoverImages(events, coverMap);
  console.log(`  ${linked} events updated with cover images`);

  // --- Step 8: Create RSVPs ---
  console.log("\n[8/8] Creating RSVPs...");
  const rsvps = await createRsvps(allWallets, events, RSVPS_MIN, RSVPS_MAX);
  console.log(`  ${rsvps.length} RSVPs created`);

  // --- Summary ---
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log("\n=== Seed Complete ===");
  console.log(`  Organizers:   ${organizers.length}`);
  console.log(`  Events:       ${events.length}`);
  console.log(`  Cover images: ${coverMap.size}`);
  console.log(`  RSVPs:        ${rsvps.length}`);
  console.log(`  Time:         ${elapsed}s`);
  console.log(`\nOpen Gather3 to see the seeded data!`);
}

main().catch((err) => {
  console.error("\nFatal error:", err);
  process.exit(1);
});
