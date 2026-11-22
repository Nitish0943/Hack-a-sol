"use client";

import React, { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Volume2, VolumeX } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";

export function Card({
  children,
  className,
  elevated = false,
}: {
  children: ReactNode;
  className?: string;
  elevated?: boolean;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-white/70 bg-white/80 p-5 backdrop-blur-xl shadow-[0_10px_30px_-5px_rgba(20,83,45,0.05),0_0_0_1px_rgba(22,101,52,0.06)] transition-all",
        elevated && "shadow-[0_20px_40px_-10px_rgba(20,83,45,0.12),0_0_0_1px_rgba(22,101,52,0.08)] bg-white/90",
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
    green: "bg-emerald-500/10 text-emerald-800 border-emerald-500/20",
    yellow: "bg-amber-500/10 text-amber-800 border-amber-500/20",
    blue: "bg-blue-500/10 text-blue-800 border-blue-500/20",
    slate: "bg-slate-500/10 text-slate-800 border-slate-500/20",
    red: "bg-red-500/10 text-red-800 border-red-500/20",
  };

  const iconTones = {
    green: "bg-emerald-600 text-white shadow-emerald-700/20",
    yellow: "bg-amber-600 text-white shadow-amber-700/20",
    blue: "bg-blue-600 text-white shadow-blue-700/20",
    slate: "bg-slate-700 text-white shadow-slate-800/20",
    red: "bg-red-600 text-white shadow-red-700/20",
  };

  const handleRead = () => {
    const textToSpeak = audioText || `${label}: ${value}. ${detail}`;
    speak(textToSpeak);
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
        tones[tone]
      )}
    >
      {/* Specular rim lighting */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-transparent pointer-events-none" />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-600">{label}</p>
            <button
              onClick={handleRead}
              title="Listen to this card"
              className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-slate-400 hover:text-emerald-700 cursor-pointer"
            >
              <Volume2 className="size-3" />
            </button>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">{value}</p>
          <p className="mt-1 text-xs font-medium text-slate-500">{detail}</p>
        </div>
        <span
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-xl shadow-md border border-white/40",
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
    ? "bg-emerald-500/15 text-emerald-800 border-emerald-500/30"
    : isPending
      ? "bg-amber-500/15 text-amber-800 border-amber-500/30"
      : isBad
        ? "bg-red-500/15 text-red-800 border-red-500/30"
        : "bg-blue-500/15 text-blue-800 border-blue-500/30";

  const dotClass = isGood
    ? "bg-emerald-600"
    : isPending
      ? "bg-amber-600"
      : isBad
        ? "bg-red-600"
        : "bg-blue-600";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border backdrop-blur-md shadow-2xs",
        badgeClass
      )}
    >
      <span className={cn("size-1.5 rounded-full", dotClass)} />
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
  const { speak, isSpeaking } = useTranslation();

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-slate-200/60 pb-5">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">{title}</h2>
          <button
            onClick={() => speak(`${title}. ${description || ""}`)}
            title="Read title and description"
            className="text-slate-400 hover:text-emerald-700 transition p-1 cursor-pointer"
          >
            <Volume2 className="size-4" />
          </button>
        </div>
        {description && <p className="mt-1 text-sm text-slate-600 max-w-2xl">{description}</p>}
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
      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition shadow-2xs cursor-pointer"
    >
      {isSpeaking ? <VolumeX className="size-3 text-amber-700" /> : <Volume2 className="size-3 text-emerald-700" />}
      <span>{label}</span>
    </button>
  );
}
