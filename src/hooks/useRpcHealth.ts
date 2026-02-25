"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { mendoza } from "@/lib/wallet/config";

const POLL_INTERVAL = 30_000;
const REQUEST_TIMEOUT = 8_000;
const FAILURE_THRESHOLD = 2;

export function useRpcHealth() {
  const [isUnhealthy, setIsUnhealthy] = useState(false);
  const failureCount = useRef(0);

  const checkHealth = useCallback(async () => {
    const rpcUrl = mendoza.rpcUrls.default.http[0];
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const response = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_chainId",
          params: [],
          id: 1,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

      failureCount.current = 0;
      setIsUnhealthy(false);
    } catch {
      clearTimeout(timeoutId);
      failureCount.current += 1;
      if (failureCount.current >= FAILURE_THRESHOLD) {
        setIsUnhealthy(true);
      }
    }
  }, []);

  useEffect(() => {
    checkHealth();
    const intervalId = setInterval(checkHealth, POLL_INTERVAL);
    return () => clearInterval(intervalId);
  }, [checkHealth]);

  return isUnhealthy;
}
