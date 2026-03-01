"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Users, Zap } from "lucide-react";

const EVENTS = [
  { name: "ETH Hackathon", city: "San Francisco", attendees: 342, icon: Zap },
  { name: "DeFi Summit", city: "New York", attendees: 189, icon: Users },
  { name: "NFT Gallery Night", city: "London", attendees: 97, icon: MapPin },
  { name: "Web3 Meetup", city: "Tokyo", attendees: 156, icon: Users },
  { name: "DAO Governance", city: "Berlin", attendees: 78, icon: Zap },
  { name: "ZK Proof Workshop", city: "Singapore", attendees: 64, icon: Zap },
  { name: "DJ Set", city: "Paris", attendees: 220, icon: MapPin },
  { name: "Solidity Bootcamp", city: "Dubai", attendees: 115, icon: Users },
  { name: "Layer 2 Conference", city: "Seoul", attendees: 430, icon: Zap },
  { name: "Crypto Art Fair", city: "São Paulo", attendees: 88, icon: MapPin },
  { name: "DePIN Demo Day", city: "Mumbai", attendees: 201, icon: Zap },
  { name: "Staking Workshop", city: "Sydney", attendees: 53, icon: Users },
];

// Positions around the globe perimeter (angle in degrees, distance from center %)
const SLOTS = [
  { angle: -35, dist: 108, align: "left" as const },
  { angle: 20, dist: 112, align: "right" as const },
  { angle: 75, dist: 106, align: "right" as const },
  { angle: 145, dist: 110, align: "left" as const },
  { angle: -80, dist: 104, align: "left" as const },
];

interface ActiveCard {
  id: number;
  event: (typeof EVENTS)[number];
  slotIndex: number;
}

export function GlobeEventCards() {
  const [activeCards, setActiveCards] = useState<ActiveCard[]>([]);
  const nextIdRef = useRef(0);
  const eventIndexRef = useRef(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    const addCard = () => {
      setActiveCards((prev) => {
        const usedSlots = new Set(prev.map((c) => c.slotIndex));
        const availableSlots = SLOTS.map((_, i) => i).filter(
          (i) => !usedSlots.has(i)
        );
        if (availableSlots.length === 0) return prev;

        const slotIndex =
          availableSlots[Math.floor(Math.random() * availableSlots.length)];
        const event = EVENTS[eventIndexRef.current % EVENTS.length];
        const id = nextIdRef.current;

        nextIdRef.current += 1;
        eventIndexRef.current += 1;

        // Remove card after 3-4s
        const removeDelay = 3000 + Math.random() * 1000;
        timers.push(
          setTimeout(() => {
            setActiveCards((p) => p.filter((c) => c.id !== id));
          }, removeDelay)
        );

        return [...prev, { id, event, slotIndex }];
      });
    };

    // Initial staggered appearance
    timers.push(setTimeout(addCard, 1800));
    timers.push(setTimeout(addCard, 2600));
    timers.push(setTimeout(addCard, 3400));

    // Then cycle continuously
    const interval = setInterval(addCard, 2000);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      className="pointer-events-none absolute inset-0"
      aria-hidden="true"
    >
      <AnimatePresence>
        {activeCards.map((card) => {
          const slot = SLOTS[card.slotIndex];
          const rad = (slot.angle * Math.PI) / 180;
          const x = 50 + slot.dist * Math.cos(rad) * 0.5;
          const y = 50 + slot.dist * Math.sin(rad) * 0.5;
          const Icon = card.event.icon;

          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -5 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: `translate(${slot.align === "left" ? "-100%" : "0"}, -50%)`,
              }}
            >
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] backdrop-blur-md px-3 py-2 text-xs whitespace-nowrap shadow-lg shadow-violet-500/5">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500/20">
                  <Icon className="h-3 w-3 text-violet-400" />
                </div>
                <div>
                  <div className="font-medium text-foreground/90">
                    {card.event.name}
                  </div>
                  <div className="text-muted-foreground text-[10px]">
                    {card.event.city} · {card.event.attendees} attending
                  </div>
                </div>
                <div className="ml-1 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
