import { ImageResponse } from "next/og";
import { getOrganizerByWallet } from "@/lib/arkiv/organizer";

export const runtime = "edge";
export const alt = "Gather3 Organizer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({
  params,
}: {
  params: Promise<{ wallet: string }>;
}) {
  const { wallet } = await params;
  const organizer = await getOrganizerByWallet(wallet);

  if (!organizer) {
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
          Organizer not found
        </div>
      ),
      { ...size }
    );
  }

  const shortWallet = `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;

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
            top: "-60px",
            left: "-60px",
            width: "350px",
            height: "350px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Top label */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "18px",
            color: "rgba(255,255,255,0.4)",
            fontWeight: 500,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          Event Organizer
        </div>

        {/* Middle: avatar + name + bio */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            {/* Gradient avatar */}
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "20px",
                background: "linear-gradient(135deg, #7c3aed, #3b82f6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "36px",
                fontWeight: 700,
                color: "white",
              }}
            >
              {organizer.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <h1
                style={{
                  fontSize: "48px",
                  fontWeight: 700,
                  color: "white",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.1,
                }}
              >
                {organizer.name.length > 30
                  ? organizer.name.slice(0, 27) + "..."
                  : organizer.name}
              </h1>
              <span style={{ fontSize: "20px", color: "rgba(255,255,255,0.4)" }}>
                {shortWallet}
              </span>
            </div>
          </div>

          {organizer.bio && (
            <p
              style={{
                fontSize: "22px",
                color: "rgba(255,255,255,0.5)",
                lineHeight: 1.5,
                maxWidth: "800px",
              }}
            >
              {organizer.bio.length > 120
                ? organizer.bio.slice(0, 117) + "..."
                : organizer.bio}
            </p>
          )}
        </div>

        {/* Bottom: Gather3 branding */}
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
