"use client";

import { motion, type MotionValue } from "framer-motion";

interface TimelineConnectorProps {
  progress: MotionValue<number>;
}

export function TimelineConnector({ progress }: TimelineConnectorProps) {
  return (
    <svg
      className="absolute top-[2.5rem] left-0 w-full h-[2px] hidden lg:block pointer-events-none"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="timeline-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
      {/* Background track */}
      <line
        x1="12.5%"
        y1="50%"
        x2="87.5%"
        y2="50%"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Animated progress line */}
      <motion.line
        x1="12.5%"
        y1="50%"
        x2="87.5%"
        y2="50%"
        stroke="url(#timeline-gradient)"
        strokeWidth="2"
        strokeLinecap="round"
        style={{ pathLength: progress }}
        initial={{ pathLength: 0 }}
      />
    </svg>
  );
}
