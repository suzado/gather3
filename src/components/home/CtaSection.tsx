"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl glass p-12 sm:p-16 text-center"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-blue-600/10" />

          {/* Floating decorative orbs */}
          <motion.div
            className="absolute top-6 right-12 h-32 w-32 rounded-full bg-violet-500/10 blur-2xl"
            animate={{ y: [0, -15, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden="true"
          />
          <motion.div
            className="absolute bottom-8 left-16 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl"
            animate={{ y: [0, 10, 0], scale: [1, 1.08, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            aria-hidden="true"
          />

          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to take control?
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              Create your first event in minutes. All data stored on Arkiv —
              owned by you, forever.
            </p>
            <Link href="/events/create">
              <Button
                size="lg"
                className="relative overflow-hidden bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white glow-violet shine-sweep"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
