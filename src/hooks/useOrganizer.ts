"use client";
import { useState, useEffect } from "react";
import { getOrganizerByWallet, getOrganizerByKey } from "@/lib/arkiv/organizer";
import type { OrganizerEntity } from "@/lib/arkiv/types";
import type { Hex } from "viem";

export function useOrganizerByWallet(walletAddress: string | undefined) {
  const [organizer, setOrganizer] = useState<OrganizerEntity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!walletAddress) {
      setOrganizer(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    getOrganizerByWallet(walletAddress)
      .then(setOrganizer)
      .catch(() => setOrganizer(null))
      .finally(() => setLoading(false));
  }, [walletAddress]);

  return { organizer, loading };
}

export function useOrganizerByKey(entityKey: Hex | null) {
  const [organizer, setOrganizer] = useState<OrganizerEntity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!entityKey) return;
    getOrganizerByKey(entityKey)
      .then(setOrganizer)
      .catch(() => setOrganizer(null))
      .finally(() => setLoading(false));
  }, [entityKey]);

  return { organizer, loading };
}
