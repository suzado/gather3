"use client";
import { useState, useEffect } from "react";
import { getMyRsvps } from "@/lib/arkiv/rsvp";
import type { RsvpEntity } from "@/lib/arkiv/types";

export function useMyRsvps(walletAddress: string | undefined) {
  const [rsvps, setRsvps] = useState<RsvpEntity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!walletAddress) {
      setRsvps([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    getMyRsvps(walletAddress, 100)
      .then(setRsvps)
      .catch(() => setRsvps([]))
      .finally(() => setLoading(false));
  }, [walletAddress]);

  return { rsvps, loading };
}
