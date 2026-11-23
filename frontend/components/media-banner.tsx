"use client";
import { useState, type ReactNode } from "react";

/**
 * Real video/photo band. Drop `/public/media/<name>.mp4` and/or `<name>.jpg`.
 * If the files are missing, the animated children are shown instead.
 */
export function MediaBanner({ name, children, className = "" }: { name: string; children?: ReactNode; className?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`glass relative overflow-hidden rounded-[32px] ${className}`}>
      {!failed && (
        <video className="absolute inset-0 size-full object-cover" autoPlay muted loop playsInline preload="metadata" poster={`/media/${name}.jpg`} onError={() => setFailed(true)}>
          <source src={`/media/${name}.mp4`} type="video/mp4" onError={() => setFailed(true)} />
        </video>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#06210f]/75 via-[#06210f]/25 to-transparent" />
      <div className="relative">{children}</div>
    </div>
  );
}
