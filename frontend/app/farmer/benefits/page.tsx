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
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { DemoBanner } from "@/components/demo-banner";
import { Card, PageHeading, StatCard, StatusBadge } from "@/components/ui-kit";
import { useTranslation } from "@/lib/i18n/context";
import { getBenefits, getBenefitSummary } from "@/lib/api";

export default function BenefitsPage() {
  const { t, locale, speak } = useTranslation();
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
      <DemoBanner />

      <PageHeading
        title={t("benefits.title")}
        description={t("benefits.sub")}
        action={
          <button
            onClick={handleAudioSummary}
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3.5 py-1.5 text-xs font-bold transition cursor-pointer"
          >
            <Volume2 className="size-3.5" />
            <span>{locale === "hi" || locale === "cghi" ? "खाता-बही सारांश सुनें" : "Listen Ledger"}</span>
          </button>
        }
      />

      {/* 6 Lifecycle Stage Stat Cards — Golden Rule: Never Merge Into One Deceptive Total! */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard
          label={t("benefits.stagePotential")}
          value={`₹${(s.total_potential / 1000).toFixed(1)}K`}
          detail="Calculated from profile"
          icon={<WalletCards className="size-4.5" />}
          tone="green"
        />
        <StatCard
          label={t("benefits.stageApplied")}
          value={`₹${(s.total_applied / 1000).toFixed(1)}K`}
          detail="In submitted claims"
          icon={<IndianRupee className="size-4.5" />}
          tone="blue"
        />
        <StatCard
          label={t("benefits.stageApproved")}
          value={`₹${(s.total_approved / 1000).toFixed(1)}K`}
          detail="Officer cleared"
          icon={<CheckCircle2 className="size-4.5" />}
          tone="green"
        />
        <StatCard
          label={t("benefits.stageSanctioned")}
          value={`₹${(s.total_sanctioned / 1000).toFixed(1)}K`}
          detail="Authorized sanction order"
          icon={<Landmark className="size-4.5" />}
          tone="yellow"
        />
        <StatCard
          label={t("benefits.stageDisbursed")}
          value={`₹${(s.total_disbursed / 1000).toFixed(1)}K`}
          detail="PFMS release batch"
          icon={<Clock className="size-4.5" />}
          tone="slate"
        />
        <StatCard
          label={t("benefits.stageReceived")}
          value={`₹${(s.total_received / 1000).toFixed(1)}K`}
          detail="Confirmed bank credit"
          icon={<IndianRupee className="size-4.5" />}
          tone="green"
        />
      </div>

      {/* Benefits Ledger Section */}
      <Card className="p-5 sm:p-6 space-y-6">
        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-100 pb-4">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer shrink-0 ${
                activeFilter === filter
                  ? "bg-emerald-800 text-white shadow-xs"
                  : "border border-slate-200/80 bg-white/70 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Benefit Records Cards */}
        <div className="grid gap-5 lg:grid-cols-2">
          {benefits.map((b) => (
            <Link
              key={b.id}
              href={`/farmer/benefits/${b.id}`}
              className="rounded-2xl border border-slate-200/80 bg-white/70 p-5 shadow-2xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                      {b.scheme_category || "Entitlement"}
                    </span>
                    <h3 className="mt-1 text-lg font-black text-slate-900 group-hover:text-emerald-900 transition">
                      {b.scheme_name || b.scheme_id}
                    </h3>
                  </div>
                  <StatusBadge status={b.status} />
                </div>

                <p className="mt-1 text-xs text-slate-400 font-medium">{b.installment_info}</p>

                {/* Amount Matrix */}
                <div className="mt-5 grid grid-cols-3 gap-2.5 rounded-xl bg-slate-50/80 border border-slate-100 p-3 text-center">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Estimated</p>
                    <p className="mt-1 text-sm font-black text-slate-900 font-mono">
                      ₹{b.estimated_amount.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Sanctioned</p>
                    <p className="mt-1 text-sm font-black text-amber-900 font-mono">
                      ₹{b.sanctioned_amount.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Received</p>
                    <p className="mt-1 text-sm font-black text-emerald-800 font-mono">
                      ₹{b.received_amount.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                {/* Sanction Mismatch Callout */}
                {b.sanctioned_amount > 0 && b.sanctioned_amount < b.estimated_amount && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200/80 p-2 text-xs font-semibold text-amber-900">
                    <AlertTriangle className="size-4 text-amber-700 shrink-0" />
                    <span>
                      Integrity Alert: ₹{(b.estimated_amount - b.sanctioned_amount).toLocaleString("en-IN")} variance detected
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>Updated: {b.last_action_date}</span>
                <span className="font-extrabold text-emerald-800 group-hover:translate-x-0.5 transition flex items-center gap-1">
                  Lifecycle Dossier →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
