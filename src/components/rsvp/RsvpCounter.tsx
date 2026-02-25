"use client";

import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { AnimatedCounter } from "@/components/common/AnimatedCounter";

interface RsvpCounterProps {
  count: number;
  capacity: number;
}

export function RsvpCounter({ count, capacity }: RsvpCounterProps) {
  const fillPercent =
    capacity > 0 ? Math.min((count / capacity) * 100, 100) : 0;
  const isFull = count >= capacity && capacity > 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-violet-400" />
          <span className="text-foreground/90">
            <AnimatedCounter value={count} className="font-semibold" />
            <span className="text-muted-foreground"> / {capacity} spots</span>
          </span>
        </div>
        {isFull && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-xs font-medium text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full"
          >
            Full
          </motion.span>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${
            isFull
              ? "bg-gradient-to-r from-amber-500 to-orange-500"
              : "bg-gradient-to-r from-violet-500 to-blue-500"
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${fillPercent}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
