"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  IndianRupee,
  Landmark,
  MessageSquareWarning,
  ShieldCheck,
  Volume2,
  WalletCards,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Card, PageHeading, StatusBadge } from "@/components/ui-kit";
import { useTranslation } from "@/lib/i18n/context";
import { getBenefits } from "@/lib/api";

export default function BenefitDetailPage() {
  const params = useParams();
  const benefitId = (params?.benefitId as string) || "benefit-2";
  const { t, locale, speak } = useTranslation();
  const [benefit, setBenefit] = useState<any>(null);

  useEffect(() => {
    getBenefits().then((list) => {
      const matched = list.find((b) => b.id === benefitId);
      setBenefit(matched || list[0]);
    });
  }, [benefitId]);

  if (!benefit) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block size-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
        <p className="mt-3 text-sm text-slate-500 font-semibold">{t("common.loading")}</p>
      </div>
    );
  }

  const isMismatch = benefit.sanctioned_amount > 0 && benefit.sanctioned_amount < benefit.estimated_amount;
  const variance = benefit.estimated_amount - benefit.sanctioned_amount;

  const timelineSteps = [
    { title: "Eligibility Identified", date: "10 Nov 2026", done: true, detail: "Farmer profile matched policy rules." },
    { title: "Claim / Application Submitted", date: "12 Nov 2026", done: true, detail: "Application recorded in system." },
    { title: "Application Approved", date: "16 Nov 2026", done: true, detail: "Officer verification cleared." },
    {
      title: isMismatch ? "Sanction Order Issued (Variance Flagged)" : "Sanction Order Issued",
      date: "18 Nov 2026",
      done: benefit.sanctioned_amount > 0,
      alert: isMismatch,
      detail: isMismatch ? `Sanctioned at ₹${benefit.sanctioned_amount.toLocaleString("en-IN")} (Expected ₹${benefit.estimated_amount.toLocaleString("en-IN")})` : "Sanction order authorized.",
    },
    { title: "Disbursement Release (PFMS)", date: "20 Nov 2026", done: benefit.disbursed_amount > 0, detail: "Treasury payment batch processing." },
    { title: "Confirmed Bank Credit", date: "22 Nov 2026", done: benefit.received_amount > 0, detail: "DBT verified into bank account." },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/farmer/benefits"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-800 transition"
        >
          <ArrowLeft className="size-4" /> Back to My Benefits Ledger
        </Link>
        <StatusBadge status={benefit.status} />
      </div>

      <PageHeading
        title={benefit.scheme_name || benefit.scheme_id}
        description={`Benefit Ledger Record #${benefit.id} · Financial Year ${benefit.financial_year} · ${benefit.installment_info}`}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* Amount Breakdown Card */}
          <Card elevated={true} className="p-6">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
              <IndianRupee className="size-5 text-emerald-700" />
              Lifecycle Valuation Stages
            </h3>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-slate-200/80 bg-white/70 p-3.5 shadow-2xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Estimated</p>
                <p className="mt-1 text-xl font-black text-slate-900 font-mono">
                  ₹{benefit.estimated_amount.toLocaleString("en-IN")}
                </p>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">Policy Entitlement</p>
              </div>

              <div className="rounded-xl border border-slate-200/80 bg-white/70 p-3.5 shadow-2xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Approved</p>
                <p className="mt-1 text-xl font-black text-slate-900 font-mono">
                  ₹{benefit.approved_amount.toLocaleString("en-IN")}
                </p>
                <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">Officer Cleared</p>
              </div>

              <div
                className={`rounded-xl border p-3.5 shadow-2xs ${
                  isMismatch
                    ? "border-amber-300 bg-amber-50/70"
                    : "border-slate-200/80 bg-white/70"
                }`}
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sanctioned</p>
                <p className="mt-1 text-xl font-black text-amber-900 font-mono">
                  ₹{benefit.sanctioned_amount.toLocaleString("en-IN")}
                </p>
                <p className="text-[10px] text-amber-800 font-medium mt-0.5">Sanction Order</p>
              </div>

              <div className="rounded-xl border border-slate-200/80 bg-white/70 p-3.5 shadow-2xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Received</p>
                <p className="mt-1 text-xl font-black text-emerald-800 font-mono">
                  ₹{benefit.received_amount.toLocaleString("en-IN")}
                </p>
                <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">Bank Credit</p>
              </div>
            </div>
          </Card>

          {/* Interactive Lifecycle Timeline */}
          <Card className="p-6">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
              <Clock className="size-5 text-emerald-700" />
              {t("benefits.timelineTitle")}
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
              {timelineSteps.map((step, idx) => (
                <div key={idx} className="relative flex items-start gap-3">
                  <span
                    className={`absolute -left-6 top-1 size-5 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black ${
                      step.alert
                        ? "bg-amber-500 text-white"
                        : step.done
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-300 text-slate-600"
                    }`}
                  >
                    {step.done ? "✓" : idx + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs sm:text-sm font-extrabold text-slate-900">{step.title}</p>
                      <span className="text-[10px] text-slate-400 font-medium">{step.date}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar: Integrity Alert & Grievance Actions */}
        <div className="space-y-5">
          {isMismatch && (
            <div className="rounded-2xl border border-amber-300 bg-amber-50/80 p-5 shadow-xs">
              <div className="flex items-center gap-2 text-amber-900 font-black text-sm">
                <AlertTriangle className="size-5 text-amber-700" /> Policy Discrepancy Detected
              </div>
              <p className="mt-2 text-xs leading-relaxed text-amber-900 font-medium">
                Our Policy-to-Payment Integrity Engine identified a <strong>₹{variance.toLocaleString("en-IN")} variance</strong> between the policy entitlement formula and the issued sanction order.
              </p>
              <div className="mt-3 rounded-xl bg-white/70 p-3 text-[11px] text-amber-950 font-medium border border-amber-200/60">
                Policy Rule: Expected ₹{benefit.estimated_amount.toLocaleString("en-IN")}, but sanction order shows ₹{benefit.sanctioned_amount.toLocaleString("en-IN")}.
              </div>

              <Link
                href={`/farmer/grievances/new?scheme=${benefit.scheme_id}&variance=${variance}`}
                className="mt-4 block w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs text-center shadow-xs transition cursor-pointer"
              >
                Raise Dispute / Grievance →
              </Link>
            </div>
          )}

          <Card className="p-5 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
              Related Dossiers & Actions
            </h4>
            <div className="space-y-2">
              <Link
                href="/farmer/applications/app-2"
                className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white/60 p-3 text-xs font-bold text-slate-700 hover:border-emerald-300 transition"
              >
                <span>View Application Dossier</span>
                <FileText className="size-4 text-slate-400" />
              </Link>
              <Link
                href="/farmer/ivr"
                className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white/60 p-3 text-xs font-bold text-slate-700 hover:border-emerald-300 transition"
              >
                <span>Check Status via Phone Call</span>
                <Clock className="size-4 text-slate-400" />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
