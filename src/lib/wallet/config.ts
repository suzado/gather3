import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { defineChain } from "viem";

export const mendoza = defineChain({
  id: 60138453056,
  name: "Arkiv Mendoza",
  network: "mendoza",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://mendoza.hoodi.arkiv.network/rpc"],
      webSocket: ["wss://mendoza.hoodi.arkiv.network/rpc/ws"],
    },
  },
  blockExplorers: {
    default: {
      name: "Mendoza Explorer",
      url: "https://explorer.mendoza.hoodi.arkiv.network",
      apiUrl: "https://explorer.mendoza.hoodi.arkiv.network/api",
    },
  },
  testnet: true,
});

export const wagmiConfig = getDefaultConfig({
  appName: "Gather3",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo",
  chains: [mendoza],
  ssr: true,
});
