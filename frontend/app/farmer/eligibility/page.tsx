"use client";

import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CircleX,
  FileText,
  HelpCircle,
  RefreshCw,
  ShieldCheck,
  Upload,
  Volume2,
  Wheat,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Card, PageHeading, StatusBadge } from "@/components/ui-kit";
import { useTranslation } from "@/lib/i18n/context";
import { checkEligibility, getSchemes } from "@/lib/api";

export default function EligibilityPage() {
  const { t, locale, speak } = useTranslation();
  const [schemes, setSchemes] = useState<any[]>([]);
  const [selectedSchemeId, setSelectedSchemeId] = useState("pm-kisan");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getSchemes().then((data) => {
      setSchemes(data);
    });
    runEvaluation("pm-kisan");
  }, []);

  const runEvaluation = async (schemeId: string) => {
    setLoading(true);
    try {
      const res = await checkEligibility(schemeId);
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSchemeChange = (id: string) => {
    setSelectedSchemeId(id);
    runEvaluation(id);
  };

  const handleAudioReadout = () => {
    if (!result) return;
    const text =
      locale === "cghi"
        ? `योजना: ${result.scheme_name}। परिणाम: ${result.status}। संतुष्ट नियम: ${result.passed_conditions?.length || 0}। सलाह: ${result.recommended_action_hi}`
        : locale === "hi"
          ? `योजना: ${result.scheme_name}। पात्रता परिणाम: ${result.status}। संतुष्ट शर्तें: ${result.passed_conditions?.length || 0}। सलाह: ${result.recommended_action_hi}`
          : `Scheme: ${result.scheme_name}. Outcome: ${result.status}. Passed conditions: ${result.passed_conditions?.length || 0}. Recommendation: ${result.recommended_action}`;
    speak(text);
  };

  return (
    <div className="space-y-6">
      <PageHeading
        title={t("eligibility.title")}
        description={t("eligibility.sub")}
        action={
          <button
            onClick={handleAudioReadout}
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1.5 text-xs font-bold transition cursor-pointer"
          >
            <Volume2 className="size-3.5" />
            <span>{locale === "hi" || locale === "cghi" ? "पात्रता परिणाम सुनें" : "Listen Result"}</span>
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* Left Column: Scheme Selector & Farmer Profile Summary */}
        <div className="space-y-5">
          <Card className="p-5">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2 mb-3">
              <Wheat className="size-4.5 text-emerald-700" />
              {t("eligibility.selectScheme")}
            </h3>
            <select
              className="field bg-white"
              value={selectedSchemeId}
              onChange={(e) => handleSchemeChange(e.target.value)}
            >
              {schemes.map((s) => (
                <option key={s.id} value={s.id}>
                  {locale === "hi" || locale === "cghi" ? s.name_hi : s.name}
                </option>
              ))}
            </select>

            <div className="mt-5 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
                {t("eligibility.farmerProfileSummary")}
              </p>
              <dl className="space-y-2 text-xs font-medium text-slate-700">
                <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                  <dt className="text-slate-500">Farmer:</dt>
                  <dd className="font-bold text-slate-900">Ramesh Kumar</dd>
                </div>
                <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                  <dt className="text-slate-500">Location:</dt>
                  <dd className="font-bold text-slate-900">Khamtarai, Raipur (CG)</dd>
                </div>
                <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                  <dt className="text-slate-500">Category:</dt>
                  <dd className="font-bold text-slate-900">Small & Marginal</dd>
                </div>
                <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                  <dt className="text-slate-500">Landholding:</dt>
                  <dd className="font-bold text-emerald-800">2.0 Acres</dd>
                </div>
                <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                  <dt className="text-slate-500">Cultivator Status:</dt>
                  <dd className="font-bold text-slate-900">Landowner</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Major Crops:</dt>
                  <dd className="font-bold text-slate-900">Paddy, Kodo-Kutki</dd>
                </div>
              </dl>
            </div>

            <button
              onClick={() => runEvaluation(selectedSchemeId)}
              disabled={loading}
              className="mt-4 w-full btn-primary py-2.5 text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Evaluating Rules..." : "Re-evaluate Profile"}</span>
            </button>
          </Card>

          {/* Cultivator Identity Bridge Notice */}
          <div className="rounded-2xl border border-amber-300/80 bg-gradient-to-br from-amber-50 to-orange-50/50 p-4 shadow-xs">
            <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs">
              <ShieldCheck className="size-4 text-amber-700" /> Cultivator Bridge Notice
            </div>
            <p className="mt-1 text-xs text-amber-900/80 font-medium leading-relaxed">
              Are you a tenant farmer or sharecropper? In Chhattisgarh, tenant cultivators qualify for RGKNY input assistance upon Girdawari entry.
            </p>
            <Link
              href="/farmer/profile"
              className="mt-2.5 inline-block text-xs font-extrabold text-amber-900 hover:underline"
            >
              Update Cultivator Details →
            </Link>
          </div>
        </div>

        {/* Right Column: Deterministic Rule Outcome Dossier */}
        <div>
          {result && (
            <Card elevated={true} className="p-6 sm:p-7 space-y-6">
              {/* Outcome Header */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">Deterministic Evaluation: 22 Nov 2026</span>
                    <span className="text-xs font-bold text-emerald-800">· Policy: {result.policy_version}</span>
                  </div>
                  <h3 className="mt-1.5 text-2xl font-black text-slate-900">
                    {locale === "hi" || locale === "cghi" ? result.scheme_name_hi : result.scheme_name}
                  </h3>
                </div>
                <div>
                  <StatusBadge status={result.status} />
                </div>
              </div>

              {/* Metric Counts */}
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-4">
                  <div className="flex items-center justify-between">
                    <CheckCircle2 className="size-5 text-emerald-700" />
                    <span className="text-xl font-black text-emerald-950">
                      {result.passed_conditions?.length || 0}
                    </span>
                  </div>
                  <p className="mt-2 text-xs font-bold text-emerald-900">{t("eligibility.passedChecks")}</p>
                </div>

                <div className="rounded-2xl border border-red-200/80 bg-red-50/60 p-4">
                  <div className="flex items-center justify-between">
                    <CircleX className="size-5 text-red-700" />
                    <span className="text-xl font-black text-red-950">
                      {result.failed_conditions?.length || 0}
                    </span>
                  </div>
                  <p className="mt-2 text-xs font-bold text-red-900">{t("eligibility.failedChecks")}</p>
                </div>

                <div className="rounded-2xl border border-amber-200/80 bg-amber-50/60 p-4">
                  <div className="flex items-center justify-between">
                    <AlertCircle className="size-5 text-amber-700" />
                    <span className="text-xl font-black text-amber-950">
                      {result.unknown_conditions?.length || (result.missing_documents?.length ? 1 : 0)}
                    </span>
                  </div>
                  <p className="mt-2 text-xs font-bold text-amber-900">{t("eligibility.unknownChecks")}</p>
                </div>
              </div>

              {/* Actionable Next Steps Box */}
              <div className="rounded-2xl border border-emerald-300/80 bg-emerald-50/70 p-4">
                <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-900">
                  {t("eligibility.nextSteps")}
                </p>
                <p className="mt-1 text-sm font-semibold text-emerald-950 leading-relaxed">
                  {locale === "hi" || locale === "cghi" ? result.recommended_action_hi : result.recommended_action}
                </p>
              </div>

              {/* Detailed Condition Breakdown Cards */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Condition-by-Condition Rule Trace
                </h4>

                {/* Passed Conditions */}
                {result.passed_conditions?.map((c: any, i: number) => (
                  <div
                    key={`p-${i}`}
                    className="flex items-start gap-3 rounded-xl border border-emerald-200/80 bg-white/70 p-3.5 shadow-2xs"
                  >
                    <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-slate-900">
                          {locale === "hi" || locale === "cghi" ? c.description_hi || c.description : c.description}
                        </p>
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full shrink-0">
                          Satisfied
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium mt-1">
                        Clause Citation: <strong>{c.clause}</strong>
                      </p>
                    </div>
                  </div>
                ))}

                {/* Failed Conditions */}
                {result.failed_conditions?.map((c: any, i: number) => (
                  <div
                    key={`f-${i}`}
                    className="flex items-start gap-3 rounded-xl border border-red-200/80 bg-red-50/40 p-3.5 shadow-2xs"
                  >
                    <CircleX className="size-4.5 text-red-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-red-950">
                          {locale === "hi" || locale === "cghi" ? c.description_hi || c.description : c.description}
                        </p>
                        <span className="text-[10px] font-black uppercase tracking-wider text-red-700 bg-red-100 px-2 py-0.5 rounded-full shrink-0">
                          Not Satisfied
                        </span>
                      </div>
                      <p className="text-[11px] text-red-800 font-medium mt-1">
                        Clause Citation: <strong>{c.clause}</strong>
                      </p>
                    </div>
                  </div>
                ))}

                {/* Missing Documents Alert */}
                {result.missing_documents?.length > 0 && (
                  <div className="rounded-xl border border-amber-300/80 bg-amber-50/50 p-4">
                    <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs mb-2">
                      <FileText className="size-4" /> {t("eligibility.missingDocs")}
                    </div>
                    <ul className="space-y-1.5 pl-5 list-disc text-xs text-amber-950 font-medium">
                      {result.missing_documents.map((doc: string, idx: number) => (
                        <li key={idx}>{doc}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
                <Link
                  href="/farmer/profile"
                  className="btn-glass text-xs py-2.5 px-4"
                >
                  <Upload className="size-3.5" />
                  <span>Update Profile / Upload Proof</span>
                </Link>

                <Link
                  href={`/farmer/schemes/${selectedSchemeId}`}
                  className="btn-primary text-xs py-2.5 px-5 shadow-sm"
                >
                  <span>View Official Scheme Dossier</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>

              <p className="text-[10px] text-slate-400 font-medium">
                * Note: KrishiSetu eligibility reports provide transparent administrative guidance based on versioned government guidelines. This does not replace formal scrutiny by the Competent Authority.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
