"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { Plus, LayoutDashboard } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function Header() {
  const { isConnected } = useAccount();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 glass border-b border-white/5"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group transition-transform hover:scale-[1.03]">
              <Logo size="md" variant="mark" className="text-white" />
              <span className="text-lg font-bold gradient-text">Gather3</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/events">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  Discover
                </Button>
              </Link>
              {isConnected && (
                <>
                  <Link href="/events/create">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                      <Plus className="mr-1 h-4 w-4" />
                      Create Event
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                      <LayoutDashboard className="mr-1 h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
          <ConnectButton
            chainStatus="icon"
            showBalance={false}
            accountStatus={{
              smallScreen: "avatar",
              largeScreen: "full",
            }}
          />
        </div>
      </div>
    </motion.header>
  );
}
