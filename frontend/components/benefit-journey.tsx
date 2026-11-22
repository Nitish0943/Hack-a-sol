"use client";

import { useState } from "react";
import { CheckCircle2, Clock, AlertTriangle, ShieldCheck, FileText, ArrowRight, Info, ChevronRight, Volume2 } from "lucide-react";
import { StatusBadge, VoiceAssistButton } from "@/components/ui-kit";
import { useTranslation } from "@/lib/i18n/context";

export interface JourneyStage {
  id: string;
  name: string;
  name_hi: string;
  status: "completed" | "current" | "upcoming" | "discrepancy";
  amount?: number;
  amountLabel: string;
  amountLabel_hi: string;
  attribution: "System-calculated" | "Farmer-reported" | "Officer-reviewed" | "Officially verified" | "Estimated" | "Simulated demo data";
  date?: string;
  referenceNumber?: string;
  evidenceDocument?: string;
  policyCitation?: string;
  blocker?: string;
  recommendedAction: string;
  recommendedAction_hi: string;
  explanation: string;
  explanation_hi: string;
}

interface BenefitJourneyProps {
  schemeName: string;
  schemeCode: string;
  currentStageIndex: number; // 0 to 7
  stages: JourneyStage[];
}

export function BenefitJourneyVisualizer({
  schemeName,
  schemeCode,
  currentStageIndex,
  stages,
}: BenefitJourneyProps) {
  const { language, t } = useTranslation();
  const [selectedStageIdx, setSelectedStageIdx] = useState<number>(currentStageIndex);

  const selectedStage = stages[selectedStageIdx] || stages[currentStageIndex];

  return (
    <div className="glass-panel p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              {schemeCode}
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-white font-display">
              {schemeName} — {language === "hi" ? "लाभ यात्रा एवं जीवन चक्र" : "Entitlement Lifecycle Journey"}
            </h3>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {language === "hi"
              ? "पात्रता से लेकर बैंक खाते में वास्तविक डीबीटी प्राप्ति तक के प्रत्येक चरण का पारदर्शी विवरण।"
              : "End-to-end transparent verification trail: From initial eligibility to bank DBT confirmation."}
          </p>
        </div>

        <VoiceAssistButton
          text={`${schemeName}. ${language === "hi" ? "वर्तमान चरण" : "Current stage"}: ${selectedStage.name_hi || selectedStage.name}. ${selectedStage.explanation_hi || selectedStage.explanation}`}
          label={language === "hi" ? "चरण सुनें" : "Listen stage"}
        />
      </div>

      {/* Interactive 8-Stage Stepper Ribbon */}
      <div className="overflow-x-auto pb-3 pt-2">
        <div className="flex items-center gap-2 min-w-[760px]">
          {stages.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            const isSelected = idx === selectedStageIdx;
            const isDiscrepancy = stage.status === "discrepancy";

            return (
              <button
                key={stage.id}
                onClick={() => setSelectedStageIdx(idx)}
                className={`flex-1 relative flex flex-col items-center p-3 rounded-2xl border transition-all text-center cursor-pointer ${
                  isSelected
                    ? "border-emerald-400/80 bg-emerald-500/15 shadow-[0_0_20px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400/50"
                    : isCurrent
                    ? "border-amber-400/60 bg-amber-500/10"
                    : isCompleted
                    ? "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                    : "border-white/[0.05] bg-transparent opacity-60 hover:opacity-80"
                }`}
              >
                {/* Connecting Track Line */}
                {idx < stages.length - 1 && (
                  <div
                    className={`absolute top-5 -right-3 w-6 h-0.5 z-0 pointer-events-none ${
                      isCompleted ? "bg-emerald-500/50" : "bg-white/10"
                    }`}
                  />
                )}

                {/* Stage Indicator Icon */}
                <div
                  className={`size-8 rounded-xl flex items-center justify-center font-bold text-xs relative z-10 transition-transform ${
                    isDiscrepancy
                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.4)]"
                      : isCompleted
                      ? "bg-emerald-500 text-slate-950 font-bold shadow-[0_0_14px_rgba(16,185,129,0.5)]"
                      : isCurrent
                      ? "bg-amber-400 text-slate-950 font-extrabold animate-pulse shadow-[0_0_14px_rgba(245,158,11,0.5)]"
                      : "bg-white/10 text-slate-400 border border-white/10"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="size-4 text-slate-950" />
                  ) : isDiscrepancy ? (
                    <AlertTriangle className="size-4" />
                  ) : (
                    idx + 1
                  )}
                </div>

                {/* Stage Title */}
                <p className="mt-2 text-[11px] font-bold text-slate-200 line-clamp-1">
                  {language === "hi" && stage.name_hi ? stage.name_hi : stage.name}
                </p>

                {/* Stage Amount or Subtitle */}
                {stage.amount !== undefined ? (
                  <p className="mt-0.5 text-[10px] font-mono font-bold text-emerald-400">
                    ₹{stage.amount.toLocaleString()}
                  </p>
                ) : (
                  <p className="mt-0.5 text-[9px] text-slate-400 uppercase tracking-tighter">
                    {stage.status}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Granular Inspection Card for Selected Stage */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/[0.06] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-emerald-400">
                {language === "hi" ? `चरण ${selectedStageIdx + 1} का विवरण` : `Stage ${selectedStageIdx + 1} Detail`}
              </span>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-mono text-slate-300">
                [{selectedStage.attribution}]
              </span>
            </div>
            <h4 className="mt-1 text-xl font-bold text-white font-display">
              {language === "hi" && selectedStage.name_hi ? selectedStage.name_hi : selectedStage.name}
            </h4>
          </div>

          {/* Amount Badge */}
          {selectedStage.amount !== undefined && (
            <div className="text-right">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {language === "hi" ? selectedStage.amountLabel_hi : selectedStage.amountLabel}
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono tabular-nums">
                ₹{selectedStage.amount.toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Forensic Description */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          {language === "hi" && selectedStage.explanation_hi
            ? selectedStage.explanation_hi
            : selectedStage.explanation}
        </p>

        {/* Active Discrepancy Alert */}
        {selectedStage.blocker && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 space-y-1">
            <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
              <AlertTriangle className="size-4 shrink-0 text-rose-400" />
              <span>{language === "hi" ? "अवरोधक या विसंगति पहचानी गई:" : "Discrepancy or Blocker Detected:"}</span>
            </div>
            <p className="text-xs text-rose-200/90 leading-relaxed pl-6">{selectedStage.blocker}</p>
          </div>
        )}

        {/* Metadata Details Grid */}
        <div className="grid gap-3 sm:grid-cols-3 text-xs">
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              {language === "hi" ? "संदर्भ एवं पावती" : "Reference & Filing"}
            </span>
            <p className="font-mono font-semibold text-slate-200">
              {selectedStage.referenceNumber || "Official Record Active"}
            </p>
            <p className="text-[10px] text-slate-400">{selectedStage.date || "Recorded in Registry"}</p>
          </div>

          <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              {language === "hi" ? "सत्यापित साक्ष्य" : "Statutory Evidence"}
            </span>
            <p className="font-semibold text-slate-200 truncate">
              {selectedStage.evidenceDocument || "Aadhaar e-KYC / B1 Revenue Deed"}
            </p>
            <p className="text-[10px] text-emerald-400 font-mono">{selectedStage.policyCitation || "Operational Guidelines"}</p>
          </div>

          <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              {language === "hi" ? "सुझावित अगला कदम" : "Actionable Next Step"}
            </span>
            <p className="text-[11px] font-semibold text-emerald-300 leading-snug">
              {language === "hi" ? selectedStage.recommendedAction_hi : selectedStage.recommendedAction}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
