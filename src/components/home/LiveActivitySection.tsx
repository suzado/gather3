"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, PlusCircle, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { queryRecentRsvps } from "@/lib/arkiv/rsvp";
import { shortenAddress } from "@/lib/utils/avatars";
import type { EventEntity } from "@/lib/arkiv/types";
import type { RsvpEntity } from "@/lib/arkiv/types";

interface ActivityItem {
  id: string;
  type: "rsvp" | "create";
  user: string;
  eventTitle: string;
  icon: LucideIcon;
  color: string;
  borderColor: string;
  timestamp: number;
}

const VISIBLE_COUNT = 5;
const CYCLE_INTERVAL = 3500;

function buildActivityFeed(
  events: EventEntity[],
  rsvps: RsvpEntity[],
  eventMap: Map<string, string>
): ActivityItem[] {
  const items: ActivityItem[] = [];

  for (const event of events) {
    items.push({
      id: `event-${event.entityKey}`,
      type: "create",
      user: shortenAddress(event.owner),
      eventTitle: event.title,
      icon: PlusCircle,
      color: "text-violet-400",
      borderColor: "border-violet-500/10 bg-violet-500/5",
      timestamp: event.startDate,
    });
  }

  for (const rsvp of rsvps) {
    const title = eventMap.get(rsvp.eventKey) || "an event";
    items.push({
      id: `rsvp-${rsvp.entityKey}`,
      type: "rsvp",
      user: rsvp.displayName || shortenAddress(rsvp.attendeeWallet),
      eventTitle: title,
      icon: UserPlus,
      color: "text-emerald-400",
      borderColor: "border-emerald-500/10 bg-emerald-500/5",
      timestamp: rsvp.rsvpDate,
    });
  }

  items.sort((a, b) => b.timestamp - a.timestamp);
  return items;
}

export function LiveActivitySection() {
  const { events, loading: eventsLoading } = useEvents({}, 10);
  const [rsvps, setRsvps] = useState<RsvpEntity[]>([]);
  const [allItems, setAllItems] = useState<ActivityItem[]>([]);
  const [visibleItems, setVisibleItems] = useState<ActivityItem[]>([]);
  const offsetRef = useRef(0);

  // Fetch recent RSVPs
  useEffect(() => {
    queryRecentRsvps(10)
      .then(setRsvps)
      .catch(() => {});
  }, []);

  // Build activity feed when data arrives
  useEffect(() => {
    if (eventsLoading) return;
    const eventMap = new Map(events.map((e) => [e.entityKey, e.title]));
    const feed = buildActivityFeed(events, rsvps, eventMap);
    setAllItems(feed);
    setVisibleItems(feed.slice(0, VISIBLE_COUNT));
    offsetRef.current = 0;
  }, [events, rsvps, eventsLoading]);

  // Cycle through items
  useEffect(() => {
    if (allItems.length <= VISIBLE_COUNT) return;

    const interval = setInterval(() => {
      offsetRef.current = (offsetRef.current + 1) % allItems.length;
      const start = offsetRef.current;
      const items: ActivityItem[] = [];
      for (let i = 0; i < VISIBLE_COUNT; i++) {
        items.push(allItems[(start + i) % allItems.length]);
      }
      setVisibleItems(items);
    }, CYCLE_INTERVAL);

    return () => clearInterval(interval);
  }, [allItems]);

  // Don't render if no real data
  if (eventsLoading || allItems.length === 0) return null;

  return (
    <section className="py-24 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - text */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400 mb-4">
              <Zap className="h-3 w-3" />
              Live on-chain
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              A living, <span className="gradient-text">breathing</span>{" "}
              platform
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-md">
              Watch the community grow in real-time. Every RSVP, every event,
              every interaction — all happening on-chain, all owned by users.
            </p>

            <div className="mt-8 flex gap-6">
              <div>
                <div className="text-2xl font-bold gradient-text">24/7</div>
                <div className="text-xs text-muted-foreground">
                  On-chain activity
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold gradient-text">
                  Real-time
                </div>
                <div className="text-xs text-muted-foreground">
                  RSVP tracking
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold gradient-text">
                  Forever
                </div>
                <div className="text-xs text-muted-foreground">
                  Data ownership
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right side - live feed */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-2 w-2 rounded-full bg-emerald-400 pulse-live" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Live Activity Feed
                </span>
              </div>

              <div className="space-y-2 overflow-hidden" style={{ maxHeight: 260 }}>
                <AnimatePresence initial={false} mode="popLayout">
                  {visibleItems.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: 20, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -20, scale: 0.95 }}
                      transition={{
                        duration: 0.3,
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                      }}
                      className={`flex items-center gap-3 text-sm py-2.5 px-3 rounded-lg border ${item.borderColor}`}
                    >
                      <item.icon
                        className={`h-3.5 w-3.5 ${item.color} shrink-0`}
                      />
                      <span
                        className={`${item.color} font-medium shrink-0`}
                      >
                        {item.user}
                      </span>
                      <span className="text-muted-foreground shrink-0">
                        {item.type === "rsvp" ? "RSVP'd to" : "created"}
                      </span>
                      <span className="text-foreground/80 truncate font-medium">
                        {item.eventTitle}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Decorative glow behind the card */}
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-r from-violet-600/5 via-blue-600/5 to-emerald-600/5 blur-xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
