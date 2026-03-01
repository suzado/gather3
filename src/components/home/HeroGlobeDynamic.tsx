"use client";

import dynamic from "next/dynamic";

export const HeroGlobeDynamic = dynamic(
  () => import("./HeroGlobe").then((mod) => ({ default: mod.HeroGlobe })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center aspect-square w-full max-w-[600px]">
        <div className="w-64 h-64 rounded-full bg-gradient-to-br from-violet-500/10 to-blue-500/10 animate-pulse" />
      </div>
    ),
  }
);
