"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function GlobeGlow() {
  const reducedMotion = useReducedMotion();

  return (
    <div
      className="pointer-events-none absolute inset-0 -z-10"
      aria-hidden="true"
    >
      {/* Primary violet radial glow — breathing */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130%] h-[130%] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(139,92,246,0.2) 0%, rgba(59,130,246,0.1) 35%, transparent 65%)",
        }}
        animate={reducedMotion ? undefined : { scale: [1, 1.08, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Secondary cyan ring */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] h-[95%] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 45%, rgba(6,182,212,0.08) 65%, transparent 85%)",
        }}
        animate={reducedMotion ? undefined : { scale: [1.05, 1, 1.05] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Outer pulse ring 1 — expands outward */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[88%] h-[88%] rounded-full border border-violet-500/20"
        animate={
          reducedMotion
            ? undefined
            : { scale: [1, 1.4], opacity: [0.4, 0] }
        }
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeOut",
        }}
      />

      {/* Outer pulse ring 2 — offset timing */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[88%] h-[88%] rounded-full border border-blue-500/15"
        animate={
          reducedMotion
            ? undefined
            : { scale: [1, 1.5], opacity: [0.3, 0] }
        }
        transition={{
          duration: 3.5,
          delay: 1.5,
          repeat: Infinity,
          ease: "easeOut",
        }}
      />

      {/* Inner warm glow — concentrated center */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full"
        style={{
          background:
            "radial-gradient(circle at center, rgba(139,92,246,0.08) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
