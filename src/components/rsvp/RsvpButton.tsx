"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Check, X } from "lucide-react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useArkivWallet, useWalletAddress } from "@/hooks/useArkivClient";
import { createRsvp, cancelRsvp } from "@/lib/arkiv/rsvp";
import { shortenAddress } from "@/lib/utils/avatars";
import type { RsvpEntity } from "@/lib/arkiv/types";
import type { Hex } from "viem";
import { trackEvent } from "@/lib/utils/umami";

interface RsvpButtonProps {
  eventKey: Hex;
  userRsvp: RsvpEntity | null;
  onRsvpChange: () => void;
  disabled?: boolean;
}

export function RsvpButton({
  eventKey,
  userRsvp,
  onRsvpChange,
  disabled = false,
}: RsvpButtonProps) {
  const [loading, setLoading] = useState(false);
  const walletAddress = useWalletAddress();
  const arkivWallet = useArkivWallet();
  const { openConnectModal } = useConnectModal();

  // Not connected
  if (!walletAddress) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="lg"
            onClick={() => {
              trackEvent("wallet_connect_for_rsvp");
              openConnectModal?.();
            }}
            className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white glow-violet"
          >
            Connect Wallet to RSVP
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          RSVP – Confirm your attendance at this event
        </TooltipContent>
      </Tooltip>
    );
  }

  const handleRsvp = async () => {
    if (!arkivWallet) {
      toast.error("Wallet not ready. Please try again.");
      return;
    }

    trackEvent("rsvp_click", { action: "rsvp" });
    setLoading(true);
    try {
      const displayName = shortenAddress(walletAddress);
      await createRsvp(arkivWallet, eventKey, displayName, "", walletAddress);
      trackEvent("rsvp_confirmed", { eventKey });
      toast.success("RSVP confirmed! See you there.");
      onRsvpChange();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to RSVP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!arkivWallet || !userRsvp) return;

    trackEvent("rsvp_click", { action: "cancel" });
    setLoading(true);
    try {
      await cancelRsvp(arkivWallet, userRsvp.entityKey);
      trackEvent("rsvp_cancelled", { eventKey });
      toast.success("RSVP cancelled.");
      onRsvpChange();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to cancel RSVP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Already RSVP'd
  if (userRsvp) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-2 text-sm text-green-400 mb-2">
          <Check className="h-4 w-4" />
          <span>You are attending this event</span>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="lg"
              variant="outline"
              onClick={handleCancel}
              disabled={loading || disabled}
              className="w-full border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/30"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                <>
                  <X className="h-4 w-4" />
                  Cancel RSVP
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Cancel your attendance confirmation
          </TooltipContent>
        </Tooltip>
      </motion.div>
    );
  }

  // Not RSVP'd
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="lg"
            onClick={handleRsvp}
            disabled={loading || disabled}
            className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white glow-violet"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Confirming...
              </>
            ) : (
              "RSVP"
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          RSVP – Confirm your attendance at this event
        </TooltipContent>
      </Tooltip>
    </motion.div>
  );
}
