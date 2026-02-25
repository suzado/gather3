"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Wallet, UserPlus, PlusCircle, Heart, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { TimelineConnector } from "./TimelineConnector";
import { FAUCET_URL } from "@/lib/utils/constants";

interface Step {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
  link?: { label: string; href: string };
}

const steps: Step[] = [
  {
    number: "1",
    title: "Connect Your Wallet",
    description:
      "Use MetaMask or any Ethereum wallet. You'll need a small amount of testnet ETH for gas fees.",
    icon: Wallet,
    link: { label: "Get free testnet ETH", href: FAUCET_URL },
  },
  {
    number: "2",
    title: "Set Up Your Profile",
    description:
      "Create your organizer identity on-chain. This is your public profile visible to all attendees.",
    icon: UserPlus,
  },
  {
    number: "3",
    title: "Create Events",
    description:
      "Publish events to the blockchain. Set capacity, dates, location, and tags. Attendees RSVP with their wallet.",
    icon: PlusCircle,
  },
  {
    number: "4",
    title: "Build Your Community",
    description:
      "Track RSVPs in real-time, manage attendance, and grow your community. All data owned by you.",
    icon: Heart,
  },
];

function StepCard({
  step,
  index,
  scrollProgress,
}: {
  step: Step;
  index: number;
  scrollProgress: MotionValue<number>;
}) {
  const stepOpacity = useTransform(
    scrollProgress,
    [index * 0.25, index * 0.25 + 0.15],
    [0.4, 1]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.2, duration: 0.5 }}
      className="glass rounded-2xl p-6 relative"
    >
      <div className="flex items-center gap-3 mb-4">
        <motion.div
          style={{ opacity: stepOpacity }}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-blue-600 text-sm font-bold text-white shrink-0 glow-pulse"
        >
          {step.number}
        </motion.div>
        <step.icon className="h-5 w-5 text-violet-400" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {step.description}
      </p>
      {step.link && (
        <Link
          href={step.link.href}
          target="_blank"
          className="inline-flex items-center gap-1 mt-3 text-sm text-violet-400 hover:text-violet-300 transition-colors"
        >
          {step.link.label}
          <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </motion.div>
  );
}

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end center"],
  });

  return (
    <section ref={sectionRef} className="py-24 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold">
            How it <span className="gradient-text">works</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Get started in minutes. All you need is a wallet and some testnet
            ETH.
          </p>
        </motion.div>

        <div className="relative">
          {/* Animated connecting line (desktop only) */}
          <TimelineConnector progress={scrollYProgress} />

          {/* Vertical line for mobile */}
          <div className="absolute left-[1.75rem] top-0 bottom-0 w-[1px] bg-gradient-to-b from-violet-500/30 via-blue-500/20 to-transparent lg:hidden" />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <StepCard
                key={step.title}
                step={step}
                index={i}
                scrollProgress={scrollYProgress}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
