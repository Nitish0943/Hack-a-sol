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
} from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useTranslation } from "@/lib/i18n/context";

export default function Home() {
  const { t, locale } = useTranslation();

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
    },
    {
      icon: Calculator,
      title: locale === "cghi" ? "कर्जा अऊ सब्सिडी हिसाब" : locale === "hi" ? "ऋण एवं सब्सिडी कैलकुलेटर" : "Loan & Subsidy Calculator",
      text: locale === "cghi"
        ? "केसीसी 4% ब्याज अऊ कृषि औजार म 50% छूट के पक्का हिसाब।"
        : locale === "hi"
          ? "केसीसी 4% शुद्ध ब्याज दर और कृषि यंत्रों पर 50% तक अनुदान की पारदर्शी गणना।"
          : "Backend-computed KCC interest subvention, micro-irrigation, and machinery subsidies.",
      tag: "Backend Formulas",
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
    },
    {
      icon: Phone,
      title: locale === "cghi" ? "सादा फोन म सेवा (IVR)" : locale === "hi" ? "आईवीआर फोन सहायता" : "Voice & IVR Telephony",
      text: locale === "cghi"
        ? "बिना इंटरनेट के सादा मोबाइल ले बटन दबाके सबो हाल जानव।"
        : locale === "hi"
          ? "स्मार्टफोन या इंटरनेट के बिना साधारण कीपैड फोन से पूरी जानकारी सुनें।"
          : "Accessible telephone DTMF keypad interface for rural farmers with limited digital literacy.",
      tag: "Zero-Data Access",
    },
  ];

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F8FAF5] text-slate-800 selection:bg-emerald-200">
      {/* Top Floating Glass Navigation */}
      <header className="sticky top-0 z-50 px-4 pt-3 sm:px-8">
        <nav className="mx-auto flex h-18 max-w-7xl items-center justify-between rounded-2xl border border-white/80 bg-white/75 px-5 shadow-[0_8px_32px_0_rgba(20,83,45,0.06)] backdrop-blur-2xl">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-emerald-800 to-forest-900 text-white shadow-md shadow-emerald-950/20 border border-white/25">
              <Sprout className="size-6 text-emerald-200" />
            </span>
            <div>
              <span className="block text-xl font-black tracking-tight text-slate-900 leading-none">
                KrishiSetu
              </span>
              <span className="text-xs font-bold text-emerald-800 tracking-wide mt-1 block">
                कृषि सेतु · Entitlement Platform
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <LanguageSwitcher showAudioPill={true} />
            <Link
              href="/login"
              className="hidden sm:inline-flex rounded-xl px-4 py-2 text-sm font-bold text-slate-700 hover:text-emerald-900 hover:bg-emerald-50/60 transition"
            >
              {t("common.login")}
            </Link>
            <Link
              href="/register"
              className="btn-primary"
            >
              <span>{t("common.register")}</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-5 pb-20 pt-12 sm:px-8 md:pt-16">
        {/* Ambient background glows */}
        <div className="absolute top-10 left-1/2 -z-10 h-72 w-full max-w-4xl -translate-x-1/2 rounded-full bg-gradient-to-r from-emerald-200/40 via-yellow-100/30 to-green-100/40 blur-3xl pointer-events-none" />

        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/60 bg-emerald-50/90 px-4 py-1.5 text-xs font-bold text-emerald-900 shadow-2xs backdrop-blur-md">
              <Sparkles className="size-4 text-emerald-700" />
              <span>Next-Gen Agricultural Entitlement Intelligence</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black leading-[1.08] tracking-tight text-slate-900">
              {locale === "cghi"
                ? "अपन फायदा जानव।"
                : locale === "hi"
                  ? "अपने लाभ जानें।"
                  : "Know Your Benefits."}
              <br />
              <span className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-600 bg-clip-text text-transparent">
                {locale === "cghi"
                  ? "हर रुपिया के हिसाब रखव।"
                  : locale === "hi"
                    ? "हर रुपये पर नज़र रखें।"
                    : "Track Every Rupee."}
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-slate-600 font-medium">
              {locale === "cghi"
                ? "सरकारी योजना खोजव, पात्रता समझव, पईसा के हिसाब रखव अऊ बिना इंटरनेट के सादा फोन ले जानकारी पाव।"
                : locale === "hi"
                  ? "सरकारी कृषि योजनाएं खोजें, निष्पक्ष पात्रता जानें, वित्तीय लाभों का अलग-अलग पारदर्शी बही-खाता रखें और साधारण फोन से भी सहायता पाएं।"
                  : "Empowering small, marginal, tenant farmers and sharecroppers with deterministic scheme discovery, financial twin tracking, discrepancy alerts, and IVR telephone assistance."}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/register"
                className="btn-primary text-base px-6 py-3.5 shadow-lg shadow-emerald-900/20"
              >
                <span>{locale === "hi" || locale === "cghi" ? "मुफ़्त खाता बनाएं" : "Get Started Now"}</span>
                <ArrowRight className="size-4.5" />
              </Link>
              <Link
                href="/login"
                className="btn-glass text-base px-6 py-3.5"
              >
                <Users className="size-4.5 text-emerald-800" />
                <span>{locale === "hi" || locale === "cghi" ? "डेमो लॉगिन करें" : "Explore Demo Portals"}</span>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="mt-10 flex flex-wrap items-center gap-6 text-xs font-bold text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-700" />
                <span>Zero Hallucination Rules</span>
              </div>
              <div className="flex items-center gap-2">
                <Wheat className="size-4 text-emerald-700" />
                <span>Tenant & Sharecropper Bridge</span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneCall className="size-4 text-emerald-700" />
                <span>1800-890-SETU (IVR)</span>
              </div>
            </div>
          </div>

          {/* Interactive Floating Glass Preview Card */}
          <div className="relative">
            <div className="rounded-[32px] border border-white/80 bg-white/85 p-6 shadow-[0_24px_60px_-12px_rgba(20,83,45,0.15),0_0_0_1px_rgba(20,83,45,0.06)] backdrop-blur-3xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                      Live Digital Twin Ledger
                    </p>
                  </div>
                  <p className="mt-1 font-black text-lg text-slate-900">Ramesh Kumar (रमेश कुमार)</p>
                  <p className="text-xs text-slate-500 font-medium">KS-CG-10482 · Khamtarai, Raipur (CG)</p>
                </div>
                <div className="text-right">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800">
                    85% Verified
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1 font-semibold">2.0 Acres Paddy</p>
                </div>
              </div>

              {/* Strict Financial Stage Separation Showcase */}
              <div className="grid grid-cols-2 gap-3.5 py-5">
                <div className="rounded-2xl bg-gradient-to-br from-emerald-800 to-forest-950 p-4 text-white shadow-md shadow-emerald-950/20 border border-white/10">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-200">
                    Potential Benefits
                  </p>
                  <p className="mt-1 text-2xl sm:text-3xl font-black">₹42,500</p>
                  <p className="text-[10px] text-emerald-300/80 mt-1">Calculated entitlement</p>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-xs">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Confirmed Received
                  </p>
                  <p className="mt-1 text-2xl sm:text-3xl font-black text-slate-900">₹18,000</p>
                  <p className="text-[10px] text-emerald-700 font-semibold mt-1">Verified bank credits</p>
                </div>
              </div>

              {/* Sample Benefit Rows */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white/70 p-3 shadow-2xs">
                  <div>
                    <p className="text-sm font-bold text-slate-900">PM-KISAN Income Support</p>
                    <p className="text-xs font-medium text-emerald-700">Confirmed credited to DBT account</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900">₹6,000</p>
                    <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      Received
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-amber-200/60 bg-amber-50/50 p-3 shadow-2xs">
                  <div>
                    <p className="text-sm font-bold text-slate-900">PM Fasal Bima (PMFBY)</p>
                    <p className="text-xs font-medium text-amber-800">Alert: ₹4,000 sanction variance detected</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-amber-900">₹8,000</p>
                    <span className="inline-block rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                      Discrepancy
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white/70 p-3 shadow-2xs">
                  <div>
                    <p className="text-sm font-bold text-slate-900">Kisan Credit Card (KCC)</p>
                    <p className="text-xs font-medium text-slate-500">Credit drawing limit active</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900">₹18,000</p>
                    <span className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                      Sanctioned
                    </span>
                  </div>
                </div>
              </div>

              {/* Phone Simulator Teaser */}
              <div className="mt-4 rounded-xl bg-slate-900 p-3 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-8 place-items-center rounded-lg bg-amber-500 text-slate-950 font-black">
                    <Phone className="size-4" />
                  </span>
                  <div>
                    <p className="text-xs font-bold">Interactive IVR Simulator</p>
                    <p className="text-[10px] text-slate-400">Dialpad keypad tested with exact database</p>
                  </div>
                </div>
                <Link
                  href="/farmer/ivr"
                  className="rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-bold text-amber-300 transition"
                >
                  Test Call →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Capabilities Grid */}
      <section id="features" className="relative border-t border-slate-200/80 bg-white/60 py-20 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-800">
              Complete Agricultural Policy Transparency
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              Built for Farmers, Accessible for Every Household
            </h2>
            <p className="mt-3 text-base text-slate-600 font-medium">
              KrishiSetu is not just an informational scheme portal. It is an intelligent entitlement bridge that isolates what you are owed, detects payment blockers, and protects your rights.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative rounded-2xl border border-white/80 bg-white/85 p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 backdrop-blur-xl"
              >
                <div className="flex items-center justify-between">
                  <span className="grid size-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-100 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                    <feature.icon className="size-6" />
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                    {feature.tag}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-black text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 font-medium">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IVR & Accessibility Banner */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-emerald-900 via-emerald-800 to-forest-950 p-8 text-white shadow-2xl sm:p-12">
          <div className="relative z-10 flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-amber-300 border border-white/15">
                <PhoneCall className="size-3.5" /> No Smartphone or Internet Required
              </span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-black leading-tight text-white">
                Dial 1800-890-SETU Anytime for Voice Guidance
              </h2>
              <p className="mt-3 text-sm sm:text-base text-emerald-100/90 leading-relaxed font-medium">
                Hear your scheme eligibility, check delayed subsidy payments, or register grievances directly using telephone keypad buttons in हिन्दी, छत्तीसगढ़ी, or English.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/farmer/ivr"
                className="btn-primary bg-amber-400 hover:bg-amber-300 text-slate-950 font-black shadow-lg"
              >
                <Phone className="size-4 text-slate-950" />
                <span>Launch Interactive IVR Simulator</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white/80 py-10 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 sm:px-8 sm:flex-row sm:items-center sm:justify-between text-xs font-medium text-slate-500">
          <div className="flex items-center gap-3">
            <span className="grid size-8 place-items-center rounded-xl bg-emerald-800 text-white font-black">
              <Sprout className="size-4" />
            </span>
            <span>
              <strong>KrishiSetu</strong> · GT-01 Agricultural Transparency Demonstration Platform
            </span>
          </div>
          <div className="flex flex-wrap gap-6 font-bold text-slate-700">
            <Link href="/farmer/dashboard" className="hover:text-emerald-800">
              Farmer Portal
            </Link>
            <Link href="/officer/dashboard" className="hover:text-emerald-800">
              Officer Portal
            </Link>
            <Link href="/admin/dashboard" className="hover:text-emerald-800">
              Admin Portal
            </Link>
            <Link href="/farmer/ivr" className="hover:text-emerald-800">
              IVR Phone
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
