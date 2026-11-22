"use client";

import { useEffect, useRef, useState } from "react";

/**
 * AmbientBackground
 * Atmospheric, procedural lightfield and aurora mesh environment.
 * Uses hardware-accelerated CSS composite layers with a subtle canvas grain
 * to produce a cinematic, liquid-spatial environment.
 * Complies with prefers-reduced-motion.
 */
export function AmbientBackground() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#07130B]"
    >
      {/* Base Radial Spatial Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.18),rgba(7,19,11,0.95))]" />

      {/* Floating Aurora Orbs with Physics Drifts */}
      <div
        className={`absolute -top-32 -left-20 size-[550px] rounded-full bg-gradient-to-br from-emerald-600/25 via-emerald-800/15 to-transparent blur-[110px] ${
          reducedMotion ? "" : "animate-aurora-slow"
        }`}
      />

      <div
        className={`absolute top-1/4 -right-24 size-[600px] rounded-full bg-gradient-to-bl from-amber-500/15 via-emerald-900/20 to-transparent blur-[130px] ${
          reducedMotion ? "" : "animate-aurora-reverse"
        }`}
      />

      <div
        className={`absolute -bottom-36 left-1/3 size-[650px] rounded-full bg-gradient-to-tr from-emerald-700/20 via-teal-900/15 to-transparent blur-[120px] ${
          reducedMotion ? "" : "animate-aurora-drift"
        }`}
      />

      {/* Center Subtle Harvest Glow Accent */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[700px] rounded-full bg-[radial-gradient(circle,rgba(234,179,8,0.06)_0%,transparent_70%)] blur-[90px] ${
          reducedMotion ? "" : "animate-pulse-glow"
        }`}
      />

      {/* Subtle Spatial Grid Lines (Apple Pro / Fintech Aesthetic) */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, black 20%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, black 20%, transparent 80%)",
        }}
      />

      {/* Micro-texture / Noise Overlay for Film Grain Tactility */}
      <div
        className="absolute inset-0 opacity-[0.025] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
