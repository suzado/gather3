"use client";

import { useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState, type RefObject } from "react";

export function useMousePosition(ref: RefObject<HTMLElement | null>) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const springX = useSpring(mouseX, { stiffness: 150, damping: 15 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 15 });

  useEffect(() => {
    setIsTouchDevice(
      "ontouchstart" in window || navigator.maxTouchPoints > 0
    );
  }, []);

  useEffect(() => {
    if (isTouchDevice || !ref.current) return;
    const el = ref.current;
    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    };
    el.addEventListener("mousemove", handleMove);
    return () => el.removeEventListener("mousemove", handleMove);
  }, [isTouchDevice, ref, mouseX, mouseY]);

  return { springX, springY, mouseX, mouseY, isTouchDevice };
}
