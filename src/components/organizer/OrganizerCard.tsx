"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Globe, Twitter, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { walletToGradient, shortenAddress } from "@/lib/utils/avatars";
import type { OrganizerEntity } from "@/lib/arkiv/types";

interface OrganizerCardProps {
  organizer: OrganizerEntity;
  compact?: boolean;
}

export function OrganizerCard({ organizer, compact }: OrganizerCardProps) {
  const gradient = walletToGradient(organizer.wallet);

  if (compact) {
    return (
      <Link href={`/organizer/${organizer.wallet}`}>
        <div className="flex items-center gap-3 group cursor-pointer">
          <div
            className="h-10 w-10 rounded-full shrink-0"
            style={{
              background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
            }}
          />
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground group-hover:text-violet-400 transition-colors truncate">
              {organizer.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {shortenAddress(organizer.wallet)}
            </p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="glass glass-hover rounded-xl p-6"
    >
      <Link href={`/organizer/${organizer.wallet}`}>
        <div className="flex items-start gap-4">
          <div
            className="h-16 w-16 rounded-full shrink-0"
            style={{
              background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
            }}
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-foreground mb-1 truncate">
              {organizer.name}
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              {shortenAddress(organizer.wallet)}
            </p>
            {organizer.bio && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {organizer.bio}
              </p>
            )}
            <div className="flex items-center gap-3">
              {organizer.website && (
                <a
                  href={organizer.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-muted-foreground hover:text-violet-400 transition-colors"
                >
                  <Globe className="h-4 w-4" />
                </a>
              )}
              {organizer.twitter && (
                <a
                  href={`https://x.com/${organizer.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-muted-foreground hover:text-violet-400 transition-colors"
                >
                  <Twitter className="h-4 w-4" />
                </a>
              )}
              <Badge variant="outline" className="text-xs">
                <ExternalLink className="h-3 w-3 mr-1" />
                View Profile
              </Badge>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
