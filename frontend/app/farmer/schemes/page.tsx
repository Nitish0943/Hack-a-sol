"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, ExternalLink, Filter, Search, Sparkles, Volume2, Wheat } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Card, PageHeading, StatusBadge, VoiceAssistButton } from "@/components/ui-kit";
import { useTranslation } from "@/lib/i18n/context";
import { getSchemes } from "@/lib/api";

export default function SchemesPage() {
  const { t, locale, speak, language } = useTranslation();
  const [schemes, setSchemes] = useState<any[]>([]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getSchemes(category, "All", search).then((data) => {
      setSchemes(data);
      setLoading(false);
    });
  }, [category, search]);

  const categories = [
    "All",
    "Income support",
    "Agricultural credit",
    "Crop insurance",
    "Equipment subsidy",
    "Irrigation support",
    "Pension support",
  ];

  return (
    <div className="space-y-6">
      <PageHeading
        title={t("schemes.title")}
        description={
          language === "hi"
            ? "सत्यापित केंद्रीय एवं छत्तीसगढ़ राज्य कृषि योजनाओं का आधिकारिक कैटलॉग। प्रत्यक्ष आय, रियायती ऋण, फसल बीमा एवं कृषि यंत्र अनुदान।"
            : "Verified central and state agricultural policy catalog. Direct income support, subsidized institutional credit, crop insurance, and equipment subsidies."
        }
        action={
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 text-xs font-mono font-bold">
              {schemes.length} Schemes Verified
            </span>
          </div>
        }
      />

      {/* Glass Search & Filter Controls */}
      <div className="glass-panel p-4 sm:p-5 border border-white/10">
        <div className="grid gap-4 md:grid-cols-[1fr_240px]">
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
            <input
              className="field pl-10"
              placeholder={t("schemes.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="size-4 text-emerald-400 shrink-0" />
            <select
              className="field cursor-pointer"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c} className="bg-[#07130B] text-slate-100">
                  {c === "All" ? t("schemes.allCategories") : c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="grid gap-5 lg:grid-cols-2">
        {schemes.map((scheme) => {
          const displayName = locale === "hi" || locale === "cghi" ? scheme.name_hi : scheme.name;
          const displaySummary = locale === "hi" || locale === "cghi" ? scheme.benefit_summary_hi : scheme.benefit_summary;
          const displayDesc = locale === "hi" || locale === "cghi" ? scheme.description_hi : scheme.description;

          return (
            <div
              key={scheme.id}
              className="glass-card p-6 flex flex-col justify-between hover:border-emerald-500/40 transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider">
                      {scheme.category}
                    </span>
                    <h3 className="mt-2 text-xl font-bold text-white group-hover:text-emerald-300 transition font-display flex items-center gap-2">
                      <span>{displayName}</span>
                      <button
                        onClick={() => speak(`${displayName}. ${displaySummary}`)}
                        title="Read aloud"
                        className="text-slate-400 hover:text-emerald-400 transition cursor-pointer"
                      >
                        <Volume2 className="size-4" />
                      </button>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{scheme.department}</p>
                  </div>
                  <span className="rounded-full bg-white/5 border border-white/10 text-slate-300 px-2.5 py-1 text-xs font-mono font-bold shrink-0">
                    {scheme.state}
                  </span>
                </div>

                <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3">
                  <p className="text-[10px] font-mono font-bold uppercase text-emerald-400 tracking-wider">
                    Official Entitlement
                  </p>
                  <p className="text-base font-bold text-white font-mono mt-0.5">{displaySummary}</p>
                </div>

                <p className="text-xs leading-relaxed text-slate-300 font-medium">
                  {displayDesc}
                </p>
              </div>

              <div className="mt-6 border-t border-white/[0.08] pt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Policy: <strong className="text-slate-200">{scheme.policy_version}</strong> ({scheme.financial_year})
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Verified: <span className="text-emerald-400 font-semibold">{scheme.last_verified}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/farmer/eligibility?scheme=${scheme.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-emerald-300 border border-white/15 px-3 py-2 text-xs font-bold transition"
                  >
                    <CheckCircle2 className="size-3.5" />
                    <span>Check Eligibility</span>
                  </Link>
                  <Link
                    href={`/farmer/schemes/${scheme.id}`}
                    className="btn-primary text-xs py-2 px-3.5"
                  >
                    <span>{t("common.viewDetails")}</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
