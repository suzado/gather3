"use client";
import { useState, useEffect } from "react";
import { queryEvents } from "@/lib/arkiv/events";
import type { EventEntity, EventFilters } from "@/lib/arkiv/types";
import type { Hex } from "viem";

export function useMyEvents(walletAddress: string | undefined) {
  const [events, setEvents] = useState<EventEntity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!walletAddress) {
      setEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const filters: EventFilters = {
      ownerWallet: walletAddress as Hex,
    };
    queryEvents(filters, 100)
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [walletAddress]);

  return { events, loading, refetch: () => {
    if (!walletAddress) return;
    setLoading(true);
    queryEvents({ ownerWallet: walletAddress as Hex }, 100)
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }};
}
