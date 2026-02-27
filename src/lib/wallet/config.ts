import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { kaolin } from "@arkiv-network/sdk/chains";
import { mendoza } from "@arkiv-network/sdk/chains";

const chains = { kaolin, mendoza } as const;
type ChainName = keyof typeof chains;

const envChain = process.env.NEXT_PUBLIC_ARKIV_CHAIN as ChainName | undefined;
export const arkivChain = chains[envChain ?? "kaolin"];

export const wagmiConfig = getDefaultConfig({
  appName: "Gather3.club",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo",
  chains: [arkivChain],
  ssr: true,
});
