"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { subscribeToEntityEvents } from "@/lib/arkiv/subscriptions";
import { getRsvpsForEvent } from "@/lib/arkiv/rsvp";
import type { RsvpEntity } from "@/lib/arkiv/types";
import type { Hex } from "viem";

interface LiveRsvpEvent {
  type: "joined";
  entityKey: Hex;
  owner: Hex;
  timestamp: number;
}

export function useLiveRsvps(eventKey: Hex | null) {
  const [rsvps, setRsvps] = useState<RsvpEntity[]>([]);
  const [liveEvents, setLiveEvents] = useState<LiveRsvpEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const unsubRef = useRef<(() => void) | null>(null);

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

    setLoading(true);
    getRsvpsForEvent(eventKey)
      .then(setRsvps)
      .finally(() => setLoading(false));

    // Subscribe to real-time entity events
    let cancelled = false;
    subscribeToEntityEvents(
      (event) => {
        if (cancelled) return;
        setLiveEvents((prev) => [
          { type: "joined", entityKey: event.entityKey, owner: event.owner, timestamp: Date.now() },
          ...prev.slice(0, 19),
        ]);
        getRsvpsForEvent(eventKey)
          .then(setRsvps)
          .catch(() => {});
      },
      () => {
        if (cancelled) return;
        getRsvpsForEvent(eventKey)
          .then(setRsvps)
          .catch(() => {});
      },
      5000
    ).then((unsub) => {
      if (cancelled) {
        unsub();
      } else {
        unsubRef.current = unsub;
      }
    });

    return () => {
      cancelled = true;
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
    };
  }, [eventKey]);

  return { rsvps, liveEvents, loading, refetch };
}
