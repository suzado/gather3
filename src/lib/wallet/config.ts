import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { arkivChain } from "./chain";

export { arkivChain } from "./chain";

export const wagmiConfig = getDefaultConfig({
  appName: "Gather3.club",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo",
  chains: [arkivChain],
  ssr: true,
});
