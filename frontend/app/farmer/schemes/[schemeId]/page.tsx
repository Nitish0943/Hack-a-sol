"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  FileText,
  Landmark,
  ShieldCheck,
  Volume2,
  Wheat,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Card, PageHeading, StatusBadge, VoiceAssistButton } from "@/components/ui-kit";
import { useTranslation } from "@/lib/i18n/context";
import { getScheme } from "@/lib/api";

export default function SchemeDetailPage() {
  const params = useParams();
  const schemeId = (params?.schemeId as string) || "pm-kisan";
  const { t, locale, speak } = useTranslation();
  const [scheme, setScheme] = useState<any>(null);

  useEffect(() => {
    getScheme(schemeId).then(setScheme);
  }, [schemeId]);

  if (!scheme) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block size-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        <p className="mt-3 text-sm text-slate-400 font-semibold">{t("common.loading")}</p>
      </div>
    );
  }

  const displayName = locale === "hi" || locale === "cghi" ? scheme.name_hi : scheme.name;
  const displaySummary = locale === "hi" || locale === "cghi" ? scheme.benefit_summary_hi : scheme.benefit_summary;
  const displayDesc = locale === "hi" || locale === "cghi" ? scheme.description_hi : scheme.description;

  let criteriaList: string[] = [];
  try {
    criteriaList = JSON.parse(scheme.eligibility_criteria_json || "[]");
  } catch {
    criteriaList = [scheme.eligibility_criteria_json];
  }

  let docList: string[] = [];
  try {
    docList = JSON.parse(scheme.required_documents_json || "[]");
  } catch {
    docList = [scheme.required_documents_json];
  }

  let stepList: string[] = [];
  try {
    stepList = JSON.parse(scheme.application_steps_json || "[]");
  } catch {
    stepList = [scheme.application_steps_json];
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/farmer/schemes"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="size-4" /> Back to Schemes Directory
        </Link>
        <span className="text-xs font-mono font-semibold text-emerald-400">
          Source: Verified Government Circular ({scheme.last_verified})
        </span>
      </div>

      {/* Hero Header Card */}
      <div className="glass-panel p-6 sm:p-8 space-y-6 border border-white/10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-0.5 text-xs font-mono font-bold uppercase tracking-wider">
                {scheme.category}
              </span>
              <span className="rounded-full bg-white/5 border border-white/10 text-slate-300 px-2.5 py-0.5 text-xs font-mono font-semibold">
                {scheme.state}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3 font-display">
              <span>{displayName}</span>
              <button
                onClick={() => speak(`${displayName}. ${displaySummary}. ${displayDesc}`)}
                className="text-slate-400 hover:text-emerald-400 transition cursor-pointer"
                title="Read Scheme Details Aloud"
              >
                <Volume2 className="size-5" />
              </button>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">{scheme.department}</p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <Link
              href={`/farmer/eligibility?scheme=${scheme.id}`}
              className="btn-primary text-xs px-4 py-2.5 shadow-md"
            >
              <CheckCircle2 className="size-4" />
              <span>Check My Eligibility</span>
            </Link>
            <a
              href={scheme.official_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-glass text-xs px-4 py-2.5"
            >
              <span>Official Portal</span>
              <ExternalLink className="size-3.5 text-slate-400" />
            </a>
          </div>
        </div>

        {/* Highlight Benefit Banner */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 space-y-2 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
            Sanctioned Benefit & Entitlement
          </p>
          <p className="text-xl sm:text-2xl font-bold text-white font-mono">{displaySummary}</p>
          <p className="text-xs text-emerald-300/80 font-mono">
            Policy Version: <strong>{scheme.policy_version}</strong> ({scheme.financial_year}) · Benefit Type: {scheme.benefit_type}
          </p>
        </div>

        <p className="text-xs sm:text-sm leading-relaxed text-slate-300 font-medium">
          {displayDesc}
        </p>
      </div>

      {/* 3 Detail Columns: Eligibility, Documents, Process */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Criteria */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4 font-display">
              <ShieldCheck className="size-5 text-emerald-400" />
              Eligibility Conditions
            </h3>
            <ul className="space-y-3">
              {criteriaList.map((c, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-6 pt-4 border-t border-white/[0.06]">
            <Link
              href={`/farmer/eligibility?scheme=${scheme.id}`}
              className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
            >
              Run Deterministic Check →
            </Link>
          </div>
        </div>

        {/* Required Documents */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4 font-display">
              <FileText className="size-5 text-emerald-400" />
              Required Documents
            </h3>
            <ul className="space-y-3">
              {docList.map((d, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                  <span className="grid size-5 place-items-center rounded-full bg-white/10 text-[10px] font-mono font-bold text-slate-200 shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-6 pt-4 border-t border-white/[0.06] text-xs text-slate-400">
            Documents can be attached in Farmer Profile.
          </div>
        </div>

        {/* Application Process */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4 font-display">
              <Landmark className="size-5 text-emerald-400" />
              Application Process Steps
            </h3>
            <ol className="space-y-3">
              {stepList.map((s, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                  <span className="grid size-5 place-items-center rounded-full bg-emerald-500 text-slate-950 text-[10px] font-mono font-black shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="mt-6 pt-4 border-t border-white/[0.06]">
            <a
              href={scheme.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
            >
              View Official Notification <ExternalLink className="size-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
