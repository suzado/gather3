"use client";

import { motion } from "framer-motion";

// Arc connections between cities — defined as start/end angles on the globe perimeter
const ARCS = [
  { from: -20, to: 60, color: "rgba(139,92,246,0.4)", delay: 0 }, // SF → London
  { from: 50, to: 130, color: "rgba(59,130,246,0.35)", delay: 1.5 }, // London → Tokyo
  { from: 120, to: 200, color: "rgba(6,182,212,0.3)", delay: 3 }, // Tokyo → Sydney
  { from: -40, to: 40, color: "rgba(139,92,246,0.3)", delay: 4.5 }, // NYC → Paris
  { from: 170, to: 280, color: "rgba(59,130,246,0.3)", delay: 6 }, // Mumbai → São Paulo
  { from: 80, to: 160, color: "rgba(6,182,212,0.35)", delay: 2 }, // Singapore → Dubai
];

function arcPath(
  fromAngle: number,
  toAngle: number,
  radius: number,
  cx: number,
  cy: number
) {
  const fromRad = (fromAngle * Math.PI) / 180;
  const toRad = (toAngle * Math.PI) / 180;

  const x1 = cx + radius * Math.cos(fromRad);
  const y1 = cy + radius * Math.sin(fromRad);
  const x2 = cx + radius * Math.cos(toRad);
  const y2 = cy + radius * Math.sin(toRad);

  // Control point — bulge outward from center
  const midAngle = (fromRad + toRad) / 2;
  const bulge = radius * 0.35;
  const cpx = cx + (radius + bulge) * Math.cos(midAngle);
  const cpy = cy + (radius + bulge) * Math.sin(midAngle);

  return { path: `M ${x1} ${y1} Q ${cpx} ${cpy} ${x2} ${y2}`, x1, y1, x2, y2 };
}

export function GlobeArcs() {
  const size = 300;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.44;

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0 w-full h-full"
        fill="none"
      >
        <defs>
          {ARCS.map((_, i) => (
            <linearGradient key={i} id={`arc-grad-${i}`}>
              <stop offset="0%" stopColor="rgba(139,92,246,0.6)" />
              <stop offset="50%" stopColor="rgba(59,130,246,0.4)" />
              <stop offset="100%" stopColor="rgba(6,182,212,0.6)" />
            </linearGradient>
          ))}
        </defs>

        {ARCS.map((arc, i) => {
          const { path } = arcPath(arc.from, arc.to, radius, cx, cy);

          return (
            <g key={i}>
              {/* Arc line — fades in and out */}
              <motion.path
                d={path}
                stroke={arc.color}
                strokeWidth={1}
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                  pathLength: [0, 1, 1, 0],
                  opacity: [0, 0.8, 0.8, 0],
                }}
                transition={{
                  duration: 4,
                  delay: arc.delay,
                  repeat: Infinity,
                  repeatDelay: ARCS.length * 1.5 - 4,
                  ease: "easeInOut",
                  times: [0, 0.3, 0.7, 1],
                }}
              />

              {/* Traveling dot along the arc */}
              <motion.circle
                r={2.5}
                fill="white"
                filter="url(#dot-glow)"
                initial={{ opacity: 0, offsetDistance: "0%" }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  offsetDistance: ["0%", "100%"],
                }}
                transition={{
                  duration: 3,
                  delay: arc.delay + 0.5,
                  repeat: Infinity,
                  repeatDelay: ARCS.length * 1.5 - 3,
                  ease: "easeInOut",
                }}
                style={{
                  offsetPath: `path('${path}')`,
                }}
              />
            </g>
          );
        })}

        {/* Glow filter for traveling dots */}
        <defs>
          <filter id="dot-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Pulse rings at key marker positions */}
        {[
          { angle: -20, delay: 0 },
          { angle: 60, delay: 2 },
          { angle: 130, delay: 4 },
          { angle: -60, delay: 1 },
          { angle: 100, delay: 3 },
        ].map((ring, i) => {
          const rad = (ring.angle * Math.PI) / 180;
          const rx = cx + radius * Math.cos(rad);
          const ry = cy + radius * Math.sin(rad);

          return (
            <motion.circle
              key={`ring-${i}`}
              cx={rx}
              cy={ry}
              r={3}
              fill="none"
              stroke="rgba(139,92,246,0.5)"
              strokeWidth={1}
              initial={{ r: 3, opacity: 0.6 }}
              animate={{ r: 12, opacity: 0 }}
              transition={{
                duration: 2,
                delay: ring.delay,
                repeat: Infinity,
                repeatDelay: 3,
                ease: "easeOut",
              }}
            />
          );
        })}
      </svg>
    </div>
  );
}
