"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  IndianRupee,
  Landmark,
  ShieldCheck,
  Volume2,
  WalletCards,
  Info,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Card, PageHeading, StatCard, StatusBadge, VoiceAssistButton } from "@/components/ui-kit";
import { useTranslation } from "@/lib/i18n/context";
import { getBenefits, getBenefitSummary } from "@/lib/api";

export default function BenefitsPage() {
  const { t, locale, speak, language } = useTranslation();
  const [benefits, setBenefits] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    getBenefits(activeFilter).then(setBenefits);
    getBenefitSummary().then(setSummary);
  }, [activeFilter]);

  const s = summary || {
    total_potential: 42500,
    total_applied: 36500,
    total_approved: 30000,
    total_sanctioned: 26000,
    total_disbursed: 24000,
    total_received: 18000,
  };

  const filters = [
    "All",
    "POTENTIAL",
    "APPLIED",
    "APPROVED",
    "SANCTIONED",
    "DISBURSED",
    "RECEIVED",
  ];

  const handleAudioSummary = () => {
    const text =
      locale === "cghi"
        ? `फाइनेंशियल डिजिटल ट्विन: संभावित फायदा ₹${s.total_potential.toLocaleString("en-IN")}। खाता म जमा ₹${s.total_received.toLocaleString("en-IN")}।`
        : locale === "hi"
          ? `फाइनेंशियल डिजिटल ट्विन: संभावित लाभ ₹${s.total_potential.toLocaleString("en-IN")}। बैंक खाते में जमा ₹${s.total_received.toLocaleString("en-IN")}।`
          : `Financial Digital Twin summary: Potential entitlement is ₹${s.total_potential.toLocaleString("en-IN")}. Confirmed received is ₹${s.total_received.toLocaleString("en-IN")}.`;
    speak(text);
  };

  return (
    <div className="space-y-6">
      <PageHeading
        title={t("benefits.title")}
        description={
          language === "hi"
            ? "संभावित, स्वीकृत एवं प्राप्त राशियों का पारदर्शी और पृथक खाता-बही। भ्रामक अनुमानों और वास्तविक बैंक भुगतान में स्पष्ट भेद।"
            : "Consolidated benefit ledger maintaining strict separation between potential entitlements, approved claims, and confirmed bank credits."
        }
        action={
          <VoiceAssistButton
            text={`Financial Digital Twin. Potential entitlement: ₹${s.total_potential}. Received confirmed: ₹${s.total_received}.`}
            label={locale === "hi" || locale === "cghi" ? "खाता-बही सारांश सुनें" : "Listen Ledger"}
          />
        }
      />

      {/* 6 Lifecycle Stage Stat Cards — Golden Rule: Never Merge Into One Deceptive Total! */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard
          label={t("benefits.stagePotential")}
          value={`₹${s.total_potential.toLocaleString()}`}
          detail="Calculated entitlement"
          icon={<WalletCards className="size-5" />}
          tone="green"
        />
        <StatCard
          label={t("benefits.stageApplied")}
          value={`₹${s.total_applied.toLocaleString()}`}
          detail="Filed in claims"
          icon={<IndianRupee className="size-5" />}
          tone="blue"
        />
        <StatCard
          label={t("benefits.stageApproved")}
          value={`₹${s.total_approved.toLocaleString()}`}
          detail="Officer cleared"
          icon={<CheckCircle2 className="size-5" />}
          tone="green"
        />
        <StatCard
          label={t("benefits.stageSanctioned")}
          value={`₹${s.total_sanctioned.toLocaleString()}`}
          detail="Authorized order"
          icon={<Landmark className="size-5" />}
          tone="yellow"
        />
        <StatCard
          label={t("benefits.stageDisbursed")}
          value={`₹${s.total_disbursed.toLocaleString()}`}
          detail="PFMS payment batch"
          icon={<Clock className="size-5" />}
          tone="slate"
        />
        <StatCard
          label={t("benefits.stageReceived")}
          value={`₹${s.total_received.toLocaleString()}`}
          detail="In bank account"
          icon={<IndianRupee className="size-5" />}
          tone="green"
        />
      </div>

      {/* Benefits Ledger Section */}
      <div className="glass-panel p-6 sm:p-7 space-y-6 border border-white/10">
        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-white/[0.08] pb-4">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer shrink-0 ${
                activeFilter === filter
                  ? "bg-emerald-500 text-slate-950 shadow-md font-extrabold"
                  : "border border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/10"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Benefit Records Grid */}
        <div className="grid gap-5 lg:grid-cols-2">
          {benefits.map((b) => (
            <Link
              key={b.id}
              href={`/farmer/benefits/${b.id}`}
              className="glass-card p-5 hover:border-emerald-500/40 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                      {b.scheme_category || "Entitlement"}
                    </span>
                    <h3 className="mt-1 text-lg font-bold text-white group-hover:text-emerald-300 transition font-display">
                      {b.scheme_name || b.scheme_id}
                    </h3>
                  </div>
                  <StatusBadge status={b.status} />
                </div>

                <p className="text-xs text-slate-400 font-mono">{b.installment_info}</p>

                {/* Amount Matrix */}
                <div className="grid grid-cols-3 gap-2.5 rounded-xl bg-white/[0.02] border border-white/[0.08] p-3 text-center text-xs">
                  <div>
                    <p className="text-[10px] font-mono uppercase text-slate-400">Estimated</p>
                    <p className="mt-1 text-sm font-extrabold text-white font-mono tabular-nums">
                      ₹{b.estimated_amount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase text-slate-400">Sanctioned</p>
                    <p className="mt-1 text-sm font-extrabold text-amber-300 font-mono tabular-nums">
                      ₹{b.sanctioned_amount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase text-emerald-400">Received</p>
                    <p className="mt-1 text-sm font-extrabold text-emerald-300 font-mono tabular-nums">
                      ₹{b.received_amount.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Sanction Mismatch Callout */}
                {b.sanctioned_amount > 0 && b.sanctioned_amount < b.estimated_amount && (
                  <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 p-2.5 text-xs font-semibold text-rose-300">
                    <AlertTriangle className="size-4 text-rose-400 shrink-0" />
                    <span>
                      Integrity Alert: ₹{(b.estimated_amount - b.sanctioned_amount).toLocaleString()} variance detected
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-white/[0.06] mt-4 flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-[11px]">Updated: {b.last_action_date}</span>
                <span className="font-bold text-emerald-400 group-hover:underline flex items-center gap-1">
                  Inspect Lifecycle Journey →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
