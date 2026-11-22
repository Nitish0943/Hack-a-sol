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
import { Card, PageHeading, StatusBadge, VoiceAssistButton } from "@/components/ui-kit";
import { useTranslation } from "@/lib/i18n/context";
import { checkEligibility, getSchemes } from "@/lib/api";

export default function EligibilityPage() {
  const { t, locale, speak, language } = useTranslation();
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
        description={
          language === "hi"
            ? "सरकारी अधिसूचनाओं और राजपत्र नियमों पर आधारित १००% निष्पक्ष पात्रता जांच। कोई भ्रामक AI अनुमान नहीं — संपूर्ण नियम विश्लेषण।"
            : "Deterministic eligibility evaluation against official gazette rules. Zero AI hallucinations — complete clause-level audit trail."
        }
        action={
          <VoiceAssistButton
            text="Deterministic Eligibility Evaluation. View passed, failed, and unverified criteria with clause references."
            label={locale === "hi" || locale === "cghi" ? "पात्रता परिणाम सुनें" : "Listen Result"}
          />
        }
      />

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* Left Column: Scheme Selector & Farmer Profile Summary */}
        <div className="space-y-5">
          <div className="glass-panel p-6 space-y-4 border border-white/10">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-display">
              <Wheat className="size-4 text-emerald-400" />
              {t("eligibility.selectScheme")}
            </h3>
            <select
              className="field cursor-pointer"
              value={selectedSchemeId}
              onChange={(e) => handleSchemeChange(e.target.value)}
            >
              {schemes.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#07130B]">
                  {locale === "hi" || locale === "cghi" ? s.name_hi : s.name}
                </option>
              ))}
            </select>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                {t("eligibility.farmerProfileSummary")}
              </p>
              <dl className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between border-b border-white/[0.06] pb-1.5">
                  <dt className="text-slate-400">Farmer:</dt>
                  <dd className="font-bold text-white">Ramesh Kumar</dd>
                </div>
                <div className="flex justify-between border-b border-white/[0.06] pb-1.5">
                  <dt className="text-slate-400">Location:</dt>
                  <dd className="font-bold text-white">Khamtarai, Raipur (CG)</dd>
                </div>
                <div className="flex justify-between border-b border-white/[0.06] pb-1.5">
                  <dt className="text-slate-400">Category:</dt>
                  <dd className="font-bold text-white">Small & Marginal</dd>
                </div>
                <div className="flex justify-between border-b border-white/[0.06] pb-1.5">
                  <dt className="text-slate-400">Landholding:</dt>
                  <dd className="font-bold text-emerald-400 font-mono">2.0 Acres</dd>
                </div>
                <div className="flex justify-between border-b border-white/[0.06] pb-1.5">
                  <dt className="text-slate-400">Cultivator Status:</dt>
                  <dd className="font-bold text-purple-300">Sharecropper</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400">Major Crops:</dt>
                  <dd className="font-bold text-white">Paddy, Kodo-Kutki</dd>
                </div>
              </dl>
            </div>

            <button
              onClick={() => runEvaluation(selectedSchemeId)}
              disabled={loading}
              className="w-full btn-primary py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg"
            >
              <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Evaluating Rules..." : "Re-evaluate Profile"}</span>
            </button>
          </div>

          {/* Cultivator Identity Bridge Notice */}
          <div className="rounded-2xl border border-purple-500/30 bg-purple-950/30 p-5 backdrop-blur-md space-y-2">
            <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
              <ShieldCheck className="size-4 text-purple-400" />
              <span>Cultivator Bridge Notice</span>
            </div>
            <p className="text-xs text-purple-200/80 leading-relaxed">
              Are you a tenant farmer or sharecropper? In Chhattisgarh, tenant cultivators qualify for RGKNY input assistance upon Girdawari entry.
            </p>
            <Link
              href="/farmer/profile"
              className="inline-block text-xs font-bold text-purple-300 hover:underline pt-1"
            >
              Update Cultivator Details →
            </Link>
          </div>
        </div>

        {/* Right Column: Deterministic Rule Outcome Dossier */}
        <div className="space-y-6">
          {result && (
            <div className="glass-panel p-6 sm:p-8 space-y-6 border border-white/10">
              {/* Outcome Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/[0.08] pb-5">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    Deterministic Assessment Outcome
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-white font-display mt-0.5">
                    {result.scheme_name}
                  </h3>
                  <p className="text-xs text-emerald-400 font-mono mt-1">
                    Evaluated under Policy Version: <strong>{result.policy_version}</strong>
                  </p>
                </div>
                <StatusBadge status={result.status} />
              </div>

              {/* Actionable Recommendation */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 space-y-1">
                <p className="text-[10px] font-mono font-bold uppercase text-emerald-400">
                  Recommended Legitimate Next Step
                </p>
                <p className="text-sm font-semibold text-white leading-relaxed">
                  {locale === "hi" || locale === "cghi" ? result.recommended_action_hi : result.recommended_action}
                </p>
              </div>

              {/* Passed Conditions Trace */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-400" />
                  Passed Criteria ({result.passed_conditions?.length || 0})
                </h4>
                <div className="space-y-2.5">
                  {result.passed_conditions?.map((cond: any, idx: number) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 text-xs space-y-1"
                    >
                      <p className="font-semibold text-slate-200">
                        {locale === "hi" || locale === "cghi" ? cond.description_hi : cond.description}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">Clause Authority: {cond.clause}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Missing Documents Checklist */}
              {result.missing_documents?.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <FileText className="size-4 text-amber-400" />
                    Missing Required Documentation
                  </h4>
                  <div className="space-y-2">
                    {result.missing_documents.map((doc: string, idx: number) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-xs text-amber-200 flex items-center gap-2.5"
                      >
                        <AlertCircle className="size-4 text-amber-400 shrink-0" />
                        <span>{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
