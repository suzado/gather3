"use client";

import { motion } from "framer-motion";
import { Calendar, Users, Zap } from "lucide-react";
import { FeatureCard } from "./FeatureCard";

const features = [
  {
    title: "Own Your Events",
    description:
      "Events, RSVPs, and attendance records live on Arkiv — owned by organizers and attendees, not platforms.",
    icon: Calendar,
  },
  {
    title: "Wallet-Based Identity",
    description:
      "No passwords, no accounts. Connect your wallet to create events or RSVP. Your identity is your wallet.",
    icon: Users,
  },
  {
    title: "Real-Time Updates",
    description:
      "Watch RSVPs come in live. On-chain events with instant updates, no centralized server required.",
    icon: Zap,
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold">
            Events, <span className="gradient-text">reimagined</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Replace Luma, Eventbrite, and Meetup with something you actually own.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
