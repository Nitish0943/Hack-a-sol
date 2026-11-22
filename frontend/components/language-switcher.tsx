"use client";

import React from "react";
import { Globe, Volume2, VolumeX } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";
import { Locale } from "@/lib/i18n/translations";

export function LanguageSwitcher({ showAudioPill = true }: { showAudioPill?: boolean }) {
  const { locale, setLocale, t, speak, stopSpeaking, isSpeaking } = useTranslation();

  const handleAudioSample = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      const sampleText =
        locale === "cghi"
          ? "जोहार किसान भैया। कृषि सेतु म आप सबो के स्वागत हे। अपन फायदा जानव, हर रुपिया के हिसाब रखव।"
          : locale === "hi"
            ? "नमस्ते किसान भाई। कृषि सेतु में आपका स्वागत है। अपने सरकारी लाभ जानें और हर रुपये का पारदर्शी हिसाब रखें।"
            : "Welcome to KrishiSetu. Discover your government entitlements and track every rupee transparently.";
      speak(sampleText);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {showAudioPill && (
        <button
          onClick={handleAudioSample}
          title={isSpeaking ? t("common.stopAssist") : t("common.sunoAssist")}
          className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all backdrop-blur-md cursor-pointer ${
            isSpeaking
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.3)]"
              : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/25"
          }`}
        >
          {isSpeaking ? <VolumeX className="size-3.5 text-amber-400" /> : <Volume2 className="size-3.5 text-emerald-400" />}
          <span>{isSpeaking ? t("common.stopAssist") : t("common.sunoAssist")}</span>
        </button>
      )}

      <div className="relative inline-flex items-center">
        <span className="absolute left-2.5 pointer-events-none text-slate-400">
          <Globe className="size-3.5 text-emerald-400" />
        </span>
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value as Locale)}
          aria-label="Select Language"
          className="pl-8 pr-7 py-1.5 text-xs font-semibold rounded-xl bg-[#0F2618]/80 backdrop-blur-md border border-white/15 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 shadow-sm cursor-pointer hover:border-white/30"
        >
          <option value="hi" className="bg-[#07130B] text-slate-100">हिन्दी (Hindi)</option>
          <option value="cghi" className="bg-[#07130B] text-slate-100">छत्तीसगढ़ी (C.G.)</option>
          <option value="en" className="bg-[#07130B] text-slate-100">English</option>
        </select>
      </div>
    </div>
  );
}
