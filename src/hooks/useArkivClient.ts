"use client";
import { useMemo } from "react";
import { useWalletClient, useAccount } from "wagmi";
import { createArkivWallet, arkivPublic } from "@/lib/arkiv/client";

export function useArkivPublic() {
  return arkivPublic;
}

export function useArkivWallet() {
  const { data: walletClient } = useWalletClient();

  const arkivWallet = useMemo(() => {
    if (!walletClient?.account) return null;
    return createArkivWallet(walletClient.account);
  }, [walletClient]);

  return arkivWallet;
}

export function useWalletAddress() {
  const { address } = useAccount();
  return address;
}
