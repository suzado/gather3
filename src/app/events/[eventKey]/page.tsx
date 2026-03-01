"use client";

import { use } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Users,
  Tag,
  Globe,
  Clock,
  ArrowLeft,
  ExternalLink,
  Github,
  Send,
} from "lucide-react";
import type { SocialLinks } from "@/lib/arkiv/types";
import { PageTransition } from "@/components/layout/PageTransition";
import { EventStatusBadge } from "@/components/events/EventStatusBadge";
import { RsvpButton } from "@/components/rsvp/RsvpButton";
import { RsvpCounter } from "@/components/rsvp/RsvpCounter";
import { RsvpList } from "@/components/rsvp/RsvpList";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useEvent } from "@/hooks/useEvent";
import { useRsvps, useUserRsvp } from "@/hooks/useRsvps";
import { useOrganizerByKey } from "@/hooks/useOrganizer";
import { useWalletAddress } from "@/hooks/useArkivClient";
import { useLiveRsvps } from "@/hooks/useLiveRsvps";
import { LiveRsvpFeed } from "@/components/rsvp/LiveRsvpFeed";
import { EventManagePanel } from "@/components/events/EventManagePanel";
import { AddToCalendarButton } from "@/components/events/AddToCalendarButton";
import { EventCountdown } from "@/components/events/EventCountdown";
import { useCoverImage } from "@/hooks/useCoverImage";
import { useAccount } from "wagmi";
import {
  formatEventDate,
  formatEventTime,
  formatEventDateRange,
  timeUntilEvent,
} from "@/lib/utils/dates";
import type { Hex } from "viem";
import { trackEvent } from "@/lib/utils/umami";

const categoryGradients: Record<string, string> = {
  conference: "from-violet-600/20 to-purple-600/20",
  meetup: "from-blue-600/20 to-indigo-600/20",
  workshop: "from-amber-600/20 to-yellow-600/20",
  hackathon: "from-cyan-600/20 to-teal-600/20",
  social: "from-pink-600/20 to-rose-600/20",
};

function EventDetailSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <Skeleton className="h-8 w-24 mb-8" />
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-10 w-3/4" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="glass rounded-xl p-4 space-y-1">
      <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
        <Icon className="h-3.5 w-3.5 text-violet-400/70" />
        {label}
      </div>
      <p className="text-sm font-medium text-foreground/90">{value}</p>
    </div>
  );
}

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ eventKey: string }>;
}) {
  const { eventKey } = use(params);
  const eventKeyHex = eventKey as Hex;

  const walletAddress = useWalletAddress();
  const { address } = useAccount();
  const { event, loading: eventLoading, error, refetch: refetchEvent } = useEvent(eventKeyHex);
  const { rsvps, count: rsvpCount, loading: rsvpsLoading, refetch: refetchRsvps } =
    useRsvps(eventKeyHex);
  const { rsvp: userRsvp, refetch: refetchUserRsvp } = useUserRsvp(
    eventKeyHex,
    walletAddress
  );
  const { organizer } = useOrganizerByKey(
    event?.organizerKey ? (event.organizerKey as Hex) : null
  );
  const { liveEvents } = useLiveRsvps(eventKeyHex);
  const { imageUrl: coverImageUrl } = useCoverImage(event?.coverImageKey);

  const displayImageUrl = coverImageUrl || event?.imageUrl || null;

  const isOwner = event?.owner && address
    ? event.owner.toLowerCase() === address.toLowerCase()
    : false;

  const handleRsvpChange = () => {
    refetchRsvps();
    refetchUserRsvp();
  };

  if (eventLoading) {
    return (
      <PageTransition>
        <EventDetailSkeleton />
      </PageTransition>
    );
  }

  if (error || !event) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-2xl font-bold mb-4">Event not found</h1>
          <p className="text-muted-foreground mb-8">
            This event may have been removed or the link may be incorrect.
          </p>
          <Link href="/events">
            <Button variant="outline" className="border-white/10 hover:bg-white/5">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Button>
          </Link>
        </div>
      </PageTransition>
    );
  }

  const gradientClass =
    categoryGradients[event.category] ?? "from-violet-600/20 to-blue-600/20";
  const isEventOver = event.status === "ended" || event.status === "cancelled";

  return (
    <PageTransition>
      <div className="relative">
        {/* Hero gradient header */}
        <div
          className={`absolute inset-x-0 top-0 h-72 -z-10 bg-gradient-to-b ${gradientClass} to-transparent`}
        />

        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link
              href="/events"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Events
            </Link>
          </motion.div>

          {/* Cover image */}
          {displayImageUrl && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl overflow-hidden mb-8 border border-white/[0.08]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayImageUrl}
                alt={event.title}
                className="w-full aspect-video object-cover"
              />
            </motion.div>
          )}

          {/* Event header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4 mb-8"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="bg-violet-500/15 text-violet-400 border-violet-500/20 text-xs"
              >
                {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
              </Badge>
              <EventStatusBadge status={event.status} />
              {event.status === "upcoming" && (
                <span className="text-xs text-muted-foreground/70">
                  {timeUntilEvent(event.startDate)}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              {event.title}
            </h1>

            {organizer && (
              <p className="text-sm text-muted-foreground">
                Organized by{" "}
                <span className="text-foreground/80 font-medium">
                  {organizer.name}
                </span>
              </p>
            )}
          </motion.div>

          {/* Info grid */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
          >
            <InfoCard
              icon={Calendar}
              label="Date"
              value={formatEventDateRange(event.startDate, event.endDate)}
            />
            <InfoCard
              icon={Clock}
              label="Time"
              value={`${formatEventTime(event.startDate)} - ${formatEventTime(event.endDate)}`}
            />
            <InfoCard
              icon={MapPin}
              label="Location"
              value={event.venue ? `${event.venue}, ${event.location}` : event.location}
            />
            <InfoCard
              icon={Globe}
              label="Format"
              value={
                event.locationType === "in-person"
                  ? "In Person"
                  : event.locationType === "online"
                    ? "Online"
                    : "Hybrid"
              }
            />
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left column: description + tags */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="lg:col-span-2 space-y-8"
            >
              {/* Description */}
              <div className="glass rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-4">About this event</h2>
                <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </div>
              </div>

              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground/50 mt-0.5" />
                  {event.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-xs bg-white/[0.05] text-muted-foreground border-none"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* External link */}
              {event.externalUrl && (
                <a
                  href={event.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Event website
                </a>
              )}

              {/* Social media links */}
              {event.socialLinks && <SocialLinksSection links={event.socialLinks} />}

              {/* Attendee list */}
              <div className="glass rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-4">
                  Attendees
                  {rsvpCount > 0 && (
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      ({rsvpCount})
                    </span>
                  )}
                </h2>
                {rsvpsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-28" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <RsvpList
                    rsvps={rsvps}
                    maxDisplay={10}
                    totalCount={rsvpCount}
                  />
                )}
              </div>
            </motion.div>

            {/* Right column: RSVP card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="space-y-6"
            >
              {event.status === "upcoming" && (
                <EventCountdown startDate={event.startDate} />
              )}

              <div className="glass rounded-2xl p-6 sticky top-24 space-y-6">
                <h2 className="text-lg font-semibold">RSVP</h2>

                <RsvpCounter count={rsvpCount} capacity={event.capacity} />

                <Separator className="bg-white/[0.06]" />

                <RsvpButton
                  eventKey={eventKeyHex}
                  userRsvp={userRsvp}
                  onRsvpChange={handleRsvpChange}
                  disabled={isEventOver}
                />

                {isEventOver && (
                  <p className="text-xs text-muted-foreground text-center">
                    This event has {event.status === "cancelled" ? "been cancelled" : "ended"}.
                  </p>
                )}

                {/* Add to Calendar */}
                {!isEventOver && (
                  <>
                    <Separator className="bg-white/[0.06]" />
                    <div className="flex justify-center">
                      <AddToCalendarButton
                        event={{
                          title: event.title,
                          description: event.description,
                          startDate: event.startDate,
                          endDate: event.endDate,
                          timezone: event.timezone,
                          location: event.location,
                          venue: event.venue,
                          entityKey: event.entityKey,
                        }}
                      />
                    </div>
                  </>
                )}

                {/* Live RSVP Feed */}
                {liveEvents.length > 0 && (
                  <>
                    <Separator className="bg-white/[0.06]" />
                    <LiveRsvpFeed events={liveEvents} />
                  </>
                )}
              </div>

              {/* Management Panel (owner only) */}
              {isOwner && (
                <EventManagePanel
                  event={event}
                  onUpdate={() => refetchEvent()}
                />
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

const SOCIAL_PLATFORMS = [
  {
    key: "twitter" as const,
    label: "Twitter / X",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    key: "discord" as const,
    label: "Discord",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    ),
  },
  {
    key: "telegram" as const,
    label: "Telegram",
    icon: <Send className="h-4 w-4" />,
  },
  {
    key: "farcaster" as const,
    label: "Farcaster",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M5.322 2h13.356v2.353H5.322V2zm-2.87 4.706h19.096v1.176h-1.006l-.287 11.765h.635c.09 0 .163.079.163.176v1.177H2.947v-1.177c0-.097.073-.176.163-.176h.635L3.458 7.882H2.452V4.706zm4.727 2.353c0-.326.252-.59.563-.59h8.516c.311 0 .563.264.563.59v1.176h-1.127v7.06c0 .325-.252.588-.563.588-.311 0-.563-.263-.563-.589V10.235h-5.135v7.06c0 .325-.252.588-.563.588-.311 0-.563-.263-.563-.589v-7.06H7.179V7.059z" />
      </svg>
    ),
  },
  {
    key: "github" as const,
    label: "GitHub",
    icon: <Github className="h-4 w-4" />,
  },
] as const;

function SocialLinksSection({ links }: { links: SocialLinks }) {
  const activeLinks = SOCIAL_PLATFORMS.filter((p) => links[p.key]);
  if (activeLinks.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3">
      {activeLinks.map((platform) => (
        <a
          key={platform.key}
          href={links[platform.key]}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("event_social_link_click", { platform: platform.key })}
          className="inline-flex items-center gap-2 rounded-lg glass px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {platform.icon}
          {platform.label}
        </a>
      ))}
    </div>
  );
}
