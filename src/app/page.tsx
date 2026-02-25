"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Users, Zap, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/layout/PageTransition";

const stats = [
  { label: "Decentralized", value: "100%", icon: Zap },
  { label: "User-Owned", value: "Data", icon: Users },
  { label: "On-Chain", value: "Events", icon: Calendar },
];

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

export default function Home() {
  return (
    <PageTransition>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="animated-gradient absolute inset-0 -z-10" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.15),transparent_60%)]" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300 mb-8"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Built on Arkiv — Ethereum&apos;s Data Layer
            </motion.div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="gradient-text">Own Your Events.</span>
              <br />
              <span className="text-foreground/90">Own Your Community.</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              A web3-native event platform where events, RSVPs, and attendance
              are owned by users — not platforms. No middlemen, no lock-in.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/events">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white glow-violet px-8 text-base"
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
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-20 grid grid-cols-3 gap-4 max-w-lg mx-auto"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1, duration: 0.4 }}
                className="glass rounded-xl p-4 text-center"
              >
                <stat.icon className="h-5 w-5 text-violet-400 mx-auto mb-2" />
                <div className="text-lg font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
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
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="glass glass-hover rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-blue-500/20 mb-4">
                  <feature.icon className="h-5 w-5 text-violet-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl glass p-12 sm:p-16 text-center"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-blue-600/10" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to take control?
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto mb-8">
                Create your first event in minutes. All data stored on Arkiv — owned by you, forever.
              </p>
              <Link href="/events/create">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white glow-violet"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </PageTransition>
  );
}
