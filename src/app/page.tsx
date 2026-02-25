"use client";

import { PageTransition } from "@/components/layout/PageTransition";
import { GrainOverlay } from "@/components/home/GrainOverlay";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { LiveActivitySection } from "@/components/home/LiveActivitySection";
import { CtaSection } from "@/components/home/CtaSection";

export default function Home() {
  return (
    <PageTransition>
      <GrainOverlay />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <LiveActivitySection />
      <CtaSection />
    </PageTransition>
  );
}
