"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EventStatusBadge } from "./EventStatusBadge";
import type { EventEntity } from "@/lib/arkiv/types";
import { useCoverImage } from "@/hooks/useCoverImage";
import { formatEventDate, formatEventTime } from "@/lib/utils/dates";
import { cn } from "@/lib/utils";

interface EventCardProps {
  event: EventEntity;
  index?: number;
}

const categoryColors: Record<string, string> = {
  conference:
    "bg-violet-500/15 text-violet-400 border-violet-500/20",
  meetup:
    "bg-blue-500/15 text-blue-400 border-blue-500/20",
  workshop:
    "bg-amber-500/15 text-amber-400 border-amber-500/20",
  hackathon:
    "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
  social:
    "bg-pink-500/15 text-pink-400 border-pink-500/20",
};

function getCategoryLabel(value: string | undefined): string {
  if (!value) return "Event";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function EventCard({ event, index = 0 }: EventCardProps) {
  const { imageUrl: coverUrl } = useCoverImage(event.coverImageKey);
  const displayImage = coverUrl || event.imageUrl || null;
  const rsvpCount = event.rsvpCount ?? 0;
  const fillPercent =
    event.capacity > 0
      ? Math.min((rsvpCount / event.capacity) * 100, 100)
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: "easeOut" }}
    >
      <Link href={`/events/${event.entityKey}`} className="block group">
        <motion.article
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={cn(
            "relative rounded-2xl p-5",
            "bg-white/[0.03] backdrop-blur border border-white/[0.08]",
            "transition-all duration-300",
            "hover:border-white/[0.15] hover:shadow-[0_0_30px_rgba(139,92,246,0.08)]",
            "cursor-pointer"
          )}
        >
          {/* Cover image */}
          {displayImage && (
            <div className="rounded-lg overflow-hidden -mx-1 -mt-1 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayImage}
                alt=""
                className="w-full aspect-[2/1] object-cover"
              />
            </div>
          )}

          {/* Badges row */}
          <div className="flex items-center justify-between mb-4">
            <Badge
              variant="outline"
              className={cn(
                "text-[11px] font-medium",
                categoryColors[event.category] ?? "bg-white/10 text-white/70"
              )}
            >
              {getCategoryLabel(event.category)}
            </Badge>
            <EventStatusBadge status={event.status} />
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-foreground/95 mb-3 line-clamp-2 group-hover:text-white transition-colors">
            {event.title}
          </h3>

          {/* Date + time */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-violet-400/70" />
            <span>{formatEventDate(event.startDate)}</span>
            <span className="text-white/20">|</span>
            <Clock className="h-3.5 w-3.5 shrink-0 text-violet-400/70" />
            <span>{formatEventTime(event.startDate)}</span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-violet-400/70" />
            <span className="truncate">{event.location}</span>
          </div>

          {/* RSVP progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="h-3.5 w-3.5 text-violet-400/70" />
                <span>
                  {rsvpCount} / {event.capacity} spots
                </span>
              </div>
              <span className="text-muted-foreground/70">
                {Math.round(fillPercent)}%
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${fillPercent}%` }}
                transition={{ delay: index * 0.08 + 0.3, duration: 0.6, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Bottom divider + organizer hint */}
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center gap-2">
            <div className="h-5 w-5 rounded-full bg-gradient-to-br from-violet-500/40 to-blue-500/40" />
            <span className="text-xs text-muted-foreground/70 truncate">
              {event.city || event.locationType}
            </span>
          </div>
        </motion.article>
      </Link>
    </motion.div>
  );
}
