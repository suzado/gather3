"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { shortenAddress } from "@/lib/utils/avatars";
import type { Hex } from "viem";

interface LiveRsvpEvent {
  type: "joined";
  entityKey: Hex;
  owner: Hex;
  timestamp: number;
}

interface LiveRsvpFeedProps {
  events: LiveRsvpEvent[];
  showToasts?: boolean;
}

export function LiveRsvpFeed({ events, showToasts = true }: LiveRsvpFeedProps) {
  // Show toast for new events
  useEffect(() => {
    if (!showToasts || events.length === 0) return;
    const latest = events[0];
    if (Date.now() - latest.timestamp < 2000) {
      toast(
        `${shortenAddress(latest.owner)} just RSVP'd!`,
        {
          icon: <UserPlus className="h-4 w-4 text-emerald-400" />,
          duration: 3000,
        }
      );
    }
  }, [events, showToasts]);

  if (events.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Live Activity
      </h4>
      <AnimatePresence mode="popLayout">
        {events.slice(0, 5).map((event) => (
          <motion.div
            key={`${event.entityKey}-${event.timestamp}`}
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            className="flex items-center gap-2 text-sm py-1.5 px-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10"
          >
            <UserPlus className="h-3 w-3 text-emerald-400 shrink-0" />
            <span className="text-emerald-400 font-medium">
              {shortenAddress(event.owner)}
            </span>
            <span className="text-muted-foreground">joined</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
