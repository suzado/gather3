"use client";

import { motion } from "framer-motion";
import { walletToGradient, shortenAddress } from "@/lib/utils/avatars";
import type { RsvpEntity } from "@/lib/arkiv/types";

interface RsvpListProps {
  rsvps: RsvpEntity[];
  maxDisplay?: number;
  totalCount?: number;
}

function AttendeeAvatar({
  address,
  index,
}: {
  address: string;
  index: number;
}) {
  const gradient = walletToGradient(address);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="flex items-center gap-3 py-2"
    >
      <div
        className="h-8 w-8 rounded-full shrink-0 border border-white/[0.1]"
        style={{
          background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
        }}
      />
      <span className="text-sm text-foreground/80">{shortenAddress(address)}</span>
    </motion.div>
  );
}

export function RsvpList({
  rsvps,
  maxDisplay = 10,
  totalCount,
}: RsvpListProps) {
  const displayedRsvps = rsvps.slice(0, maxDisplay);
  const remaining =
    (totalCount ?? rsvps.length) - displayedRsvps.length;

  if (rsvps.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">
        No attendees yet. Be the first to RSVP!
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {displayedRsvps.map((rsvp, i) => (
        <AttendeeAvatar
          key={rsvp.entityKey}
          address={rsvp.attendeeWallet}
          index={i}
        />
      ))}
      {remaining > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: displayedRsvps.length * 0.05 }}
          className="text-sm text-muted-foreground/70 pt-2"
        >
          and {remaining} more attendee{remaining !== 1 ? "s" : ""}
        </motion.p>
      )}
    </div>
  );
}
