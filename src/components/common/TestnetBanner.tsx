"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Info, X, ArrowRight } from "lucide-react";
import { FAUCET_URL } from "@/lib/utils/constants";
import { arkivChain } from "@/lib/wallet/config";

const STORAGE_KEY = "gather3-testnet-banner-dismissed";

export function TestnetBanner() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(sessionStorage.getItem(STORAGE_KEY) === "true");
  }, []);

  function handleDismiss() {
    setDismissed(true);
    sessionStorage.setItem(STORAGE_KEY, "true");
  }

  if (dismissed) return null;

  return (
    <div className="rounded-xl bg-violet-500/10 border border-violet-500/20 p-4 mb-6">
      <div className="flex items-start gap-3">
        <Info className="h-5 w-5 text-violet-400 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-violet-200">
            Gather3 runs on <strong>Arkiv {arkivChain.name} testnet</strong>. You need a small amount of testnet ETH for gas fees.
          </p>
          <Link
            href={FAUCET_URL}
            target="_blank"
            className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors"
          >
            Get free testnet ETH
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <button
          onClick={handleDismiss}
          className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
