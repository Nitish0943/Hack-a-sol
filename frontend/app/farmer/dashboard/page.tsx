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
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { DemoBanner } from "@/components/demo-banner";
import { Card, StatCard, StatusBadge, VoiceAssistButton } from "@/components/ui-kit";
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
      <DemoBanner />

      {/* Hero Welcome Glass Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-forest-950 p-6 text-white shadow-xl sm:p-8 border border-white/10 backdrop-blur-2xl">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 size-80 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-emerald-700/80 px-3 py-1 text-xs font-bold text-emerald-200 border border-emerald-500/30">
                Sunday, 22 November 2026
              </span>
              <button
                onClick={handleAudioSummary}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 px-3 py-1 text-xs font-bold text-amber-300 border border-white/15 transition cursor-pointer"
              >
                <Volume2 className="size-3.5" />
                <span>{locale === "hi" || locale === "cghi" ? "डैशबोर्ड सारांश सुनें" : "Listen Summary"}</span>
              </button>
            </div>

            <h2 className="mt-3 text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              {t("dashboard.welcome")}, {d.farmer_name}
            </h2>
            <p className="mt-1 text-sm text-emerald-200 font-medium">
              Farmer ID: <strong>{d.farmer_id_code}</strong> · {d.village}, {d.district} (C.G.) · 2.0 Acres Paddy
            </p>
          </div>

          {/* Profile Completion Dial */}
          <div className="rounded-2xl bg-white/10 p-4 border border-white/15 backdrop-blur-md sm:w-72">
            <div className="flex items-center justify-between text-xs font-bold">
              <span>{t("dashboard.profileCompletion")}</span>
              <span className="text-amber-300 font-black">{d.profile_completion}%</span>
            </div>
            <div className="mt-2.5 h-2.5 w-full rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-500"
                style={{ width: `${d.profile_completion}%` }}
              />
            </div>
            <p className="mt-2 text-[10px] text-emerald-200/80 font-medium flex items-center gap-1">
              <CheckCircle2 className="size-3 text-emerald-400" /> Landowner & Paddy crop verified
            </p>
          </div>
        </div>
      </section>

      {/* 5 Distinct Financial Stage Cards (Golden Rule: Never Sum Together!) */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label={t("dashboard.potentialBenefits")}
          value={`₹${d.potential_benefits.toLocaleString("en-IN")}`}
          detail={t("dashboard.potentialDesc")}
          icon={<WalletCards className="size-5" />}
          tone="green"
        />
        <StatCard
          label={t("dashboard.applications")}
          value={String(d.applications_count)}
          detail={t("dashboard.appsDesc")}
          icon={<FileText className="size-5" />}
          tone="blue"
        />
        <StatCard
          label={t("dashboard.sanctioned")}
          value={`₹${d.sanctioned_amount.toLocaleString("en-IN")}`}
          detail={t("dashboard.sanctionedDesc")}
          icon={<Landmark className="size-5" />}
          tone="yellow"
        />
        <StatCard
          label={t("dashboard.received")}
          value={`₹${d.received_amount.toLocaleString("en-IN")}`}
          detail={t("dashboard.receivedDesc")}
          icon={<IndianRupee className="size-5" />}
          tone="green"
        />
        <StatCard
          label={t("dashboard.pendingActions")}
          value={String(d.pending_actions_count)}
          detail={t("dashboard.pendingDesc")}
          icon={<AlertCircle className="size-5" />}
          tone="red"
        />
      </div>

      {/* Main Grid: Schemes & Applications + Side Utilities */}
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* Recommended Schemes */}
          <Card>
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Wheat className="size-5 text-emerald-700" />
                  {t("dashboard.recommendedSchemes")}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{t("dashboard.recSub")}</p>
              </div>
              <Link
                href="/farmer/schemes"
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
              >
                <span>{t("common.viewAll")}</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {d.recommended_schemes.map((s: any) => (
                <div
                  key={s.id}
                  className="rounded-2xl border border-slate-200/80 bg-white/70 p-4 shadow-2xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-black text-slate-900">{locale === "hi" || locale === "cghi" ? s.name_hi : s.name}</p>
                      <StatusBadge status={s.status} />
                    </div>
                    <p className="mt-1 text-xs font-medium text-slate-500">{s.type}</p>
                    <p className="mt-2 text-xs text-slate-600 line-clamp-2">{s.description}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-sm font-black text-emerald-800">{s.benefit}</p>
                    <Link
                      href={`/farmer/schemes/${s.id}`}
                      className="text-xs font-bold text-slate-700 hover:text-emerald-800"
                    >
                      Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Applications */}
          <Card>
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <ClipboardCheck className="size-5 text-emerald-700" />
                  {t("dashboard.recentApplications")}
                </h3>
              </div>
              <Link
                href="/farmer/applications"
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
              >
                <span>Track All</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Scheme (योजना)</th>
                    <th>Reference #</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {d.recent_applications.map((app: any) => (
                    <tr key={app.id}>
                      <td className="font-bold text-slate-900">{app.scheme}</td>
                      <td className="font-mono text-xs text-slate-600">{app.reference}</td>
                      <td className="text-xs text-slate-500">{app.submitted}</td>
                      <td>
                        <StatusBadge status={app.status} />
                      </td>
                      <td>
                        <Link
                          href={`/farmer/applications/${app.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:underline"
                        >
                          View Dossier
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Sidebar Utilities: Quick Actions & Recent Activity */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <h3 className="text-base font-black text-slate-900 mb-3 flex items-center gap-2">
              <Sparkles className="size-4 text-emerald-700" />
              {t("dashboard.quickActions")}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { href: "/farmer/schemes", label: "Find Schemes", icon: Wheat },
                { href: "/farmer/calculator", label: "Loan & Subsidy", icon: Calculator },
                { href: "/farmer/eligibility", label: "Check Rules", icon: ClipboardCheck },
                { href: "/farmer/benefits", label: "Benefit Ledger", icon: WalletCards },
                { href: "/farmer/grievances/new", label: "Raise Grievance", icon: MessageSquareWarning },
                { href: "/farmer/ivr", label: "Call IVR Phone", icon: PhoneCall },
              ].map((btn) => (
                <Link
                  key={btn.href}
                  href={btn.href}
                  className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white/70 p-3 hover:border-emerald-400 hover:shadow-xs transition"
                >
                  <btn.icon className="size-5 text-emerald-800 mb-2" />
                  <span className="text-xs font-extrabold text-slate-800">{btn.label}</span>
                </Link>
              ))}
            </div>
          </Card>

          {/* Recent Activity Feed */}
          <Card>
            <h3 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-700" />
              {t("dashboard.recentActivity")}
            </h3>
            <div className="space-y-4">
              {d.recent_activities.map((act: any) => (
                <div key={act.title} className="flex gap-3 text-left">
                  <span className="mt-1 size-2.5 shrink-0 rounded-full bg-emerald-600 ring-4 ring-emerald-100" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900">{act.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{act.detail}</p>
                  </div>
                  <span className="ml-auto shrink-0 text-[10px] font-semibold text-slate-400">{act.date}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
