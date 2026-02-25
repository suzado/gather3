"use client";

import { motion } from "framer-motion";
import { CalendarX } from "lucide-react";
import { EventCard } from "./EventCard";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import type { EventEntity } from "@/lib/arkiv/types";

interface EventGridProps {
  events: EventEntity[];
  loading: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export function EventGrid({
  events,
  loading,
  emptyTitle = "No events found",
  emptyDescription = "Try adjusting your filters or check back later for new events.",
  emptyAction,
}: EventGridProps) {
  if (loading) {
    return <LoadingSkeleton count={6} />;
  }

  if (events.length === 0) {
    return (
      <EmptyState
        icon={CalendarX}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {events.map((event, i) => (
        <EventCard key={event.entityKey} event={event} index={i} />
      ))}
    </motion.div>
  );
}
