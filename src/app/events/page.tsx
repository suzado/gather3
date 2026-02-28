"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Search, List } from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { EventFilters } from "@/components/events/EventFilters";
import { EventGrid } from "@/components/events/EventGrid";
import { Button } from "@/components/ui/button";
import { useEvents } from "@/hooks/useEvents";
import { useFuseSearch } from "@/hooks/useFuseSearch";
import type { EventFilters as EventFiltersType } from "@/lib/arkiv/types";

export default function EventsPage() {
  const [filters, setFilters] = useState<EventFiltersType>({});
  const [searchQuery, setSearchQuery] = useState("");
  const { events, loading, error } = useEvents(filters);
  const { results: filteredEvents, hasQuery, resultCount } = useFuseSearch(events, searchQuery);

  const hasActiveFilters =
    Object.keys(filters).some(
      (key) => filters[key as keyof EventFiltersType] !== undefined
    ) || searchQuery.trim().length > 0;

  return (
    <PageTransition>
      <section className="relative">
        {/* Background gradient */}
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
                  <span className="gradient-text">Discover</span> Events
                </h1>
                <p className="mt-2 text-muted-foreground">
                  Browse decentralized events owned by their organizers.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-violet-500/50 bg-violet-500/10 text-violet-400"
                    disabled
                  >
                    <List className="mr-1 h-4 w-4" />
                    List
                  </Button>
                  {/* Map link hidden until geocoding is pre-computed
                  <Link href="/events/map">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white/10 hover:bg-white/5"
                    >
                      <MapPin className="mr-1 h-4 w-4" />
                      Map
                    </Button>
                  </Link>
                  */}
                </div>
                <Link href="/events/create">
                  <Button
                    variant="outline"
                    className="border-white/10 hover:bg-white/5"
                  >
                    Create Event
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
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

          {/* Error state */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400"
            >
              {error}
            </motion.div>
          )}

          {/* Result count */}
          {hasQuery && !loading && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-muted-foreground mb-4"
            >
              {resultCount} {resultCount === 1 ? "event" : "events"} matching{" "}
              <span className="text-violet-400">&ldquo;{searchQuery.trim()}&rdquo;</span>
            </motion.p>
          )}

          {/* Event grid */}
          <EventGrid
            events={filteredEvents}
            loading={loading}
            emptyTitle={hasQuery ? "No matching events" : "No events found"}
            emptyDescription={
              hasQuery
                ? `No events match "${searchQuery.trim()}". Try a different search term.`
                : "Try adjusting your filters or check back later for new events."
            }
            emptyAction={
              hasActiveFilters ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilters({});
                    setSearchQuery("");
                  }}
                  className="border-white/10 hover:bg-white/5"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              ) : undefined
            }
          />
        </div>
      </section>
    </PageTransition>
  );
}
