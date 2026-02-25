"use client";

import { motion, useMotionTemplate, type MotionValue } from "framer-motion";

interface MouseSpotlightProps {
  springX: MotionValue<number>;
  springY: MotionValue<number>;
  isTouchDevice: boolean;
  radius?: number;
  opacity?: number;
}

export function MouseSpotlight({
  springX,
  springY,
  isTouchDevice,
  radius = 600,
  opacity = 0.08,
}: MouseSpotlightProps) {
  const background = useMotionTemplate`radial-gradient(${radius}px circle at ${springX}px ${springY}px, rgba(139, 92, 246, ${opacity}), transparent 80%)`;

  if (isTouchDevice) return null;

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 -z-5"
      style={{ background }}
      aria-hidden="true"
    />
  );
}
