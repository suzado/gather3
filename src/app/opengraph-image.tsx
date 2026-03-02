import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Gather3 — Own Your Events";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a1628 100%)",
          position: "relative",
        }}
      >
        {/* Gradient orbs */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            left: "-100px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(37,99,235,0.25) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Logo mark */}
        <svg
          viewBox="0 0 64 64"
          width="80"
          height="80"
          fill="white"
          style={{ marginBottom: "24px" }}
        >
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

        {/* Title */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "4px",
            marginBottom: "16px",
          }}
        >
          <span
            style={{
              fontSize: "56px",
              fontWeight: 700,
              color: "white",
              letterSpacing: "-0.02em",
            }}
          >
            Gather
          </span>
          <span
            style={{
              fontSize: "56px",
              fontWeight: 700,
              background: "linear-gradient(135deg, #a78bfa, #60a5fa)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            3
          </span>
        </div>

        {/* Tagline */}
        <p
          style={{
            fontSize: "24px",
            color: "rgba(255,255,255,0.6)",
            maxWidth: "600px",
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          Own Your Events. Web3-native event platform built on Arkiv.
        </p>

        {/* Bottom bar */}
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
