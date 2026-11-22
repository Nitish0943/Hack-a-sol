"use client";

import React, { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Volume2, VolumeX, Sparkles } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";

export function Card({
  children,
  className,
  elevated = false,
  variant = "default",
}: {
  children: ReactNode;
  className?: string;
  elevated?: boolean;
  variant?: "default" | "elevated" | "emerald" | "gold" | "subtle";
}) {
  const variantStyles = {
    default: "glass-card",
    elevated: "glass-elevated",
    emerald: "glass-emerald",
    gold: "glass-gold",
    subtle: "bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl",
  };

  return (
    <section
      className={cn(
        variantStyles[variant],
        "p-5 sm:p-6",
        elevated && "shadow-[0_24px_50px_-12px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.15)]",
        className
      )}
    >
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  detail,
  icon,
  tone = "green",
  audioText,
}: {
  label: string;
  value: string;
  detail: string;
  icon?: ReactNode;
  tone?: "green" | "yellow" | "blue" | "slate" | "red";
  audioText?: string;
}) {
  const { speak, isSpeaking } = useTranslation();

  const tones = {
    green: "border-emerald-500/20 bg-gradient-to-br from-emerald-950/40 via-emerald-900/10 to-transparent text-emerald-100",
    yellow: "border-amber-500/25 bg-gradient-to-br from-amber-950/40 via-amber-900/10 to-transparent text-amber-100",
    blue: "border-cyan-500/20 bg-gradient-to-br from-cyan-950/40 via-cyan-900/10 to-transparent text-cyan-100",
    slate: "border-slate-500/20 bg-gradient-to-br from-slate-900/50 via-slate-800/10 to-transparent text-slate-100",
    red: "border-rose-500/25 bg-gradient-to-br from-rose-950/40 via-rose-900/10 to-transparent text-rose-100",
  };

  const iconTones = {
    green: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.3)]",
    yellow: "bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.25)]",
    blue: "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.25)]",
    slate: "bg-slate-700/30 text-slate-300 border border-slate-600/30",
    red: "bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.25)]",
  };

  const handleRead = () => {
    const textToSpeak = audioText || `${label}: ${value}. ${detail}`;
    speak(textToSpeak);
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border p-5 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-white/30",
        tones[tone]
      )}
    >
      {/* Specular Top Rim Lighting */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">{label}</p>
            <button
              onClick={handleRead}
              title="Listen to this card"
              className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-slate-400 hover:text-emerald-400 cursor-pointer"
            >
              <Volume2 className="size-3.5" />
            </button>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono tabular-nums">
            {value}
          </p>
          <p className="mt-1 text-xs font-medium text-slate-400">{detail}</p>
        </div>
        <span
          className={cn(
            "grid size-12 shrink-0 place-items-center rounded-2xl transition-transform duration-300 group-hover:scale-105",
            iconTones[tone]
          )}
        >
          {icon}
        </span>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const isGood =
    normalized.includes("eligible") ||
    normalized.includes("approved") ||
    normalized.includes("verified") ||
    normalized.includes("resolved") ||
    normalized.includes("received") ||
    normalized.includes("completed");

  const isPending =
    normalized.includes("review") ||
    normalized.includes("pending") ||
    normalized.includes("submitted") ||
    normalized.includes("applied") ||
    normalized.includes("verification required");

  const isBad =
    normalized.includes("not eligible") ||
    normalized.includes("rejected") ||
    normalized.includes("dismissed") ||
    normalized.includes("closed");

  const badgeClass = isGood
    ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
    : isPending
      ? "bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
      : isBad
        ? "bg-rose-500/15 text-rose-300 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.2)]"
        : "bg-cyan-500/15 text-cyan-300 border-cyan-500/30";

  const dotClass = isGood
    ? "bg-emerald-400 shadow-[0_0_8px_#34D399]"
    : isPending
      ? "bg-amber-400 shadow-[0_0_8px_#FBBF24]"
      : isBad
        ? "bg-rose-400 shadow-[0_0_8px_#FB7185]"
        : "bg-cyan-400 shadow-[0_0_8px_#38BDF8]";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold border backdrop-blur-md",
        badgeClass
      )}
    >
      <span className={cn("size-2 rounded-full animate-pulse", dotClass)} />
      {status}
    </span>
  );
}

export function PageHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  const { speak } = useTranslation();

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-white/[0.08] pb-5">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display">
            {title}
          </h1>
          <button
            onClick={() => speak(`${title}. ${description || ""}`)}
            title="Read title and description"
            className="text-slate-400 hover:text-emerald-400 transition p-1 cursor-pointer"
          >
            <Volume2 className="size-4" />
          </button>
        </div>
        {description && <p className="mt-1.5 text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function VoiceAssistButton({ text, label = "सुनो (Audio)" }: { text: string; label?: string }) {
  const { speak, stopSpeaking, isSpeaking } = useTranslation();

  return (
    <button
      onClick={() => (isSpeaking ? stopSpeaking() : speak(text))}
      className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition shadow-sm cursor-pointer backdrop-blur-md"
    >
      {isSpeaking ? (
        <span className="flex items-center gap-1">
          <span className="size-1.5 bg-amber-400 rounded-full animate-ping" />
          <VolumeX className="size-3.5 text-amber-300" />
        </span>
      ) : (
        <Volume2 className="size-3.5 text-emerald-400" />
      )}
      <span>{label}</span>
    </button>
  );
}

export function BentoGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5", className)}>
      {children}
    </div>
  );
}

export function BentoCard({
  children,
  className,
  span = "col-span-1",
}: {
  children: ReactNode;
  className?: string;
  span?: string;
}) {
  return (
    <div
      className={cn(
        "glass-card p-6 flex flex-col justify-between group",
        span,
        className
      )}
    >
      {children}
    </div>
  );
}
