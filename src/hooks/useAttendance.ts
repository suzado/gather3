"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getAttendanceForEvent,
  getAttendanceCount,
} from "@/lib/arkiv/attendance";
import type { AttendanceEntity } from "@/lib/arkiv/types";
import type { Hex } from "viem";

export function useAttendance(eventKey: Hex | null) {
  const [attendance, setAttendance] = useState<AttendanceEntity[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!eventKey) return;
    try {
      const [list, total] = await Promise.all([
        getAttendanceForEvent(eventKey),
        getAttendanceCount(eventKey),
      ]);
      setAttendance(list);
      setCount(total);
    } catch (err) {
      console.error("Failed to fetch attendance:", err);
    } finally {
      setLoading(false);
    }
  }, [eventKey]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { attendance, count, loading, refetch };
}
