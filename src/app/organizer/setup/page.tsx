"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion } from "framer-motion";
import { Wallet } from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { OrganizerForm } from "@/components/organizer/OrganizerForm";
import { useWalletAddress } from "@/hooks/useArkivClient";
import { useOrganizerByWallet } from "@/hooks/useOrganizer";

export default function OrganizerSetupPage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const walletAddress = useWalletAddress();
  const { organizer, loading } = useOrganizerByWallet(walletAddress);

  useEffect(() => {
    // If organizer already exists, redirect to profile
    if (organizer && !loading && walletAddress) {
      router.replace(`/organizer/${walletAddress}`);
    }
  }, [organizer, loading, walletAddress, router]);

  if (!isConnected) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-3xl px-4 py-12">
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
              Connect your wallet to create or edit your organizer profile
            </p>
            <ConnectButton />
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  if (loading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {organizer ? "Edit Your Profile" : "Set Up Your Profile"}
            </h1>
            <p className="text-muted-foreground">
              {organizer
                ? "Update your organizer profile information"
                : "Create your organizer profile to start hosting events on Gather3"}
            </p>
          </div>
          <div className="glass rounded-xl p-6 sm:p-8">
            <OrganizerForm
              existingOrganizer={organizer}
              onSuccess={() => {
                if (walletAddress) {
                  router.push(`/organizer/${walletAddress}?created=true`);
                }
              }}
            />
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
