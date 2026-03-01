"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion } from "framer-motion";
import {
  Wallet,
  Calendar,
  Ticket,
  Plus,
  MapPin,
  Clock,
  Users,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/layout/PageTransition";
import { EventStatusBadge } from "@/components/events/EventStatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { EventManagePanel } from "@/components/events/EventManagePanel";
import { useWalletAddress } from "@/hooks/useArkivClient";
import { useMyEvents } from "@/hooks/useMyEvents";
import { useMyRsvps } from "@/hooks/useMyRsvps";
import { formatEventDateRange } from "@/lib/utils/dates";
import type { EventEntity } from "@/lib/arkiv/types";
import type { Hex } from "viem";
import { trackEvent } from "@/lib/utils/umami";

export default function DashboardPage() {
  const { isConnected } = useAccount();
  const walletAddress = useWalletAddress();
  const { events, loading: eventsLoading, refetch: refetchEvents } = useMyEvents(walletAddress);
  const { rsvps, loading: rsvpsLoading } = useMyRsvps(walletAddress);

  if (!isConnected) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-5xl px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 mb-6">
              <Wallet className="h-8 w-8 text-violet-400" />
            </div>
            <h1 className="text-3xl font-bold mb-3">Connect Your Wallet</h1>
            <p className="text-muted-foreground mb-8">
              Connect your wallet to view your dashboard
            </p>
            <ConnectButton />
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-5xl px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <Link href="/events/create">
              <Button className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500">
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </Link>
          </div>

          <Tabs defaultValue="events" className="space-y-6" onValueChange={(tab) => trackEvent("dashboard_tab_switch", { to_tab: tab })}>
            <TabsList className="glass border border-white/10">
              <TabsTrigger value="events" className="gap-2 data-[state=active]:bg-violet-500/20">
                <Calendar className="h-4 w-4" />
                My Events
                {events.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {events.length}
                  </Badge>
                )}
              </TabsTrigger>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="rsvps" className="gap-2 data-[state=active]:bg-violet-500/20">
                    <Ticket className="h-4 w-4" />
                    My RSVPs
                    {rsvps.length > 0 && (
                      <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                        {rsvps.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  Events you confirmed attendance for
                </TooltipContent>
              </Tooltip>
            </TabsList>

            <TabsContent value="events">
              {eventsLoading ? (
                <LoadingSkeleton count={3} />
              ) : events.length === 0 ? (
                <EmptyState
                  icon={Calendar}
                  title="No events yet"
                  description="You haven't created any events. Get started by creating your first event!"
                  action={
                    <Link href="/events/create">
                      <Button className="bg-gradient-to-r from-violet-600 to-blue-600">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Event
                      </Button>
                    </Link>
                  }
                />
              ) : (
                <div className="space-y-6">
                  {events.map((event) => (
                    <EventManageRow
                      key={event.entityKey}
                      event={event}
                      onUpdate={refetchEvents}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="rsvps">
              {rsvpsLoading ? (
                <LoadingSkeleton count={3} />
              ) : rsvps.length === 0 ? (
                <EmptyState
                  icon={Ticket}
                  title="No RSVPs yet"
                  description="You haven't RSVP'd to any events. Browse events to find something interesting!"
                  action={
                    <Link href="/events">
                      <Button className="bg-gradient-to-r from-violet-600 to-blue-600">
                        Browse Events
                      </Button>
                    </Link>
                  }
                />
              ) : (
                <div className="space-y-4">
                  {rsvps.map((rsvp) => (
                    <RsvpRow key={rsvp.entityKey} rsvp={rsvp} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </PageTransition>
  );
}

function EventManageRow({
  event,
  onUpdate,
}: {
  event: EventEntity;
  onUpdate: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();

  return (
    <motion.div
      layout
      className="glass rounded-xl overflow-hidden"
    >
      <div
        className="p-5 cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={() => router.push(`/events/${event.entityKey}`)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <EventStatusBadge status={event.status} />
              <Badge variant="outline" className="text-xs">
                {event.category}
              </Badge>
            </div>
            <h3 className="text-lg font-semibold truncate">{event.title}</h3>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatEventDateRange(event.startDate, event.endDate)}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {event.location}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {event.capacity} capacity
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            {expanded ? "Close" : "Manage"}
          </Button>
        </div>
      </div>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-5 pb-5"
        >
          <EventManagePanel event={event} onUpdate={onUpdate} />
        </motion.div>
      )}
    </motion.div>
  );
}

function RsvpRow({ rsvp }: { rsvp: { entityKey: string; eventKey: string; displayName: string; rsvpDate: number; status: string } }) {
  return (
    <Link href={`/events/${rsvp.eventKey}`}>
      <motion.div
        whileHover={{ y: -2 }}
        className="glass glass-hover rounded-xl p-5"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">
              RSVP as {rsvp.displayName}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Event: {rsvp.eventKey.slice(0, 10)}...
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant={rsvp.status === "confirmed" ? "default" : "secondary"}
              className={rsvp.status === "confirmed" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : ""}
            >
              {rsvp.status}
            </Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
