"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { getRsvpsForEvent } from "@/lib/arkiv/rsvp";
import type { RsvpEntity } from "@/lib/arkiv/types";
import type { Hex } from "viem";

interface LiveRsvpEvent {
  type: "joined";
  entityKey: Hex;
  owner: Hex;
  timestamp: number;
}

const POLL_INTERVAL = 5000;

export function useLiveRsvps(eventKey: Hex | null) {
  const [rsvps, setRsvps] = useState<RsvpEntity[]>([]);
  const [liveEvents, setLiveEvents] = useState<LiveRsvpEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const knownKeysRef = useRef<Set<string>>(new Set());

  const refetch = useCallback(() => {
    if (!eventKey) return;
    getRsvpsForEvent(eventKey)
      .then(setRsvps)
      .catch(() => {});
  }, [eventKey]);

  useEffect(() => {
    if (!eventKey) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    // Initial fetch
    getRsvpsForEvent(eventKey)
      .then((initialRsvps) => {
        if (cancelled) return;
        setRsvps(initialRsvps);
        knownKeysRef.current = new Set(initialRsvps.map((r) => r.entityKey));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    // Poll for new RSVPs
    const interval = setInterval(async () => {
      if (cancelled) return;
      try {
        const currentRsvps = await getRsvpsForEvent(eventKey);
        if (cancelled) return;

        setRsvps(currentRsvps);

        // Detect new RSVPs by comparing entity keys
        const newRsvps = currentRsvps.filter(
          (r) => !knownKeysRef.current.has(r.entityKey)
        );

        if (newRsvps.length > 0) {
          setLiveEvents((prev) => [
            ...newRsvps.map((r) => ({
              type: "joined" as const,
              entityKey: r.entityKey as Hex,
              owner: r.owner as Hex,
              timestamp: Date.now(),
            })),
            ...prev.slice(0, 19 - newRsvps.length),
          ]);
        }

        knownKeysRef.current = new Set(currentRsvps.map((r) => r.entityKey));
      } catch {
        // ignore polling errors
      }
    }, POLL_INTERVAL);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [eventKey]);

  return { rsvps, liveEvents, loading, refetch };
}
