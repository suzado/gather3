"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import type { EventStatus } from "@/lib/utils/constants";
import { cn } from "@/lib/utils";

interface EventStatusBadgeProps {
  status: EventStatus;
  className?: string;
}

const statusConfig: Record<
  EventStatus,
  { label: string; className: string; pulse: boolean }
> = {
  upcoming: {
    label: "Upcoming",
    className:
      "bg-blue-500/15 text-blue-400 border-blue-500/20 hover:bg-blue-500/20",
    pulse: false,
  },
  live: {
    label: "Live",
    className:
      "bg-green-500/15 text-green-400 border-green-500/20 hover:bg-green-500/20",
    pulse: true,
  },
  ended: {
    label: "Ended",
    className:
      "bg-gray-500/15 text-gray-400 border-gray-500/20 hover:bg-gray-500/20",
    pulse: false,
  },
  cancelled: {
    label: "Cancelled",
    className:
      "bg-red-500/15 text-red-400 border-red-500/20 hover:bg-red-500/20",
    pulse: false,
  },
};

export function EventStatusBadge({ status, className }: EventStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[11px] font-medium gap-1.5 relative",
        config.className,
        className
      )}
    >
      {config.pulse && (
        <motion.span
          className="relative flex h-2 w-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className="pulse-live absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
        </motion.span>
      )}
      {config.label}
    </Badge>
  );
}
