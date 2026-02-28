"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

interface EventCountdownProps {
  startDate: number; // Unix timestamp in seconds
}

function calculateTimeLeft(startDate: number) {
  const diff = startDate * 1000 - Date.now();
  if (diff <= 0) return null;

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-2xl font-bold tabular-nums text-violet-400">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
        {label}
      </span>
    </div>
  );
}

export function EventCountdown({ startDate }: EventCountdownProps) {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(startDate));

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = calculateTimeLeft(startDate);
      setTimeLeft(remaining);
      if (!remaining) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [startDate]);

  if (!timeLeft) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.5 }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-center gap-2 text-xs text-muted-foreground/70 mb-4">
        <Clock className="h-3.5 w-3.5 text-violet-400/70" />
        Starts in
      </div>
      <div className="grid grid-cols-4 gap-2">
        <TimeUnit value={timeLeft.days} label="Days" />
        <TimeUnit value={timeLeft.hours} label="Hrs" />
        <TimeUnit value={timeLeft.minutes} label="Min" />
        <TimeUnit value={timeLeft.seconds} label="Sec" />
      </div>
    </motion.div>
  );
}
