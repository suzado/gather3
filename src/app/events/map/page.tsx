"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { List, MapPin, Loader2 } from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { EventFilters } from "@/components/events/EventFilters";
import { EventMapDynamic } from "@/components/events/EventMapDynamic";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { useEvents } from "@/hooks/useEvents";
import { useGeocodedEvents } from "@/hooks/useGeocodedEvents";
import { useFuseSearch } from "@/hooks/useFuseSearch";
import type { EventFilters as EventFiltersType } from "@/lib/arkiv/types";

export default function EventsMapPage() {
  const [filters, setFilters] = useState<EventFiltersType>({});
  const [searchQuery, setSearchQuery] = useState("");
  const { events, loading: eventsLoading } = useEvents(filters);
  const { results: filteredEvents } = useFuseSearch(events, searchQuery);
  const {
    geocodedEvents,
    loading: geocoding,
    geocodeProgress,
  } = useGeocodedEvents(filteredEvents);

  return (
    <PageTransition>
      <section className="relative">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.1),transparent_60%)]" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-10"
          >
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  <span className="gradient-text">Event</span> Map
                </h1>
                <p className="mt-2 text-muted-foreground">
                  Explore in-person events around the world.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/events">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/10 hover:bg-white/5"
                  >
                    <List className="mr-1 h-4 w-4" />
                    List View
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-violet-500/50 bg-violet-500/10 text-violet-400"
                  disabled
                >
                  <MapPin className="mr-1 h-4 w-4" />
                  Map View
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="glass rounded-2xl p-5">
              <EventFilters
                filters={filters}
                onFiltersChange={setFilters}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </div>
          </motion.div>

          {/* Geocoding progress */}
          {geocoding && geocodeProgress.total > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 flex items-center gap-2 text-sm text-muted-foreground"
            >
              <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
              Locating events... {geocodeProgress.done}/{geocodeProgress.total}
            </motion.div>
          )}

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="glass rounded-2xl overflow-hidden"
            style={{ minHeight: "500px" }}
          >
            {eventsLoading ? (
              <div className="h-[500px] flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
              </div>
            ) : geocodedEvents.length === 0 && !geocoding ? (
              <EmptyState
                icon={MapPin}
                title="No events on the map"
                description="No in-person events with recognizable locations found. Try adjusting your filters."
              />
            ) : (
              <EventMapDynamic events={geocodedEvents} />
            )}
          </motion.div>
        </div>
      </section>
    </PageTransition>
  );
}
