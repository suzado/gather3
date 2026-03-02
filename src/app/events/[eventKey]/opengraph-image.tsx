import { ImageResponse } from "next/og";
import type { Hex } from "viem";
import { getEvent } from "@/lib/arkiv/events";
import { formatEventDate } from "@/lib/utils/dates";

export const runtime = "edge";
export const alt = "Gather3 Event";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const categoryColors: Record<string, { bg: string; text: string }> = {
  conference: { bg: "rgba(139,92,246,0.3)", text: "#c4b5fd" },
  meetup: { bg: "rgba(59,130,246,0.3)", text: "#93c5fd" },
  workshop: { bg: "rgba(245,158,11,0.3)", text: "#fcd34d" },
  hackathon: { bg: "rgba(6,182,212,0.3)", text: "#67e8f9" },
  social: { bg: "rgba(236,72,153,0.3)", text: "#f9a8d4" },
};

export default async function OgImage({
  params,
}: {
  params: Promise<{ eventKey: string }>;
}) {
  const { eventKey } = await params;
  const event = await getEvent(eventKey as Hex);

  if (!event) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0a0a1a",
            color: "white",
            fontSize: "32px",
          }}
        >
          Event not found
        </div>
      ),
      { ...size }
    );
  }

  const cat = categoryColors[event.category] ?? categoryColors.meetup;
  const dateStr = formatEventDate(event.startDate);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a1628 100%)",
          padding: "60px",
          position: "relative",
        }}
      >
        {/* Gradient orb */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            right: "-80px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Top: category badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              padding: "6px 16px",
              borderRadius: "9999px",
              background: cat.bg,
              color: cat.text,
              fontSize: "18px",
              fontWeight: 600,
              textTransform: "capitalize",
            }}
          >
            {event.category}
          </div>
          <div
            style={{
              padding: "6px 16px",
              borderRadius: "9999px",
              background: "rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.6)",
              fontSize: "18px",
              fontWeight: 500,
              textTransform: "capitalize",
            }}
          >
            {event.status}
          </div>
        </div>

        {/* Middle: title + details */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <h1
            style={{
              fontSize: event.title.length > 60 ? "40px" : "52px",
              fontWeight: 700,
              color: "white",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              maxWidth: "900px",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {event.title.length > 80 ? event.title.slice(0, 77) + "..." : event.title}
          </h1>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "24px",
              fontSize: "22px",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {dateStr}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {event.location.length > 30
                ? event.location.slice(0, 27) + "..."
                : event.location}
            </span>
          </div>
        </div>

        {/* Bottom: Gather3 branding */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <svg viewBox="0 0 64 64" width="32" height="32" fill="white">
              <g transform="rotate(0, 32, 32)">
                <path
                  d="M29 23 L27.5 9 A4.5 4.5 0 0 1 36.5 9 L35 23 A3 3 0 0 1 29 23Z"
                  transform="rotate(15, 32, 16)"
                />
              </g>
              <g transform="rotate(120, 32, 32)">
                <path
                  d="M29 23 L27.5 9 A4.5 4.5 0 0 1 36.5 9 L35 23 A3 3 0 0 1 29 23Z"
                  transform="rotate(15, 32, 16)"
                />
              </g>
              <g transform="rotate(240, 32, 32)">
                <path
                  d="M29 23 L27.5 9 A4.5 4.5 0 0 1 36.5 9 L35 23 A3 3 0 0 1 29 23Z"
                  transform="rotate(15, 32, 16)"
                />
              </g>
            </svg>
            <span style={{ fontSize: "22px", fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>
              gather3.club
            </span>
          </div>

          {event.capacity > 0 && (
            <span style={{ fontSize: "18px", color: "rgba(255,255,255,0.4)" }}>
              Capacity: {event.capacity}
            </span>
          )}
        </div>

        {/* Bottom accent bar */}
        <div
          style={{
            position: "absolute",
            bottom: "0",
            left: "0",
            right: "0",
            height: "4px",
            background: "linear-gradient(90deg, #7c3aed, #3b82f6, #7c3aed)",
            display: "flex",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
