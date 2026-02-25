"use client";

import { motion, type MotionValue } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const orbs = [
  { size: 300, color: "bg-violet-500/20", x: [10, 30], y: [20, 60], duration: 20 },
  { size: 400, color: "bg-blue-500/15", x: [60, 80], y: [10, 50], duration: 25 },
  { size: 250, color: "bg-cyan-500/10", x: [40, 70], y: [50, 80], duration: 18 },
  { size: 350, color: "bg-violet-400/15", x: [70, 90], y: [30, 70], duration: 22 },
  { size: 280, color: "bg-blue-400/10", x: [5, 25], y: [60, 90], duration: 19 },
  { size: 320, color: "bg-indigo-500/12", x: [30, 55], y: [5, 35], duration: 23 },
  { size: 200, color: "bg-violet-600/18", x: [50, 75], y: [65, 95], duration: 17 },
  { size: 260, color: "bg-cyan-400/8", x: [15, 45], y: [40, 70], duration: 21 },
];

interface HeroParticlesProps {
  offsetY?: MotionValue<number>;
}

export function HeroParticles({ offsetY }: HeroParticlesProps) {
  const reduced = useReducedMotion();
  // Show fewer orbs on mobile via CSS (hidden on small screens for last 4)
  const allOrbs = reduced ? orbs.slice(0, 4) : orbs;

  return (
    <div
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      <motion.div style={offsetY ? { y: offsetY } : undefined} className="absolute inset-0">
        {allOrbs.map((orb, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full ${orb.color} blur-3xl ${i >= 4 ? "hidden md:block" : ""}`}
            style={{
              width: orb.size,
              height: orb.size,
              willChange: "transform",
              left: `${orb.x[0]}%`,
              top: `${orb.y[0]}%`,
            }}
            animate={
              reduced
                ? undefined
                : {
                    x: [`0%`, `${orb.x[1] - orb.x[0]}vw`],
                    y: [`0%`, `${orb.y[1] - orb.y[0]}vh`],
                  }
            }
            transition={{
              duration: orb.duration,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}
