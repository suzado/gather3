"use client";

import dynamic from "next/dynamic";

export const EventMapDynamic = dynamic(
  () =>
    import("./EventMapView").then((mod) => ({ default: mod.EventMapView })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[500px] rounded-2xl glass flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading map...</div>
      </div>
    ),
  }
);
