"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { UserCheck, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useArkivWallet } from "@/hooks/useArkivClient";
import { checkInAttendee } from "@/lib/arkiv/attendance";
import { walletToGradient, shortenAddress } from "@/lib/utils/avatars";
import { formatEventDateTime } from "@/lib/utils/dates";
import { trackEvent } from "@/lib/utils/umami";
import type { RsvpEntity, AttendanceEntity } from "@/lib/arkiv/types";
import type { Hex } from "viem";

interface CheckInListProps {
  rsvps: RsvpEntity[];
  attendance: AttendanceEntity[];
  eventKey: Hex;
  onCheckIn: () => void;
}

export function CheckInList({
  rsvps,
  attendance,
  eventKey,
  onCheckIn,
}: CheckInListProps) {
  const [loadingWallet, setLoadingWallet] = useState<string | null>(null);
  const arkivWallet = useArkivWallet();

  const checkedInMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of attendance) {
      map.set(a.attendeeWallet.toLowerCase(), a.checkedInAt);
    }
    return map;
  }, [attendance]);

  async function handleCheckIn(attendeeWallet: string) {
    if (!arkivWallet) {
      toast.error("Wallet not ready. Please try again.");
      return;
    }
    setLoadingWallet(attendeeWallet.toLowerCase());
    try {
      await checkInAttendee(arkivWallet, eventKey, attendeeWallet);
      trackEvent("attendee_checked_in", { eventKey });
      toast.success(`${shortenAddress(attendeeWallet)} checked in!`);
      onCheckIn();
    } catch (err) {
      console.error("Check-in error:", err);
      toast.error("Failed to check in attendee");
    } finally {
      setLoadingWallet(null);
    }
  }

  if (rsvps.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">
        No RSVPs yet. Attendees will appear here once they RSVP.
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {rsvps.map((rsvp, i) => {
        const wallet = rsvp.attendeeWallet.toLowerCase();
        const checkedInAt = checkedInMap.get(wallet);
        const isCheckedIn = checkedInAt !== undefined;
        const isLoading = loadingWallet === wallet;
        const gradient = walletToGradient(rsvp.attendeeWallet);

        return (
          <motion.div
            key={rsvp.entityKey}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className="flex items-center gap-3 py-2"
          >
            <div
              className="h-8 w-8 rounded-full shrink-0 border border-white/[0.1]"
              style={{
                background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
              }}
            />

            <span className="text-sm text-foreground/80 flex-1">
              {shortenAddress(rsvp.attendeeWallet)}
            </span>

            {isCheckedIn ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className="bg-green-500/15 text-green-400 border-green-500/20 text-xs gap-1"
                  >
                    <Check className="h-3 w-3" />
                    Checked in
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  {formatEventDateTime(checkedInAt)}
                </TooltipContent>
              </Tooltip>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleCheckIn(rsvp.attendeeWallet)}
                disabled={loadingWallet !== null}
                className="text-xs h-7 px-3"
              >
                {isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <>
                    <UserCheck className="h-3 w-3 mr-1" />
                    Check in
                  </>
                )}
              </Button>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
