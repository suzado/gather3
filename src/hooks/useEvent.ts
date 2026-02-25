"use client";
import { useState, useEffect, useCallback } from "react";
import { getEvent } from "@/lib/arkiv/events";
import type { EventEntity } from "@/lib/arkiv/types";
import type { Hex } from "viem";

export function useEvent(eventKey: Hex | null) {
  const [event, setEvent] = useState<EventEntity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = useCallback(() => {
    if (!eventKey) return;
    setLoading(true);
    getEvent(eventKey)
      .then(setEvent)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [eventKey]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  return { event, loading, error, refetch: fetchEvent };
}
