"use client";

import React from "react";

export function VoiceWaveform({
  active,
  color = "emerald",
  bars = 16,
}: {
  active: boolean;
  color?: "emerald" | "amber" | "blue";
  bars?: number;
}) {
  const colorMap = {
    emerald: "bg-emerald-500 dark:bg-emerald-400",
    amber: "bg-amber-500 dark:bg-amber-400",
    blue: "bg-blue-500 dark:bg-blue-400",
  };

  return (
    <div className="flex items-center justify-center gap-1 h-8 px-2" aria-hidden="true">
      {Array.from({ length: bars }).map((_, i) => {
        // Pseudo-random height animation when active
        const animDelay = `${(i * 0.08) % 0.8}s`;
        const animDuration = `${0.5 + (i % 5) * 0.15}s`;

        return (
          <span
            key={i}
            className={`w-1 rounded-full transition-all ${colorMap[color]} ${
              active ? "animate-pulse" : "h-1.5 opacity-40"
            }`}
            style={{
              height: active ? `${12 + ((i * 7) % 20)}px` : "6px",
              animationDelay: animDelay,
              animationDuration: animDuration,
            }}
          />
        );
      })}
    </div>
  );
}
