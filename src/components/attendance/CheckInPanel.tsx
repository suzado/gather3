"use client";

import { motion } from "framer-motion";
import { UserCheck, Users } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedCounter } from "@/components/common/AnimatedCounter";
import { useAttendance } from "@/hooks/useAttendance";
import { CheckInList } from "@/components/attendance/CheckInList";
import type { EventEntity, RsvpEntity } from "@/lib/arkiv/types";

interface CheckInPanelProps {
  event: EventEntity;
  rsvps: RsvpEntity[];
  rsvpCount: number;
}

export function CheckInPanel({ event, rsvps, rsvpCount }: CheckInPanelProps) {
  const { attendance, count: attendanceCount, loading, refetch } =
    useAttendance(event.entityKey);

  const fillPercent =
    rsvpCount > 0 ? Math.min((attendanceCount / rsvpCount) * 100, 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="glass rounded-2xl p-6 space-y-4"
    >
      <div className="flex items-center gap-2">
        <UserCheck className="h-4 w-4 text-violet-400" />
        <h2 className="text-lg font-semibold">Check-in</h2>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-violet-400" />
            <span className="text-foreground/90">
              <AnimatedCounter
                value={attendanceCount}
                className="font-semibold"
              />
              <span className="text-muted-foreground">
                {" "}
                / {rsvpCount} checked in
              </span>
            </span>
          </div>
        </div>

        <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${fillPercent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      <Separator className="bg-white/[0.06]" />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-28 flex-1" />
              <Skeleton className="h-7 w-20" />
            </div>
          ))}
        </div>
      ) : (
        <CheckInList
          rsvps={rsvps}
          attendance={attendance}
          eventKey={event.entityKey}
          onCheckIn={refetch}
        />
      )}
    </motion.div>
  );
}
