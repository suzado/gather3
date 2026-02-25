"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Square,
  XCircle,
  Trash2,
  ArrowRightLeft,
  Loader2,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useArkivWallet } from "@/hooks/useArkivClient";
import {
  updateEventStatus,
  deleteEvent,
  transferEvent,
} from "@/lib/arkiv/events";
import type { EventEntity } from "@/lib/arkiv/types";
import type { EventStatus } from "@/lib/utils/constants";
import type { Hex } from "viem";

interface EventManagePanelProps {
  event: EventEntity;
  onUpdate: () => void;
}

const STATUS_TRANSITIONS: Record<EventStatus, { next: EventStatus; label: string; icon: typeof Play }[]> = {
  upcoming: [
    { next: "live", label: "Go Live", icon: Play },
    { next: "cancelled", label: "Cancel", icon: XCircle },
  ],
  live: [
    { next: "ended", label: "End Event", icon: Square },
    { next: "cancelled", label: "Cancel", icon: XCircle },
  ],
  ended: [],
  cancelled: [],
};

export function EventManagePanel({ event, onUpdate }: EventManagePanelProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [transferAddress, setTransferAddress] = useState("");
  const [transferOpen, setTransferOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const arkivWallet = useArkivWallet();

  const transitions = STATUS_TRANSITIONS[event.status] || [];

  async function handleStatusChange(newStatus: EventStatus) {
    if (!arkivWallet) return;
    setLoading(newStatus);
    try {
      await updateEventStatus(arkivWallet, event.entityKey, newStatus);
      toast.success(`Event status updated to ${newStatus}`);
      onUpdate();
    } catch (err) {
      console.error("Status update error:", err);
      toast.error("Failed to update status");
    } finally {
      setLoading(null);
    }
  }

  async function handleDelete() {
    if (!arkivWallet) return;
    setLoading("delete");
    try {
      await deleteEvent(arkivWallet, event.entityKey);
      toast.success("Event deleted");
      onUpdate();
      setDeleteOpen(false);
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete event");
    } finally {
      setLoading(null);
    }
  }

  async function handleTransfer() {
    if (!arkivWallet || !transferAddress) return;
    if (!/^0x[a-fA-F0-9]{40}$/.test(transferAddress)) {
      toast.error("Invalid wallet address");
      return;
    }
    setLoading("transfer");
    try {
      await transferEvent(
        arkivWallet,
        event.entityKey,
        transferAddress as Hex
      );
      toast.success("Event ownership transferred!");
      onUpdate();
      setTransferOpen(false);
    } catch (err) {
      console.error("Transfer error:", err);
      toast.error("Failed to transfer ownership");
    } finally {
      setLoading(null);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-5 space-y-4"
    >
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-violet-400" />
        <h3 className="text-sm font-semibold">Manage Event</h3>
      </div>

      {/* Status Transitions */}
      {transitions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Update Status</p>
          <div className="flex flex-wrap gap-2">
            {transitions.map((t) => {
              const Icon = t.icon;
              const isLoading = loading === t.next;
              return (
                <Button
                  key={t.next}
                  size="sm"
                  variant={t.next === "cancelled" ? "destructive" : "secondary"}
                  onClick={() => handleStatusChange(t.next)}
                  disabled={loading !== null}
                >
                  {isLoading ? (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  ) : (
                    <Icon className="mr-1 h-3 w-3" />
                  )}
                  {t.label}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {transitions.length === 0 && (
        <p className="text-xs text-muted-foreground">
          <Badge variant="outline" className="text-xs">
            {event.status}
          </Badge>{" "}
          — no further status changes available
        </p>
      )}

      <Separator className="bg-white/10" />

      {/* Transfer Ownership */}
      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="w-full">
            <ArrowRightLeft className="mr-2 h-3 w-3" />
            Transfer Ownership
          </Button>
        </DialogTrigger>
        <DialogContent className="glass border-white/10">
          <DialogHeader>
            <DialogTitle>Transfer Event Ownership</DialogTitle>
            <DialogDescription>
              Transfer this event to another wallet. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="0x... (new owner wallet address)"
              value={transferAddress}
              onChange={(e) => setTransferAddress(e.target.value)}
              className="glass border-white/10"
            />
            <Button
              onClick={handleTransfer}
              disabled={loading !== null || !transferAddress}
              className="w-full bg-gradient-to-r from-violet-600 to-blue-600"
            >
              {loading === "transfer" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ArrowRightLeft className="mr-2 h-4 w-4" />
              )}
              Confirm Transfer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Event */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full text-destructive hover:text-destructive">
            <Trash2 className="mr-2 h-3 w-3" />
            Delete Event
          </Button>
        </DialogTrigger>
        <DialogContent className="glass border-white/10">
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure? This will permanently delete &quot;{event.title}&quot; and all
              associated data. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading !== null}
              className="flex-1"
            >
              {loading === "delete" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
