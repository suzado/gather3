"use client";

import { useCallback, useEffect, useRef } from "react";
import createGlobe, { type COBEOptions } from "cobe";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const EVENT_MARKERS: COBEOptions["markers"] = [
  // Major hubs — large markers
  { location: [37.7595, -122.4367], size: 0.1 }, // San Francisco
  { location: [40.7128, -74.006], size: 0.12 }, // New York
  { location: [51.5074, -0.1278], size: 0.11 }, // London
  { location: [35.6762, 139.6503], size: 0.1 }, // Tokyo
  { location: [1.3521, 103.8198], size: 0.09 }, // Singapore
  // Secondary hubs — medium markers
  { location: [48.8566, 2.3522], size: 0.07 }, // Paris
  { location: [52.52, 13.405], size: 0.07 }, // Berlin
  { location: [55.7558, 37.6173], size: 0.06 }, // Moscow
  { location: [-33.8688, 151.2093], size: 0.07 }, // Sydney
  { location: [-23.5505, -46.6333], size: 0.08 }, // São Paulo
  { location: [19.076, 72.8777], size: 0.09 }, // Mumbai
  { location: [25.2048, 55.2708], size: 0.08 }, // Dubai
  { location: [37.5665, 126.978], size: 0.09 }, // Seoul
  { location: [22.3193, 114.1694], size: 0.08 }, // Hong Kong
  // Emerging — small markers
  { location: [34.0522, -118.2437], size: 0.06 }, // Los Angeles
  { location: [41.9028, 12.4964], size: 0.05 }, // Rome
  { location: [59.9139, 10.7522], size: 0.05 }, // Oslo
  { location: [13.7563, 100.5018], size: 0.06 }, // Bangkok
  { location: [-34.6037, -58.3816], size: 0.05 }, // Buenos Aires
  { location: [30.0444, 31.2357], size: 0.05 }, // Cairo
  { location: [39.9042, 116.4074], size: 0.07 }, // Beijing
  { location: [43.6532, -79.3832], size: 0.06 }, // Toronto
  { location: [-6.2088, 106.8456], size: 0.05 }, // Jakarta
  { location: [33.8688, 151.2093], size: 0.04 }, // Melbourne area
];

interface HeroGlobeProps {
  className?: string;
  size?: number;
  interactive?: boolean;
}

export function HeroGlobe({
  className,
  size = 600,
  interactive = true,
}: HeroGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const globeRef = useRef<ReturnType<typeof createGlobe> | null>(null);
  const reducedMotion = useReducedMotion();

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!interactive) return;
      pointerInteracting.current =
        e.clientX - pointerInteractionMovement.current;
      if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
    },
    [interactive]
  );

  const onPointerUp = useCallback(() => {
    pointerInteracting.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = "grab";
  }, []);

  const onPointerOut = useCallback(() => {
    pointerInteracting.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = "grab";
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (pointerInteracting.current !== null) {
      pointerInteractionMovement.current =
        e.clientX - pointerInteracting.current;
    }
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    let currentPhi = 0;

    try {
      const globe = createGlobe(canvasRef.current, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width: size * 2,
        height: size * 2,
        phi: 0,
        theta: 0.3,
        dark: 1,
        diffuse: 1.2,
        mapSamples: 16000,
        mapBrightness: 3,
        mapBaseBrightness: 0.04,
        baseColor: [0.3, 0.2, 0.5],
        markerColor: [0.6, 0.4, 1.0],
        glowColor: [0.2, 0.14, 0.45],
        markers: EVENT_MARKERS,
        scale: 1.05,
        offset: [0, 0],
        opacity: 0.9,
        onRender: (state) => {
          if (pointerInteracting.current === null && !reducedMotion) {
            currentPhi += 0.003;
          }
          state.phi = currentPhi + pointerInteractionMovement.current / 200;
          state.width = size * 2;
          state.height = size * 2;

          // Pulse markers — stronger, multi-frequency
          if (!reducedMotion) {
            const time = Date.now() / 1000;
            state.markers = EVENT_MARKERS.map((m, i) => ({
              ...m,
              size:
                m.size *
                (1 +
                  0.25 * Math.sin(time * 2.5 + i * 0.8) +
                  0.1 * Math.sin(time * 4 + i * 1.3)),
            }));
          }
        },
      });

      globeRef.current = globe;

      // Fade in
      if (canvasRef.current) {
        canvasRef.current.style.opacity = "0";
        requestAnimationFrame(() => {
          if (canvasRef.current) canvasRef.current.style.opacity = "1";
        });
      }

      return () => {
        globe.destroy();
        globeRef.current = null;
      };
    } catch {
      // WebGL not available — canvas stays empty, placeholder remains visible
    }
  }, [size, reducedMotion]);

  return (
    <div className={className}>
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerOut={onPointerOut}
        onMouseMove={onMouseMove}
        style={{
          width: "100%",
          height: "100%",
          maxWidth: size,
          maxHeight: size,
          cursor: interactive ? "grab" : "default",
          contain: "layout paint size",
          aspectRatio: "1",
          transition: "opacity 0.8s ease-in-out",
        }}
      />
    </div>
  );
}
