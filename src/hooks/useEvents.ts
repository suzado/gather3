"use client";
import { useState, useEffect, useCallback } from "react";
import { queryEvents, queryUpcomingEvents } from "@/lib/arkiv/events";
import type { EventEntity, EventFilters } from "@/lib/arkiv/types";

export function useEvents(filters: EventFilters = {}, limit = 50) {
  const [events, setEvents] = useState<EventEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await queryEvents(filters, limit);
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters), limit]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, loading, error, refetch: fetchEvents };
}

export function useUpcomingEvents(limit = 20) {
  const [events, setEvents] = useState<EventEntity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    queryUpcomingEvents(limit)
      .then(setEvents)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [limit]);

  return { events, loading };
}
