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
import { Card, PageHeading, StatusBadge } from "@/components/ui-kit";
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
        <div className="inline-block size-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
        <p className="mt-3 text-sm text-slate-500 font-semibold">{t("common.loading")}</p>
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
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-800 transition"
        >
          <ArrowLeft className="size-4" /> Back to Schemes Directory
        </Link>
        <span className="text-xs font-semibold text-slate-500">
          Source: Verified Government Circular ({scheme.last_verified})
        </span>
      </div>

      {/* Hero Header Card */}
      <Card elevated={true} className="p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-100 text-emerald-800 px-3 py-0.5 text-xs font-black uppercase tracking-wider">
                {scheme.category}
              </span>
              <span className="rounded-full bg-slate-100 text-slate-700 px-2.5 py-0.5 text-xs font-semibold">
                {scheme.state}
              </span>
            </div>
            <h1 className="mt-3 text-2xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <span>{displayName}</span>
              <button
                onClick={() => speak(`${displayName}. ${displaySummary}. ${displayDesc}`)}
                className="text-slate-400 hover:text-emerald-700 transition cursor-pointer"
                title="Read Scheme Details Aloud"
              >
                <Volume2 className="size-5" />
              </button>
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">{scheme.department}</p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <Link
              href={`/farmer/eligibility?scheme=${scheme.id}`}
              className="btn-primary text-sm px-5 py-2.5 shadow-md"
            >
              <CheckCircle2 className="size-4" />
              <span>Check My Eligibility</span>
            </Link>
            <a
              href={scheme.official_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-glass text-sm px-4 py-2.5"
            >
              <span>Official Portal</span>
              <ExternalLink className="size-4 text-slate-500" />
            </a>
          </div>
        </div>

        {/* Highlight Benefit Banner */}
        <div className="mt-6 rounded-2xl bg-gradient-to-r from-emerald-50 via-green-50/70 to-emerald-50/30 border border-emerald-200/80 p-5">
          <p className="text-xs font-black uppercase tracking-wider text-emerald-800">
            Sanctioned Benefit & Entitlement
          </p>
          <p className="mt-1 text-2xl font-black text-emerald-950">{displaySummary}</p>
          <p className="mt-2 text-xs text-emerald-900/80 font-medium">
            Policy Version: <strong>{scheme.policy_version}</strong> ({scheme.financial_year}) · Benefit Type: {scheme.benefit_type}
          </p>
        </div>

        <p className="mt-6 text-base leading-relaxed text-slate-700 font-medium">
          {displayDesc}
        </p>
      </Card>

      {/* 3 Detail Columns: Eligibility, Documents, Process */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Criteria */}
        <Card className="flex flex-col justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2 mb-4">
              <ShieldCheck className="size-5 text-emerald-700" />
              Eligibility Conditions
            </h3>
            <ul className="space-y-3">
              {criteriaList.map((c, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100">
            <Link
              href={`/farmer/eligibility?scheme=${scheme.id}`}
              className="text-xs font-extrabold text-emerald-800 hover:underline flex items-center gap-1"
            >
              Run Deterministic Check →
            </Link>
          </div>
        </Card>

        {/* Required Documents */}
        <Card className="flex flex-col justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2 mb-4">
              <FileText className="size-5 text-emerald-700" />
              Required Documents
            </h3>
            <ul className="space-y-3">
              {docList.map((d, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                  <span className="grid size-5 place-items-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-700 shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-400 font-medium">
            Documents can be uploaded in Farmer Profile.
          </div>
        </Card>

        {/* Application Process */}
        <Card className="flex flex-col justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2 mb-4">
              <Landmark className="size-5 text-emerald-700" />
              Application Process Steps
            </h3>
            <ol className="space-y-3">
              {stepList.map((s, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                  <span className="grid size-5 place-items-center rounded-full bg-emerald-600 text-white text-[10px] font-black shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100">
            <a
              href={scheme.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-extrabold text-emerald-800 hover:underline flex items-center gap-1"
            >
              View Official Notification <ExternalLink className="size-3" />
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
