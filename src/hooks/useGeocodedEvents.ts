"use client";

import { useState, useEffect, useRef } from "react";
import type { EventEntity } from "@/lib/arkiv/types";
import { geocodeLocation } from "@/lib/utils/geocode";

export interface GeocodedEvent extends EventEntity {
  latitude: number;
  longitude: number;
}

export function useGeocodedEvents(events: EventEntity[]) {
  const [geocodedEvents, setGeocodedEvents] = useState<GeocodedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [geocodeProgress, setGeocodeProgress] = useState({ done: 0, total: 0 });
  const abortRef = useRef(false);

  useEffect(() => {
    abortRef.current = false;

    const physicalEvents = events.filter(
      (e) => e.locationType === "in-person" || e.locationType === "hybrid"
    );

    if (physicalEvents.length === 0) {
      setGeocodedEvents([]);
      setLoading(false);
      setGeocodeProgress({ done: 0, total: 0 });
      return;
    }

    setGeocodeProgress({ done: 0, total: physicalEvents.length });
    setLoading(true);

    async function geocodeAll() {
      const results: GeocodedEvent[] = [];

      for (let i = 0; i < physicalEvents.length; i++) {
        if (abortRef.current) return;

        const event = physicalEvents[i];

        if (event.latitude != null && event.longitude != null) {
          results.push(event as GeocodedEvent);
        } else {
          const geo = await geocodeLocation(event.location, event.venue);
          if (geo) {
            results.push({
              ...event,
              latitude: geo.latitude,
              longitude: geo.longitude,
            });
          }
          // Throttle: Nominatim allows 1 req/sec
          if (i < physicalEvents.length - 1) {
            await new Promise((r) => setTimeout(r, 1100));
          }
        }

        if (abortRef.current) return;
        setGeocodeProgress({ done: i + 1, total: physicalEvents.length });
        setGeocodedEvents([...results]);
      }

      setLoading(false);
    }

    geocodeAll();

    return () => {
      abortRef.current = true;
    };
  }, [events]);

  return { geocodedEvents, loading, geocodeProgress };
}
