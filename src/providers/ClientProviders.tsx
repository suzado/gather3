"use client";

import dynamic from "next/dynamic";
import { TooltipProvider } from "@/components/ui/tooltip";

const Web3ProviderInner = dynamic(
  () => import("./Web3Provider").then((mod) => mod.Web3Provider),
  { ssr: false }
);

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <Web3ProviderInner>
      <TooltipProvider>{children}</TooltipProvider>
    </Web3ProviderInner>
  );
}
