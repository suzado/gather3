"use client";
import { useState, useEffect, useCallback } from "react";
import { getRsvpsForEvent, getRsvpCount, hasUserRsvpd } from "@/lib/arkiv/rsvp";
import type { RsvpEntity } from "@/lib/arkiv/types";
import type { Hex } from "viem";

export function useRsvps(eventKey: Hex | null) {
  const [rsvps, setRsvps] = useState<RsvpEntity[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!eventKey) return;
    try {
      const [rsvpList, rsvpCount] = await Promise.all([
        getRsvpsForEvent(eventKey),
        getRsvpCount(eventKey),
      ]);
      setRsvps(rsvpList);
      setCount(rsvpCount);
    } catch (err) {
      console.error("Failed to fetch RSVPs:", err);
    } finally {
      setLoading(false);
    }
  }, [eventKey]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { rsvps, count, loading, refetch };
}

export function useUserRsvp(eventKey: Hex | null, walletAddress: string | undefined) {
  const [rsvp, setRsvp] = useState<RsvpEntity | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!eventKey || !walletAddress) {
      setRsvp(null);
      setLoading(false);
      return;
    }
    try {
      const result = await hasUserRsvpd(eventKey, walletAddress);
      setRsvp(result);
    } catch {
      setRsvp(null);
    } finally {
      setLoading(false);
    }
  }, [eventKey, walletAddress]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { rsvp, loading, refetch };
}
