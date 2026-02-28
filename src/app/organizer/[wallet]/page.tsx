"use client";

import { use, useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Globe,
  Twitter,
  Calendar,
  Users,
  Edit,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageTransition } from "@/components/layout/PageTransition";
import { EventCard } from "@/components/events/EventCard";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { walletToGradient, shortenAddress } from "@/lib/utils/avatars";
import { getOrganizerByWallet } from "@/lib/arkiv/organizer";
import { queryEvents } from "@/lib/arkiv/events";
import type { OrganizerEntity, EventEntity } from "@/lib/arkiv/types";

const MAX_RETRIES = 5;
const RETRY_INTERVAL_MS = 2000;

export default function OrganizerProfilePage({
  params,
}: {
  params: Promise<{ wallet: string }>;
}) {
  const { wallet } = use(params);
  const searchParams = useSearchParams();
  const justCreated = searchParams.get("created") === "true";
  const { address } = useAccount();
  const [organizer, setOrganizer] = useState<OrganizerEntity | null>(null);
  const [events, setEvents] = useState<EventEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(justCreated);
  const retryCount = useRef(0);

  const isOwnProfile = address?.toLowerCase() === wallet?.toLowerCase();

  const loadOrganizer = useCallback(async () => {
    if (!wallet) return;
    try {
      const org = await getOrganizerByWallet(wallet);
      setOrganizer(org);

      if (org) {
        retryCount.current = 0;
        const evts = await queryEvents(
          { organizerKey: org.entityKey },
          50
        );
        setEvents(evts);
      }
      return org;
    } catch (err) {
      console.error("Failed to load organizer:", err);
      return null;
    }
  }, [wallet]);

  useEffect(() => {
    if (!wallet) return;

    let retryTimer: ReturnType<typeof setTimeout>;
    let cancelled = false;

    async function load() {
      setLoading(true);
      const org = await loadOrganizer();

      if (!org && justCreated && retryCount.current < MAX_RETRIES && !cancelled) {
        retryCount.current += 1;
        retryTimer = setTimeout(async () => {
          if (cancelled) return;
          const retried = await loadOrganizer();
          if (!retried && retryCount.current < MAX_RETRIES && !cancelled) {
            load();
          } else {
            setLoading(false);
          }
        }, RETRY_INTERVAL_MS);
      } else {
        setLoading(false);
      }
    }
    load();

    return () => {
      cancelled = true;
      clearTimeout(retryTimer);
    };
  }, [wallet, justCreated, loadOrganizer]);

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  if (loading) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-5xl px-4 py-12">
          {justCreated ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent mb-6" />
              <h3 className="text-lg font-semibold text-foreground/90 mb-2">
                Setting up your profile...
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                Your organizer profile is being created on the Arkiv network. This may take a few seconds.
              </p>
            </motion.div>
          ) : (
            <LoadingSkeleton count={3} />
          )}
        </div>
      </PageTransition>
    );
  }

  if (!organizer) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-5xl px-4 py-12">
          <EmptyState
            icon={Users}
            title="Organizer not found"
            description="This wallet doesn't have an organizer profile yet"
            action={
              isOwnProfile ? (
                <Link href="/organizer/setup">
                  <Button className="bg-gradient-to-r from-violet-600 to-blue-600">
                    Create Your Profile
                  </Button>
                </Link>
              ) : undefined
            }
          />
        </div>
      </PageTransition>
    );
  }

  const gradient = walletToGradient(organizer.wallet);

  return (
    <PageTransition>
      <div className="mx-auto max-w-5xl px-4 py-12">
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4"
          >
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <p className="text-sm text-emerald-200">
              Your organizer profile has been created successfully! You can now start creating events.
            </p>
          </motion.div>
        )}

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8 mb-8"
        >
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div
              className="h-24 w-24 rounded-2xl shrink-0"
              style={{
                background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
              }}
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-3xl font-bold mb-1">{organizer.name}</h1>
                  <p className="text-muted-foreground text-sm">
                    {shortenAddress(organizer.wallet)}
                  </p>
                </div>
                {isOwnProfile && (
                  <Link href="/organizer/setup">
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  </Link>
                )}
              </div>

              {organizer.bio && (
                <p className="mt-4 text-muted-foreground">{organizer.bio}</p>
              )}

              <div className="flex items-center gap-4 mt-4">
                {organizer.website && (
                  <a
                    href={organizer.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-violet-400 transition-colors"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {organizer.twitter && (
                  <a
                    href={`https://x.com/${organizer.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-violet-400 transition-colors"
                  >
                    <Twitter className="h-4 w-4" />
                    @{organizer.twitter}
                  </a>
                )}
              </div>

              <div className="flex items-center gap-4 mt-4">
                <Badge variant="secondary" className="gap-1">
                  <Calendar className="h-3 w-3" />
                  {events.length} event{events.length !== 1 ? "s" : ""}
                </Badge>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Events Section */}
        <Separator className="bg-white/10 mb-8" />

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Events</h2>
          {isOwnProfile && (
            <Link href="/events/create">
              <Button
                size="sm"
                className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500"
              >
                Create Event
              </Button>
            </Link>
          )}
        </div>

        {events.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No events yet"
            description={
              isOwnProfile
                ? "You haven't created any events yet. Get started!"
                : "This organizer hasn't created any events yet"
            }
            action={
              isOwnProfile ? (
                <Link href="/events/create">
                  <Button className="bg-gradient-to-r from-violet-600 to-blue-600">
                    Create Your First Event
                  </Button>
                </Link>
              ) : undefined
            }
          />
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.1 },
              },
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {events.map((event) => (
              <motion.div
                key={event.entityKey}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <EventCard event={event} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
