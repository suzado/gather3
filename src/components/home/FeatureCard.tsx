"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
}

interface FeatureCardProps {
  feature: Feature;
  index: number;
}

const springConfig = { stiffness: 200, damping: 20 };

export function FeatureCard({ feature, index }: FeatureCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(200);
  const mouseY = useMotionValue(150);
  const isTouchRef = useRef(false);

  const rotateX = useSpring(
    useTransform(mouseY, [0, 300], [8, -8]),
    springConfig
  );
  const rotateY = useSpring(
    useTransform(mouseX, [0, 400], [-8, 8]),
    springConfig
  );

  const glowBackground = useMotionTemplate`radial-gradient(
    250px circle at ${mouseX}px ${mouseY}px,
    rgba(139, 92, 246, 0.12),
    transparent 80%
  )`;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isTouchRef.current || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const handleMouseLeave = () => {
    mouseX.set(200);
    mouseY.set(150);
  };

  const handleTouchStart = () => {
    isTouchRef.current = true;
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.5 }}
      style={{ perspective: "1000px" }}
      className="h-full"
    >
      {/* Animated gradient border wrapper */}
      <div className="relative rounded-2xl p-[1px] overflow-hidden h-full">
        {/* Rotating conic gradient for animated border */}
        <motion.div
          className="absolute inset-[-50%] rounded-2xl"
          style={{
            background:
              "conic-gradient(from 0deg, transparent, rgba(139,92,246,0.3), transparent, rgba(59,130,246,0.3), transparent)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />

        {/* Card body with 3D tilt */}
        <motion.div
          className="relative glass rounded-2xl p-6 bg-[oklch(0.10_0.01_270)] h-full"
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        >
          {/* Cursor-following glow */}
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: glowBackground }}
            aria-hidden="true"
          />

          {/* Content */}
          <div className="relative" style={{ transform: "translateZ(20px)" }}>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-blue-500/20 mb-4">
              <feature.icon className="h-5 w-5 text-violet-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {feature.description}
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
