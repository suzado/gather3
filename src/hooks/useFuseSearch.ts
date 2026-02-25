"use client";

import { useState, useEffect, useMemo } from "react";
import Fuse, { type IFuseOptions } from "fuse.js";
import type { EventEntity } from "@/lib/arkiv/types";

const FUSE_OPTIONS: IFuseOptions<EventEntity> = {
  keys: [
    { name: "title", weight: 0.35 },
    { name: "description", weight: 0.2 },
    { name: "tags", weight: 0.2 },
    { name: "location", weight: 0.15 },
    { name: "city", weight: 0.1 },
  ],
  threshold: 0.4,
  ignoreLocation: true,
  minMatchCharLength: 2,
};

const DEBOUNCE_MS = 300;

export function useFuseSearch(events: EventEntity[], query: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const fuse = useMemo(() => new Fuse(events, FUSE_OPTIONS), [events]);

  const results = useMemo(() => {
    const trimmed = debouncedQuery.trim();
    if (!trimmed) return events;
    return fuse.search(trimmed).map((result) => result.item);
  }, [fuse, debouncedQuery, events]);

  return {
    results,
    hasQuery: debouncedQuery.trim().length > 0,
    resultCount: results.length,
  };
}
