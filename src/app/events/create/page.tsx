"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion } from "framer-motion";
import { Wallet, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/layout/PageTransition";
import { TestnetBanner } from "@/components/common/TestnetBanner";
import { EventForm } from "@/components/events/EventForm";
import { OrganizerForm } from "@/components/organizer/OrganizerForm";
import { useWalletAddress } from "@/hooks/useArkivClient";
import { useOrganizerByWallet } from "@/hooks/useOrganizer";

type PageState = "connect" | "organizer-setup" | "create-event";

export default function CreateEventPage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const walletAddress = useWalletAddress();
  const { organizer, loading: orgLoading } = useOrganizerByWallet(walletAddress);
  const [pageState, setPageState] = useState<PageState>("connect");

  useEffect(() => {
    if (!isConnected) {
      setPageState("connect");
    } else if (orgLoading) {
      // still loading
    } else if (!organizer) {
      setPageState("organizer-setup");
    } else {
      setPageState("create-event");
    }
  }, [isConnected, organizer, orgLoading]);

  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl px-4 py-12">
        {pageState === "connect" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center flex flex-col items-center justify-center min-h-[60vh]"
          >
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 mb-6">
              <Wallet className="h-8 w-8 text-violet-400" />
            </div>
            <h1 className="text-3xl font-bold mb-3">Connect Your Wallet</h1>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              You need to connect your wallet to create events on Gather3
            </p>
            <ConnectButton />
          </motion.div>
        )}

        {pageState === "organizer-setup" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <TestnetBanner />
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Set Up Your Profile</h1>
              <p className="text-muted-foreground">
                Before creating events, set up your organizer profile. This is visible to attendees.
              </p>
            </div>
            <div className="glass rounded-xl p-6">
              <OrganizerForm
                onSuccess={() => {
                  setPageState("create-event");
                }}
              />
            </div>
          </motion.div>
        )}

        {pageState === "create-event" && organizer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <TestnetBanner />
            <div className="mb-8">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Create Event</h1>
                  <p className="text-muted-foreground">
                    Fill in the details to create your event on-chain
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/organizer/${walletAddress}`)}
                  className="text-muted-foreground"
                >
                  Organizing as {organizer.name}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="glass rounded-xl p-6 sm:p-8">
              <EventForm
                organizerKey={organizer.entityKey}
                onSuccess={(entityKey) => {
                  router.push(`/events/${entityKey}`);
                }}
              />
            </div>
          </motion.div>
        )}

        {orgLoading && isConnected && (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
          </div>
        )}
      </div>
    </PageTransition>
  );
}
