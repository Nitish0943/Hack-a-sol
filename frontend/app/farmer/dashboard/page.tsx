"use client";

import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Calculator,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  IndianRupee,
  Landmark,
  MessageSquareWarning,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Volume2,
  WalletCards,
  Wheat,
  Activity,
  Layers,
  MapPin,
  TrendingUp,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Card, StatCard, StatusBadge, VoiceAssistButton, BentoGrid, BentoCard } from "@/components/ui-kit";
import { useTranslation } from "@/lib/i18n/context";
import { getFarmerDashboard } from "@/lib/api";

export default function FarmerDashboard() {
  const { t, locale, speak } = useTranslation();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    getFarmerDashboard().then(setData);
  }, []);

  const d = data || {
    farmer_name: "Ramesh Kumar",
    farmer_id_code: "KS-CG-10482",
    village: "Khamtarai",
    district: "Raipur",
    profile_completion: 85,
    potential_benefits: 42500,
    applications_count: 3,
    sanctioned_amount: 24000,
    received_amount: 18000,
    pending_actions_count: 3,
    recommended_schemes: [
      { id: "pm-kisan", name: "PM-KISAN", name_hi: "पीएम-किसान", type: "Direct income support", status: "Potentially eligible", benefit: "₹6,000 / year", description: "Direct income support in 3 equal installments of ₹2,000 each." },
      { id: "kcc", name: "Kisan Credit Card (KCC)", name_hi: "किसान क्रेडिट कार्ड", type: "Agricultural credit", status: "Potentially eligible", benefit: "Up to ₹50,000 @ 4%", description: "Short-term subsidized credit with 3% prompt repayment subvention." },
      { id: "pm-kmy", name: "PM Kisan Maan-Dhan Yojana", name_hi: "पीएम-केएमवाई पेंशन", type: "Pension support", status: "Verification required", benefit: "₹3,000 / month", description: "Assured monthly old-age pension for small and marginal farmers." },
    ],
    recent_applications: [
      { id: "app-1", scheme: "PM-KISAN", reference: "KS-2026-10482", submitted: "12 Nov 2026", status: "Approved" },
      { id: "app-2", scheme: "PM Fasal Bima Yojana", reference: "CG-PMFBY-8821", submitted: "08 Nov 2026", status: "Under review" },
      { id: "app-3", scheme: "Kisan Credit Card", reference: "KCC-77421", submitted: "29 Oct 2026", status: "Documents required" },
    ],
    recent_activities: [
      { title: "PM-KISAN Installment Confirmed", detail: "₹2,000 credited to Aadhaar-seeded bank account", date: "15 Nov 2026" },
      { title: "Integrity Discrepancy Detected", detail: "₹4,000 variance between PMFBY claim and sanction order", date: "18 Nov 2026" },
      { title: "KCC Verification Pending", detail: "Updated Rin Pustika requested by branch manager", date: "20 Nov 2026" },
    ],
  };

  const handleAudioSummary = () => {
    const summary =
      locale === "cghi"
        ? `जोहार रमेश कुमार भैया। आपके संभावित फायदा 42,500 रुपिया हे। खाता म 18,000 रुपिया जमा हो गे हे। 3 ठन अर्जी लगे हे।`
        : locale === "hi"
          ? `नमस्ते रमेश कुमार जी। आपकी संभावित सरकारी सहायता 42,500 रुपये आंकी गई है। आपके खाते में 18,000 रुपये जमा हो चुके हैं। 3 आवेदन दर्ज हैं।`
          : `Namaste Ramesh Kumar. Your calculated potential entitlement is ₹42,500. Confirmed received is ₹18,000. You have 3 recorded applications.`;
    speak(summary);
  };

  return (
    <div className="space-y-6">
      {/* Contextual Welcome Hero with Liquid Glass */}
      <section className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-r from-emerald-950/80 via-[#0B2516]/85 to-forest-950/90 p-6 sm:p-8 backdrop-blur-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)]">
        {/* Specular Top Rim */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30">
                Sunday, 22 November 2026
              </span>
              <button
                onClick={handleAudioSummary}
                className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-500/30 transition cursor-pointer backdrop-blur-md"
              >
                <Volume2 className="size-3.5" />
                <span>{locale === "hi" || locale === "cghi" ? "डैशबोर्ड सारांश सुनें" : "Listen Summary"}</span>
              </button>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-display leading-tight">
              {t("dashboard.welcome")}, {d.farmer_name}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-300/80 font-mono">
              Farmer ID: <strong className="text-white">{d.farmer_id_code}</strong> · {d.village}, {d.district} (C.G.) · 2.0 Acres Paddy
            </p>
          </div>

          {/* Cultivator Identity Bridge Pill */}
          <div className="shrink-0 flex flex-col sm:items-end gap-2">
            <div className="rounded-2xl border border-purple-500/30 bg-purple-950/40 px-4 py-2.5 backdrop-blur-md space-y-0.5">
              <span className="text-[10px] font-mono font-bold uppercase text-purple-300">
                Cultivator Identity Bridge
              </span>
              <p className="text-xs font-extrabold text-white flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-purple-400 animate-pulse" />
                Sharecropper (बटाईदार) · 50:50 Oral Lease
              </p>
              <p className="text-[10px] text-purple-200/70">Verified by Gram Sabha Resolution</p>
            </div>
          </div>
        </div>
      </section>

      {/* Spatial Financial Digital Twin Summary Banner */}
      <section className="glass-panel p-6 sm:p-7 space-y-5 border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/[0.08] pb-4">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
              Financial Digital Twin · Live Benefit Ledger
            </span>
            <h2 className="text-lg font-bold text-white font-display mt-0.5">
              Consolidated Entitlement & Disbursal Balances
            </h2>
          </div>
          <Link
            href="/farmer/benefits"
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:underline"
          >
            <span>Open Granular Ledger</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {/* 6 Lifecycle Buckets (Strictly Separated, Never Conflated) */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6 text-xs">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400">1. Potential</span>
            <p className="text-lg font-extrabold text-emerald-400 font-mono tabular-nums">₹42,500</p>
            <p className="text-[10px] text-slate-500">System calculated</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400">2. Applied</span>
            <p className="text-lg font-extrabold text-slate-200 font-mono tabular-nums">₹36,500</p>
            <p className="text-[10px] text-slate-500">3 official filings</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400">3. Approved</span>
            <p className="text-lg font-extrabold text-blue-300 font-mono tabular-nums">₹30,000</p>
            <p className="text-[10px] text-slate-500">Desk verified</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400">4. Sanctioned</span>
            <p className="text-lg font-extrabold text-amber-300 font-mono tabular-nums">₹26,000</p>
            <p className="text-[10px] text-slate-500">Sanction issued</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400">5. Disbursed</span>
            <p className="text-lg font-extrabold text-teal-300 font-mono tabular-nums">₹24,000</p>
            <p className="text-[10px] text-slate-500">PFMS released</p>
          </div>

          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 space-y-1 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <span className="text-[10px] font-mono uppercase text-emerald-300 font-bold">6. Received Confirmed</span>
            <p className="text-lg font-extrabold text-emerald-300 font-mono tabular-nums">₹18,000</p>
            <p className="text-[10px] text-emerald-400/80">In bank account</p>
          </div>
        </div>
      </section>

      {/* Discrepancy Alert Banner */}
      <div className="rounded-2xl border border-rose-500/40 bg-gradient-to-r from-rose-950/40 via-rose-900/15 to-transparent p-5 backdrop-blur-xl space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 mt-0.5">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white font-display">
                  Policy-to-Payment Discrepancy Flagged
                </h3>
                <span className="rounded bg-rose-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-rose-300 border border-rose-500/30">
                  HIGH SEVERITY
                </span>
              </div>
              <p className="mt-1 text-xs text-rose-200/90 leading-relaxed max-w-3xl">
                PMFBY claim compensation shows a <b>₹4,000 variance gap</b>: Based on the notified 60% threshold yield loss in Khamtarai village, policy entitlement is ₹12,000, but issued sanction order shows only ₹8,000.
              </p>
            </div>
          </div>

          <Link
            href="/farmer/benefits/benefit-2"
            className="inline-flex items-center gap-1.5 shrink-0 rounded-xl bg-rose-500 hover:bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition"
          >
            <span>Investigate & Appeal</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>

      {/* Bento Grid: Signature Journey Teaser & Recommended Schemes */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column (8 cols): Recommended Schemes */}
        <div className="lg:col-span-8 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
              <Wheat className="size-4.5 text-emerald-400" />
              <span>Recommended Schemes for Your Cultivation Profile</span>
            </h3>
            <Link href="/farmer/schemes" className="text-xs font-bold text-emerald-400 hover:underline">
              View All Schemes →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {d.recommended_schemes.map((sch: any) => (
              <div
                key={sch.id}
                className="glass-card p-5 flex flex-col justify-between hover:border-emerald-500/40 transition group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="rounded bg-white/5 border border-white/10 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-300">
                      {sch.type}
                    </span>
                    <StatusBadge status={sch.status} />
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-emerald-300 transition">
                    {locale === "hi" && sch.name_hi ? sch.name_hi : sch.name}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{sch.description}</p>
                  
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2.5 text-xs text-emerald-300 font-semibold">
                    <span>Entitlement: </span>
                    <strong className="text-white font-mono">{sch.benefit}</strong>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/[0.06] mt-4 flex items-center justify-between text-xs">
                  <Link
                    href={`/farmer/schemes/${sch.id}`}
                    className="font-bold text-emerald-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>Scheme Dossier</span>
                    <ArrowRight className="size-3" />
                  </Link>

                  <Link
                    href={`/farmer/eligibility?scheme=${sch.id}`}
                    className="rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1 font-semibold text-white transition"
                  >
                    Check Rules
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (4 cols): Quick Workbenches & Applications */}
        <div className="lg:col-span-4 space-y-5">
          <h3 className="text-base font-bold text-white font-display">Recent Applications</h3>

          <div className="space-y-3">
            {d.recent_applications.map((app: any) => (
              <div
                key={app.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-4 space-y-2 hover:border-white/25 transition"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-white">{app.scheme}</p>
                  <StatusBadge status={app.status} />
                </div>
                <p className="text-[11px] font-mono text-slate-400">Ref: {app.reference}</p>
                <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Submitted: {app.submitted}</span>
                  <Link
                    href={`/farmer/applications/${app.id}`}
                    className="font-bold text-emerald-400 hover:underline"
                  >
                    Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Direct IVR Hotline Card */}
          <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-amber-900/15 to-transparent p-5 backdrop-blur-xl space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wide">
              <PhoneCall className="size-4 text-amber-400" />
              <span>Basic Phone IVR Service</span>
            </div>
            <p className="text-xs text-amber-200/80 leading-relaxed">
              No internet required. Farmers can dial toll-free 1800-890-SETU from any basic keypad mobile.
            </p>
            <Link
              href="/farmer/ivr"
              className="mt-2 block w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs text-center shadow-md transition"
            >
              Open Interactive Simulator
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
