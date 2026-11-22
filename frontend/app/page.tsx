"use client";

import Link from "next/link";
import {
  ArrowRight,
  Calculator,
  CheckCircle2,
  FileText,
  Landmark,
  Phone,
  PhoneCall,
  Search,
  ShieldCheck,
  Sparkles,
  Sprout,
  Users,
  WalletCards,
  Wheat,
  Activity,
  Layers,
  ChevronRight,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { VoiceAssistButton, StatusBadge } from "@/components/ui-kit";
import { useTranslation } from "@/lib/i18n/context";

export default function Home() {
  const { t, locale, language } = useTranslation();

  const heroAudio =
    locale === "cghi"
      ? "कृषि सेतु म आप सबो के स्वागत हे। केंद्र अऊ छत्तीसगढ़ के सरकारी योजना, कर्जा अऊ पईसा के पूरा हिसाब-किताब।"
      : locale === "hi"
        ? "कृषि सेतु: भारत का पहला कृषि अधिकार एवं हितलाभ पारदर्शिता मंच। अपनी पात्रता जांचें, योजनाओं का लाभ लें और हर रुपये का पारदर्शी हिसाब रखें।"
        : "KrishiSetu: Next-generation agricultural entitlement intelligence and benefit transparency platform for Indian farmers.";

  const features = [
    {
      icon: Search,
      title: locale === "cghi" ? "योजना खोजव" : locale === "hi" ? "स्मार्ट योजना खोज" : "Smart Scheme Discovery",
      text: locale === "cghi"
        ? "केंद्र अऊ छत्तीसगढ़ सरकार के सबो योजना एक जगह खोजव।"
        : locale === "hi"
          ? "केंद्र और छत्तीसगढ़ राज्य की सभी कृषि योजनाएं अपनी पात्रता के अनुसार खोजें।"
          : "Discover matching central and state schemes tailored to your crop and landholding profile.",
      tag: "Verified Catalog",
      badgeTone: "emerald",
    },
    {
      icon: CheckCircle2,
      title: locale === "cghi" ? "पक्का पात्रता जांच" : locale === "hi" ? "निश्चित पात्रता विश्लेषण" : "Deterministic Eligibility",
      text: locale === "cghi"
        ? "सरकारी नियम मुताबिक सही जांच, कोनो गलत अंदाज नई।"
        : locale === "hi"
          ? "सरकारी अधिसूचनाओं के नियमों पर आधारित शत-प्रतिशत निष्पक्ष जांच। कोई भ्रामक AI अनुमान नहीं।"
          : "Rule-based programmatic evaluation against official clauses with zero AI hallucinations.",
      tag: "Rule-Based",
      badgeTone: "emerald",
    },
    {
      icon: WalletCards,
      title: locale === "cghi" ? "फाइनेंशियल डिजिटल ट्विन" : locale === "hi" ? "फाइनेंशियल डिजिटल ट्विन" : "Financial Digital Twin",
      text: locale === "cghi"
        ? "मिल सकत, मंजूर अऊ खाता म आए पईसा के अलग-अलग साफ हिसाब।"
        : locale === "hi"
          ? "संभावित, स्वीकृत एवं प्राप्त राशियों का पारदर्शी और पृथक खाता-बही।"
          : "Consolidated benefit ledger maintaining strict separation between potential, sanctioned, and received funds.",
      tag: "Core USP",
      badgeTone: "amber",
    },
    {
      icon: Calculator,
      title: locale === "cghi" ? "कर्जा अऊ सब्सिडी हिसाब" : locale === "hi" ? "ऋण एवं सब्सिडी कैलकुलेटर" : "Loan & Subsidy Calculator",
      text: locale === "cghi"
        ? "केसीसी 4% ब्याज अऊ कृषि औजार म 50% छूट के पक्का हिसाब।"
        : locale === "hi"
          ? "केसीसी 4% शुद्ध ब्याज दर और कृषि यंत्रों पर 50% तक अनुदान की पारदर्शी गणना।"
          : "Backend-computed KCC interest subvention, micro-irrigation, and machinery subsidies.",
      tag: "Formulas",
      badgeTone: "cyan",
    },
    {
      icon: ShieldCheck,
      title: locale === "cghi" ? "पईसा विसंगति जांच" : locale === "hi" ? "नीति-से-भुगतान सत्यनिष्ठा" : "Policy-to-Payment Integrity",
      text: locale === "cghi"
        ? "कम पईसा या देर होए म कारण जानव अऊ शिकायत करव।"
        : locale === "hi"
          ? "स्वीकृति आदेश और बैंक खाते में अंतर का पता लगाएं और निष्पक्ष जांच पाएं।"
          : "Detects variances between policy entitlements, sanction orders, and bank disbursement records.",
      tag: "Anti-Leakage",
      badgeTone: "rose",
    },
    {
      icon: Phone,
      title: locale === "cghi" ? "सादा फोन म सेवा (IVR)" : locale === "hi" ? "आईवीआर फोन सहायता" : "Voice & IVR Telephony",
      text: locale === "cghi"
        ? "बिना इंटरनेट के सादा मोबाइल ले बटन दबाके सबो हाल जानव।"
        : locale === "hi"
          ? "स्मार्टफोन या इंटरनेट के बिना साधारण कीपैड फोन से पूरी जानकारी सुनें।"
          : "Accessible telephone DTMF keypad interface for rural farmers with limited digital literacy.",
      tag: "1800-890-SETU",
      badgeTone: "amber",
    },
  ];

  return (
    <main className="min-h-screen text-slate-100 relative">
      {/* Top Floating Liquid Glass Navigation */}
      <header className="sticky top-0 z-50 px-4 pt-3 sm:px-8">
        <nav className="mx-auto flex h-18 max-w-7xl items-center justify-between rounded-2xl border border-white/10 bg-[#07130B]/80 px-6 backdrop-blur-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-slate-950 font-black shadow-lg shadow-emerald-500/25 border border-white/30">
              <Sprout className="size-6 text-slate-950" />
            </span>
            <div>
              <span className="block text-xl font-black tracking-tight text-white leading-none font-display">
                KrishiSetu
              </span>
              <span className="text-[10px] font-bold text-emerald-400 tracking-wider font-mono">
                कृषि सेतु · Transparency Platform
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <LanguageSwitcher showAudioPill={true} />

            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-slate-200 hover:text-white hover:bg-white/10 transition"
            >
              Sign In
            </Link>

            <Link
              href="/farmer/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-xs font-extrabold text-slate-950 shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-emerald-500 transition cursor-pointer"
            >
              <span>Explore Portal</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 pt-12 pb-20 sm:px-8 max-w-7xl mx-auto">
        <div className="grid gap-12 lg:grid-cols-12 items-center">
          {/* Hero Left Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-300 backdrop-blur-md">
              <Sparkles className="size-3.5 text-emerald-400 animate-pulse" />
              <span>Problem Statement GT-01 · 36-Hour Hackathon</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white font-display leading-[1.1]">
                Do Not Just Tell a Farmer Which Scheme Exists.{" "}
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                  Make Every Rupee Transparent.
                </span>
              </h1>
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                {locale === "cghi"
                  ? "कृषि सेतु ले अपन असली हक जानव। कोनो बिचौलिया नई, कोनो झूठ नई — सीधा सरकारी नियम अऊ बैंक खाता के पक्का हिसाब।"
                  : locale === "hi"
                    ? "भारत का पहला कृषि अधिकार बुद्धिमत्ता एवं लाभ पारदर्शिता मंच। छोटे, सीमांत, काश्तकार और बटाईदार किसानों के लिए शत-प्रतिशत निष्पक्ष विश्लेषण।"
                    : "Next-generation agricultural policy, loan, and subsidy transparency platform. Connecting farmer identity, deterministic eligibility, benefit lifecycle tracking, and policy-to-payment integrity."}
              </p>
            </div>

            {/* CTA and Voice Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/farmer/dashboard"
                className="inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 px-6 py-3.5 text-sm font-extrabold text-slate-950 shadow-xl shadow-emerald-500/25 hover:scale-[1.02] transition cursor-pointer"
              >
                <span>{locale === "hi" ? "किसान पोर्टल में प्रवेश करें" : "Enter Farmer Portal"}</span>
                <ArrowRight className="size-4" />
              </Link>

              <Link
                href="/farmer/ivr"
                className="inline-flex items-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-3.5 text-sm font-bold text-amber-300 hover:bg-amber-500/20 backdrop-blur-md transition cursor-pointer"
              >
                <PhoneCall className="size-4 text-amber-400" />
                <span>IVR Demo (1800-890-SETU)</span>
              </Link>

              <VoiceAssistButton text={heroAudio} label={locale === "hi" ? "आवाज सुनें" : "Listen intro"} />
            </div>

            {/* Quick Stats Pill */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Deterministic Rules (Zero LLM Hallucinations)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-400" />
                <span>Cultivator Identity Bridge (Sharecroppers & Tenants)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-400" />
                <span>Policy-to-Payment Forensic Audit</span>
              </div>
            </div>
          </div>

          {/* Hero Right Column: Interactive Liquid Glass Preview */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md">
              {/* Glowing Rim Background */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-500/30 to-amber-500/20 blur-xl opacity-75" />

              {/* Glass Card Surface */}
              <div className="relative glass-card p-6 space-y-5 border border-white/20 shadow-2xl">
                {/* Farmer Live Dossier Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400">
                      RK
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Ramesh Kumar</p>
                      <p className="text-[10px] font-mono text-emerald-400">KS-CG-10482 · Dharsiwa, Raipur</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                    Active Cultivator
                  </span>
                </div>

                {/* Financial Twin Lifecycle Glance */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-mono">Potential Entitlement</span>
                    <p className="text-xl font-bold text-emerald-300 font-mono tabular-nums">₹42,500</p>
                    <p className="text-[10px] text-slate-400">4 central/state schemes</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-mono">Disbursed to Bank</span>
                    <p className="text-xl font-bold text-white font-mono tabular-nums">₹18,000</p>
                    <p className="text-[10px] text-emerald-400">Aadhaar DBT confirmed</p>
                  </div>
                </div>

                {/* Discrepancy Alert Peek */}
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="size-3.5 text-amber-400" />
                      Policy-to-Payment Engine
                    </span>
                    <span className="text-[10px] text-amber-400 font-mono">Alert #alert-1</span>
                  </div>
                  <p className="text-[11px] text-amber-200/90 leading-tight">
                    PMFBY claim variance: Entitled ₹12,000, sanctioned ₹8,000 (-₹4,000 gap flagged for inquiry).
                  </p>
                </div>

                {/* One-click Action Links */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href="/farmer/benefits"
                    className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-center text-xs font-semibold text-slate-200 hover:bg-white/10 transition"
                  >
                    View Financial Twin →
                  </Link>
                  <Link
                    href="/farmer/calculator"
                    className="rounded-xl bg-emerald-500/20 border border-emerald-500/30 p-2.5 text-center text-xs font-bold text-emerald-300 hover:bg-emerald-500/30 transition"
                  >
                    Try Calculator →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Bento Grid Feature Capabilities */}
      <section className="px-4 py-16 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
            Engine Architecture
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
            Built for Transparency, Grounded in Real Data
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            A unified stack engineered to eliminate information asymmetry, administrative leakage, and digital illiteracy barriers.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="glass-card p-6 flex flex-col justify-between group hover:border-emerald-500/40 transition-all duration-300"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="grid size-11 place-items-center rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 group-hover:scale-105 transition-transform">
                      <Icon className="size-5" />
                    </span>
                    <span className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-slate-300">
                      {f.tag}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white font-display">{f.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{f.text}</p>
                </div>

                <div className="pt-4 border-t border-white/[0.06] mt-4 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 font-mono">Module {i + 1}</span>
                  <Link
                    href="/farmer/dashboard"
                    className="inline-flex items-center gap-1 font-bold text-emerald-400 group-hover:underline text-xs"
                  >
                    <span>Launch</span>
                    <ChevronRight className="size-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Role Switcher Matrix */}
      <section className="px-4 py-16 sm:px-8 max-w-7xl mx-auto">
        <div className="glass-panel p-8 sm:p-12 space-y-8 border border-white/15">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              Explore KrishiSetu by User Role
            </h2>
            <p className="text-xs text-slate-400">
              Switch seamlessly between farmer, extension officer, and governance administrator views.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {/* Farmer Card */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-300">
                  FARMER EXPERIENCE
                </span>
                <h3 className="text-lg font-bold text-white">Ramesh Kumar</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Mobile-first entitlement portal with voice readouts, Cultivator Identity Bridge for sharecroppers, and 6-stage lifecycle ledger.
                </p>
              </div>
              <Link
                href="/farmer/dashboard"
                className="inline-flex items-center justify-center rounded-xl bg-emerald-500 py-2.5 px-4 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition"
              >
                Open Farmer Workspace
              </Link>
            </div>

            {/* Officer Card */}
            <div className="rounded-2xl border border-blue-500/30 bg-cyan-950/30 p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="rounded bg-cyan-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-cyan-300">
                  OFFICER WORKBENCH
                </span>
                <h3 className="text-lg font-bold text-white">Anita Verma (RAEO)</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Operational intelligence platform for verifying cultivator declarations, investigating payment variances, and resolving grievances.
                </p>
              </div>
              <Link
                href="/officer/dashboard"
                className="inline-flex items-center justify-center rounded-xl bg-cyan-500 py-2.5 px-4 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition"
              >
                Open Officer Desk
              </Link>
            </div>

            {/* Admin Card */}
            <div className="rounded-2xl border border-purple-500/30 bg-purple-950/30 p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="rounded bg-purple-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-purple-300">
                  GOVERNANCE ADMIN
                </span>
                <h3 className="text-lg font-bold text-white">System Administrator</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Platform administration: statutory scheme catalog, Scheme Change Impact Radar with clause diffing, and security audit logs.
                </p>
              </div>
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center justify-center rounded-xl bg-purple-500 py-2.5 px-4 text-xs font-bold text-white hover:bg-purple-400 transition"
              >
                Open Governance Admin
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] px-4 py-8 sm:px-8 text-center text-xs text-slate-500 space-y-2">
        <p className="font-semibold text-slate-400">
          KrishiSetu · Agricultural Entitlement Intelligence & Benefit Transparency Platform
        </p>
        <p className="text-[11px]">
          Problem Statement GT-01 · Open Source Public Good Architecture · Built with Next.js, FastAPI & SQLite
        </p>
      </footer>
    </main>
  );
}
