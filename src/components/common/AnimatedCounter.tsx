"use client";

import { useEffect, useRef } from "react";
import { useSpring, useTransform, motion, useMotionValue } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  className?: string;
  duration?: number;
}

export function AnimatedCounter({
  value,
  className,
  duration = 0.8,
}: AnimatedCounterProps) {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    stiffness: 100,
    damping: 20,
    duration: duration * 1000,
  });
  const displayValue = useTransform(springValue, (latest) =>
    Math.round(latest)
  );
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  useEffect(() => {
    const unsubscribe = displayValue.on("change", (latest) => {
      if (nodeRef.current) {
        nodeRef.current.textContent = String(latest);
      }
    });
    return unsubscribe;
  }, [displayValue]);

  return (
    <motion.span ref={nodeRef} className={className}>
      0
    </motion.span>
  );
}
