"use client";

import { AlertTriangle } from "lucide-react";
import { useRpcHealth } from "@/hooks/useRpcHealth";

export function RpcHealthBanner() {
  const isUnhealthy = useRpcHealth();

  if (!isUnhealthy) return null;

  return (
    <div className="w-full bg-orange-500/15 border-b border-orange-500/25">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-orange-400 shrink-0" />
          <p className="text-sm text-orange-200">
            Unstable Arkiv RPC detected. This may cause gather3.club to not
            function properly.
          </p>
        </div>
      </div>
    </div>
  );
}
