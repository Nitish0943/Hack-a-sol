"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, ExternalLink, Filter, Search, Sparkles, Volume2, Wheat } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Card, PageHeading, StatusBadge } from "@/components/ui-kit";
import { useTranslation } from "@/lib/i18n/context";
import { getSchemes } from "@/lib/api";

export default function SchemesPage() {
  const { t, locale, speak } = useTranslation();
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
        description={t("schemes.sub")}
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Official Catalog:</span>
            <span className="rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-black">
              {schemes.length} Schemes Verified
            </span>
          </div>
        }
      />

      {/* Glass Search & Filter Controls */}
      <Card className="p-4 sm:p-5">
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
            <Filter className="size-4 text-slate-400 shrink-0" />
            <select
              className="field"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === "All" ? t("schemes.allCategories") : c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Schemes Grid */}
      <div className="grid gap-5 lg:grid-cols-2">
        {schemes.map((scheme) => {
          const displayName = locale === "hi" || locale === "cghi" ? scheme.name_hi : scheme.name;
          const displaySummary = locale === "hi" || locale === "cghi" ? scheme.benefit_summary_hi : scheme.benefit_summary;
          const displayDesc = locale === "hi" || locale === "cghi" ? scheme.description_hi : scheme.description;

          return (
            <Card
              key={scheme.id}
              className="flex flex-col justify-between hover:border-emerald-300 hover:shadow-md transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="rounded-full bg-emerald-100/80 text-emerald-900 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                      {scheme.category}
                    </span>
                    <h3 className="mt-2 text-xl font-black text-slate-900 flex items-center gap-2">
                      <span>{displayName}</span>
                      <button
                        onClick={() => speak(`${displayName}. ${displaySummary}`)}
                        title="Read aloud"
                        className="text-slate-400 hover:text-emerald-700 transition cursor-pointer"
                      >
                        <Volume2 className="size-4" />
                      </button>
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">{scheme.department}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 text-slate-700 px-2.5 py-1 text-xs font-bold shrink-0 border border-slate-200">
                    {scheme.state}
                  </span>
                </div>

                <div className="mt-4 rounded-xl border border-emerald-200/60 bg-emerald-50/50 p-3">
                  <p className="text-[11px] font-bold uppercase text-emerald-800 tracking-wider">
                    Official Entitlement
                  </p>
                  <p className="text-base font-extrabold text-emerald-950 mt-0.5">{displaySummary}</p>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-slate-600 font-medium">
                  {displayDesc}
                </p>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Policy: <strong className="text-slate-700">{scheme.policy_version}</strong> ({scheme.financial_year})
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Verified: <span className="text-emerald-700 font-semibold">{scheme.last_verified}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/farmer/eligibility?scheme=${scheme.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3.5 py-2 text-xs font-bold transition"
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
            </Card>
          );
        })}
      </div>
    </div>
  );
}
