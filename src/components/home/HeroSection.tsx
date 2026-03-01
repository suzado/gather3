"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Calendar, Users, Zap, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useMousePosition } from "@/hooks/useMousePosition";
import { HeroParticles } from "./HeroParticles";
import { MouseSpotlight } from "./MouseSpotlight";
import { WordReveal } from "./WordReveal";
import { HeroGlobeDynamic } from "./HeroGlobeDynamic";
import { GlobeGlow } from "./GlobeGlow";
import { GlobeArcs } from "./GlobeArcs";
import { GlobeEventCards } from "./GlobeEventCards";

const stats = [
  { label: "Decentralized", value: "100%", icon: Zap },
  { label: "User-Owned", value: "Data", icon: Users },
  { label: "On-Chain", value: "Events", icon: Calendar },
];

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { springX, springY, isTouchDevice } = useMousePosition(sectionRef);
  const { scrollY } = useScroll();

  const headingY = useTransform(scrollY, [0, 500], [0, -80]);
  const subtitleY = useTransform(scrollY, [0, 500], [0, -40]);
  const globeY = useTransform(scrollY, [0, 500], [0, -60]);
  const particleY = useTransform(scrollY, [0, 500], [0, -120]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <section ref={sectionRef} className="relative overflow-hidden">
      {/* Animated gradient base */}
      <div className="animated-gradient absolute inset-0 -z-20" />

      {/* Floating orbs */}
      <HeroParticles offsetY={particleY} />

      {/* Mouse spotlight */}
      <MouseSpotlight
        springX={springX}
        springY={springY}
        isTouchDevice={isTouchDevice}
      />

      {/* Static radial gradient fallback */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.15),transparent_60%)]" />

      <motion.div
        style={{ opacity: heroOpacity }}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-36"
      >
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
          {/* Left column — text content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300 mb-8"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Built on Arkiv — Ethereum&apos;s Data Layer
            </motion.div>

            {/* Heading with word reveal */}
            <motion.h1
              style={{ y: headingY }}
              className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight"
            >
              <WordReveal
                text="Own Your Events."
                className="gradient-text"
                delay={0.2}
              />
              <br />
              <WordReveal
                text="Own Your Community."
                className="text-foreground/90"
                delay={0.6}
              />
            </motion.h1>

            {/* Subtitle with parallax */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              style={{ y: subtitleY }}
              className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed"
            >
              A web3-native event platform where events,{" "}
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="underline decoration-dotted underline-offset-4 cursor-help">
                    RSVPs
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  RSVP – Attendance confirmations
                </TooltipContent>
              </Tooltip>
              , and attendance are owned by users — not platforms. No middlemen,
              no lock-in.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link href="/events">
                <Button
                  size="lg"
                  className="relative overflow-hidden bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white glow-violet px-8 text-base shine-sweep"
                >
                  Discover Events
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/events/create">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/10 hover:bg-white/5 text-base"
                >
                  Create Event
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.6 }}
              className="mt-16 lg:mt-12 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0"
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5 + i * 0.1, duration: 0.4 }}
                  className="glass rounded-xl p-4 text-center"
                >
                  <stat.icon className="h-5 w-5 text-violet-400 mx-auto mb-2" />
                  <div className="text-lg font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right column — 3D Globe with overlays (desktop only) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
            style={{ y: globeY }}
            className="relative hidden lg:flex items-center justify-end"
          >
            <div className="relative w-full max-w-[600px]">
              <GlobeGlow />
              <GlobeArcs />
              <HeroGlobeDynamic
                className="w-full"
                size={600}
                interactive={!isTouchDevice}
              />
              <GlobeEventCards />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
