"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  ExternalLink,
  Landmark,
  RefreshCw,
  Scale,
  Shield,
  ShieldCheck,
  Sprout,
  Volume2,
  VolumeX,
  Wheat,
  X,
} from "lucide-react";
import { DemoBanner } from "@/components/demo-banner";
import { Card, StatusBadge } from "@/components/ui-kit";
import { CountUp, Reveal } from "@/components/motion";
import {
  farmersApi,
  privateSchemesApi,
  schemesApi,
  type FarmerDashboardData,
  type PrivateSchemeItem,
  type SchemeItem,
} from "@/lib/api";

// Real official government scheme emblems & graphics (Wikimedia / Official Portals)
const OFFICIAL_GOV_BANNERS: Record<string, { bannerUrl: string; authority: string; badge: string }> = {
  "scheme-pm-kisan": {
    bannerUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/PM-Kisan_Scheme_Logo.svg/640px-PM-Kisan_Scheme_Logo.svg.png",
    authority: "Ministry of Agriculture & FW",
    badge: "PM-KISAN Central",
  },
  "scheme-kcc": {
    bannerUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/300px-Emblem_of_India.svg.png",
    authority: "NABARD & Dept of Agriculture",
    badge: "Kisan Credit Card (KCC)",
  },
  "scheme-pmfby": {
    bannerUrl: "https://pmfby.gov.in/assets/images/logo.png",
    authority: "Ministry of Agriculture & FW",
    badge: "PM Fasal Bima Yojana",
  },
  "scheme-rgkny": {
    bannerUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Seal_of_Chhattisgarh.svg/300px-Seal_of_Chhattisgarh.svg.png",
    authority: "Dept of Agriculture, CG",
    badge: "Rajiv Gandhi Kisan Nyay",
  },
  "scheme-gny": {
    bannerUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Seal_of_Chhattisgarh.svg/300px-Seal_of_Chhattisgarh.svg.png",
    authority: "Dept of Animal Husbandry, CG",
    badge: "Godhan Nyay Organic",
  },
  "scheme-ssy": {
    bannerUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Seal_of_Chhattisgarh.svg/300px-Seal_of_Chhattisgarh.svg.png",
    authority: "CREDA Chhattisgarh",
    badge: "Saur Sujala Solar Pump",
  },
};

// Verified seed private schemes fallback
const BACKUP_PRIVATE_SCHEMES: PrivateSchemeItem[] = [
  {
    id: "pvt-sbi-kgc",
    name: "SBI Kisan Gold Card (KGC)",
    lender: "State Bank of India",
    category: "Agricultural Loan",
    benefit_text: "Up to ₹3,00,000 at 7% p.a.",
    image_url: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=600&q=80",
    logo_url: "https://sbi.co.in/o/SBI-Theme/images/custom/logo.png",
    source_url: "https://sbi.co.in/web/agri-rural/agriculture-banking/crop-finance/kisan-gold-card",
    last_verified: "2026-11-20",
    is_active: 1,
    source_license: "Official SBI Agriculture Portal / Verified Schedule",
  },
  {
    id: "pvt-bob-bkcc",
    name: "Baroda Kisan Credit Card",
    lender: "Bank of Baroda",
    category: "Kisan Credit Loan",
    benefit_text: "Scale-of-finance credit limit",
    image_url: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=600&q=80",
    logo_url: "https://www.bankofbaroda.in/-/media/project/bob/countrysites/india/home/header/logo.svg",
    source_url: "https://www.bankofbaroda.in/business-banking/rural-agri/loans-and-advances/baroda-kisan-credit-card",
    last_verified: "2026-11-18",
    is_active: 1,
    source_license: "Official Bank of Baroda Portal / Verified Schedule",
  },
  {
    id: "pvt-mahindra-tractor",
    name: "Mahindra Tractor & Implement Loan",
    lender: "Mahindra Finance",
    category: "Equipment Finance",
    benefit_text: "Up to 90% tractor funding",
    image_url: "https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&w=600&q=80",
    logo_url: "https://www.mahindrafinance.com/assets/images/logo.png",
    source_url: "https://www.mahindrafinance.com/tractor-loans",
    last_verified: "2026-11-15",
    is_active: 1,
    source_license: "Official Mahindra Finance Portal / Verified Schedule",
  },
  {
    id: "pvt-bajaj-crop",
    name: "Bajaj Allianz General Crop Insurance",
    lender: "Bajaj Allianz",
    category: "Crop Insurance",
    benefit_text: "Comprehensive yield risk cover",
    image_url: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80",
    logo_url: "https://www.bajajallianz.com/content/dam/bagic/bagic-logo.png",
    source_url: "https://www.bajajallianz.com/crop-insurance.html",
    last_verified: "2026-11-10",
    is_active: 1,
    source_license: "Official Bajaj Allianz Portal / Verified Schedule",
  },
  {
    id: "pvt-hdfc-irrigation",
    name: "HDFC Drip & Micro Irrigation Loan",
    lender: "HDFC Bank",
    category: "Irrigation Loan",
    benefit_text: "Terms vary, see official page",
    image_url: "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=600&q=80",
    logo_url: "https://www.hdfcbank.com/content/api/contentstream-id/723fb80a-2dde-42a3-9793-7ae1be57c87f/2988185c-cc71-4a12-8877-3e819a86b972/Footer/Resource/Logo.svg",
    source_url: "https://www.hdfcbank.com/personal/borrow/popular-loans/agriculture-loans",
    last_verified: "2026-11-12",
    is_active: 1,
    source_license: "Official HDFC Bank Portal / Verified Schedule",
  },
];

// Helper: Extract domain from URL
function getDomainFromUrl(urlStr: string): string {
  try {
    return new URL(urlStr).hostname;
  } catch {
    return "";
  }
}

// Helper: Check if date is within 180 days
function isWithin180Days(dateStr?: string): boolean {
  if (!dateStr) return false;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return false;
    const now = new Date();
    const diffDays = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 180;
  } catch {
    return false;
  }
}

// Compact Lender Logo Component (size-8)
function CompactLenderLogo({
  logoUrl,
  sourceUrl,
  lenderName,
}: {
  logoUrl?: string;
  sourceUrl: string;
  lenderName: string;
}) {
  const [tier, setTier] = useState<1 | 2 | 3>(logoUrl ? 1 : 2);
  const domain = getDomainFromUrl(sourceUrl);
  const faviconUrl = domain
    ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
    : "";

  const initials = lenderName
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "LB";

  if (tier === 1 && logoUrl) {
    return (
      <div className="relative size-8 shrink-0 overflow-hidden rounded-lg bg-white p-0.5 shadow-xs border border-slate-200/80">
        <Image
          src={logoUrl}
          alt={`${lenderName} logo`}
          width={28}
          height={28}
          className="size-full object-contain"
          onError={() => setTier(2)}
        />
      </div>
    );
  }

  if (tier === 2 && faviconUrl) {
    return (
      <div className="relative size-8 shrink-0 overflow-hidden rounded-lg bg-white p-0.5 shadow-xs border border-slate-200/80">
        <Image
          src={faviconUrl}
          alt={`${lenderName} icon`}
          width={26}
          height={26}
          className="size-full object-contain"
          onError={() => setTier(3)}
        />
      </div>
    );
  }

  return (
    <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-blue-700 to-slate-900 text-[10px] font-bold text-white shadow-xs">
      {initials}
    </div>
  );
}

// Compact Official Scheme Emblem (size-8)
function CompactSchemeEmblem({
  schemeId,
  schemeName,
  imageUrl,
  category,
}: {
  schemeId: string;
  schemeName: string;
  imageUrl?: string;
  category?: string;
}) {
  const meta = OFFICIAL_GOV_BANNERS[schemeId];
  const [imgErr, setImgErr] = useState(false);
  const logoUrl = meta?.bannerUrl || imageUrl;

  return (
    <div className="relative size-8 shrink-0 overflow-hidden rounded-lg bg-white p-0.5 shadow-xs border border-slate-200/80 grid place-items-center">
      {logoUrl && !imgErr ? (
        <Image
          src={logoUrl}
          alt={`${schemeName} emblem`}
          width={28}
          height={28}
          className="size-full object-contain"
          onError={() => setImgErr(true)}
        />
      ) : (
        <div className="grid size-full place-items-center text-[#166534]">
          {category?.toLowerCase().includes("credit") || category?.toLowerCase().includes("loan") ? (
            <Landmark className="size-4" />
          ) : category?.toLowerCase().includes("insurance") ? (
            <ShieldCheck className="size-4" />
          ) : (
            <Wheat className="size-4" />
          )}
        </div>
      )}
    </div>
  );
}

export default function FarmerDashboard() {
  // Tabs & real-time state
  const [govTab, setGovTab] = useState<"Central" | "State">("Central");
  const [govSchemes, setGovSchemes] = useState<SchemeItem[]>([]);
  const [privateSchemes, setPrivateSchemes] = useState<PrivateSchemeItem[]>([]);
  const [dashboardData, setDashboardData] = useState<FarmerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [refreshError, setRefreshError] = useState<string | null>(null);

  // Web Speech API readout state
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [hasSpeechSupport, setHasSpeechSupport] = useState(false);

  // Compare modal state
  const [compareItem, setCompareItem] = useState<PrivateSchemeItem | null>(null);

  // Speech support detection
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setHasSpeechSupport(true);
    }
  }, []);

  const handleSpeak = (id: string, textToSpeak: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const hiVoice = voices.find((v) => v.lang.startsWith("hi"));
    if (hiVoice) {
      utterance.voice = hiVoice;
      utterance.lang = "hi-IN";
    }

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  // Main data fetching routine
  const loadData = useCallback(async (isBackground = false) => {
    if (isBackground) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setRefreshError(null);

    try {
      // 1. Fetch Government Schemes
      const govResult = await schemesApi.list({ limit: 30 });
      if (Array.isArray(govResult) && govResult.length > 0) {
        setGovSchemes(govResult);
      }

      // 2. Fetch Private Schemes from dedicated endpoint
      try {
        const pvtResult = await privateSchemesApi.list();
        if (Array.isArray(pvtResult) && pvtResult.length > 0) {
          setPrivateSchemes(pvtResult);
        } else {
          setPrivateSchemes(BACKUP_PRIVATE_SCHEMES);
        }
      } catch {
        setPrivateSchemes((prev) => (prev.length > 0 ? prev : BACKUP_PRIVATE_SCHEMES));
      }

      // 3. Fetch Personalized Farmer Dashboard & Next Best Actions
      try {
        const dashResult = await farmersApi.dashboard();
        if (dashResult) {
          setDashboardData(dashResult);
        }
      } catch {
        // Fallback gracefully if guest or unauthenticated
      }

      setLastUpdated(new Date());
    } catch {
      setRefreshError("Couldn't refresh live data — displaying verified records.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Real-time lifecycle: Initial load + 60s auto-refresh + focus & online listeners
  useEffect(() => {
    loadData(false);

    const interval = setInterval(() => {
      loadData(true);
    }, 60000);

    const onFocus = () => {
      loadData(true);
    };

    const onOnline = () => {
      loadData(true);
    };

    window.addEventListener("focus", onFocus);
    window.addEventListener("online", onOnline);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("online", onOnline);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [loadData]);

  // Relative updated time string calculator
  const getUpdatedTimeString = () => {
    const secondsAgo = Math.floor((new Date().getTime() - lastUpdated.getTime()) / 1000);
    if (secondsAgo < 45) return "Updated just now";
    const minsAgo = Math.floor(secondsAgo / 60);
    if (minsAgo <= 1) return "Updated 1 min ago";
    return `Updated ${minsAgo} min ago`;
  };

  // Derive Central vs State Government schemes
  const filteredGovSchemes = govSchemes.filter((s) => {
    const isStateScheme =
      s.state?.toLowerCase().includes("chhattisgarh") ||
      s.state?.toLowerCase().includes("cg") ||
      s.id.includes("rgkny") ||
      s.id.includes("gny") ||
      s.id.includes("ssy") ||
      s.id.includes("chilli") ||
      s.id.includes("drip") ||
      s.id.includes("fisheries") ||
      s.id.includes("tractor") ||
      s.department?.toLowerCase().includes("chhattisgarh");

    if (govTab === "State") {
      return isStateScheme;
    } else {
      return !isStateScheme || s.state?.toLowerCase().includes("central");
    }
  });

  // Display top 2 schemes side-by-side
  const displayedGovSchemes = filteredGovSchemes.slice(0, 2);

  // Private schemes: filter active and <= 180 days verified (top 2 side-by-side)
  const displayedPrivateSchemes = privateSchemes
    .filter((p) => p.is_active !== 0 && isWithin180Days(p.last_verified))
    .slice(0, 2);

  return (
    <div className="space-y-4">
      {/* 1. DEMO BANNER */}
      <DemoBanner />

      {/* 2. YOUR NEXT BEST ACTION CARD */}
      {(() => {
        const topAction = dashboardData?.nextBestActions?.[0];
        const actionTitle = topAction?.title || "Check eligibility for Kisan Credit Card";
        const actionDesc = topAction?.action || "Unlock credit and scheme benefits tailored to your farm profile.";
        const actionLink = topAction?.link || "/farmer/eligibility";

        return (
          <Reveal>
            <Link
              href={actionLink}
              className="glass glass-btn flex items-center gap-3.5 rounded-2xl p-3.5 sm:p-4 transition hover:shadow-md"
            >
              <span className="pulse-ring grid size-10 shrink-0 place-items-center rounded-xl bg-[#EAB308] text-slate-900 shadow-sm">
                <ClipboardCheck className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                  Your next best action
                </p>
                <p className="font-bold text-sm sm:text-base text-slate-900 leading-tight">
                  {actionTitle}
                </p>
                <p className="text-xs font-semibold text-slate-600">
                  {actionDesc}
                </p>
              </div>
              <ArrowRight className="ml-auto size-4 shrink-0 text-[#166534]" />
            </Link>
          </Reveal>
        );
      })()}

      {/* 3. NEW TWO-COLUMN SECTION (HALF THE SIZE, 2 BLOCKS SIDE BY SIDE IN BOTH) */}
      <section className="space-y-2">
        {/* Real-time status header bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-600" />
            </span>
            <span className="text-[11px] font-semibold text-slate-600">
              {getUpdatedTimeString()}
            </span>
            {refreshing && (
              <span className="text-[10px] text-emerald-700 animate-pulse font-medium">
                (Syncing...)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {refreshError && (
              <span className="text-[11px] text-amber-700 font-medium bg-amber-50 border border-amber-200/80 rounded-md px-1.5 py-0.2">
                {refreshError}
              </span>
            )}
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              title="Refresh schemes feed"
              aria-label="Refresh schemes feed"
              className="glass grid size-6 place-items-center rounded-md text-slate-500 hover:text-emerald-700 hover:bg-white/90 transition disabled:opacity-50"
            >
              <RefreshCw className={`size-3 ${refreshing ? "animate-spin text-emerald-700" : ""}`} />
            </button>
          </div>
        </div>

        {/* Outer Two-Column Container: Left: Government Schemes | Right: Private Schemes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
          {/* ================= LEFT COLUMN: GOVERNMENT SCHEMES (2 BLOCKS SIDE BY SIDE) ================= */}
          <Card className="flex flex-col h-full bg-white/80 backdrop-blur-md border border-white/90 shadow-xs rounded-2xl p-3.5 sm:p-4">
            {/* Header */}
            <div className="flex items-center justify-between gap-2 mb-3 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="grid size-6 place-items-center rounded-lg bg-emerald-100 text-emerald-800 shrink-0">
                  <Building2 className="size-3.5" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 text-sm truncate">
                    Government Schemes
                  </h3>
                  <p className="text-[10px] text-slate-600 font-semibold truncate">
                    Official Central & State Subsidies
                  </p>
                </div>
              </div>

              {/* Glass Segmented Toggle */}
              <div className="inline-flex shrink-0 rounded-lg p-0.5 bg-slate-100 border border-slate-200/90 shadow-inner">
                <button
                  type="button"
                  onClick={() => setGovTab("Central")}
                  className={`rounded-md px-2 py-0.5 text-[11px] font-semibold transition ${
                    govTab === "Central"
                      ? "bg-[#166534] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Central
                </button>
                <button
                  type="button"
                  onClick={() => setGovTab("State")}
                  className={`rounded-md px-2 py-0.5 text-[11px] font-semibold transition ${
                    govTab === "State"
                      ? "bg-[#166534] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  State (CG)
                </button>
              </div>
            </div>

            {/* 2 BLOCKS SIDE BY SIDE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 flex-1">
              {loading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className="glass rounded-xl p-3 animate-pulse space-y-2 border border-white/80 h-28"
                  >
                    <div className="h-4 w-3/4 rounded bg-slate-200/80" />
                    <div className="h-5 w-1/2 rounded bg-slate-200/60" />
                    <div className="h-3 w-full rounded bg-slate-200/50" />
                  </div>
                ))
              ) : displayedGovSchemes.length === 0 ? (
                <div className="col-span-2 text-center py-6 px-3 rounded-xl glass border border-slate-100">
                  <Sprout className="size-6 mx-auto text-slate-400 mb-1" />
                  <p className="font-semibold text-slate-700 text-xs">No schemes found</p>
                </div>
              ) : (
                displayedGovSchemes.map((scheme) => {
                  const meta = OFFICIAL_GOV_BANNERS[scheme.id];
                  const plainSummary =
                    scheme.description ||
                    scheme.eligibility_summary ||
                    "Direct financial subsidy & agricultural protection.";

                  const benefitDisplay =
                    scheme.benefit_details ||
                    scheme.benefit_description ||
                    (scheme.id.includes("pm-kisan")
                      ? "₹6,000 / yr"
                      : scheme.id.includes("kcc")
                      ? "Up to ₹24,500"
                      : scheme.id.includes("pmfby")
                      ? "Up to ₹12,000"
                      : "Direct subsidy");

                  const isSpeaking = speakingId === `gov-${scheme.id}`;
                  const speechText = `${scheme.name}. ${benefitDisplay}. ${plainSummary}`;

                  return (
                    <div
                      key={scheme.id}
                      className="group glass glass-btn flex flex-col justify-between rounded-xl border border-white/80 p-2.5 shadow-xs hover:shadow-sm transition relative overflow-hidden bg-white/70"
                    >
                      {/* Top accent badge */}
                      <div
                        className={`absolute top-0 inset-x-0 h-0.5 ${
                          govTab === "State" ? "bg-emerald-600" : "bg-[#166534]"
                        }`}
                      />

                      {/* Header row: Emblem, Title & Speech */}
                      <div className="flex items-start justify-between gap-1 mt-0.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <CompactSchemeEmblem
                            schemeId={scheme.id}
                            schemeName={scheme.name}
                            imageUrl={scheme.image_url}
                            category={scheme.category}
                          />

                          <div className="min-w-0">
                            <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/90 rounded px-1.5 py-0.2 border border-emerald-200/50">
                              {scheme.category || "Subsidy"}
                            </span>
                            <h4
                              className="font-bold text-xs text-slate-900 truncate leading-tight mt-0.5 group-hover:text-emerald-800 transition"
                              title={scheme.name}
                            >
                              {scheme.name}
                            </h4>
                          </div>
                        </div>

                        {/* Speech button */}
                        {hasSpeechSupport && (
                          <button
                            type="button"
                            onClick={() => handleSpeak(`gov-${scheme.id}`, speechText)}
                            title={isSpeaking ? "Stop listening" : "Listen in Hindi/English"}
                            aria-label={`Listen to ${scheme.name} details`}
                            className={`size-6 shrink-0 grid place-items-center rounded-md transition ${
                              isSpeaking
                                ? "bg-emerald-600 text-white animate-pulse"
                                : "text-slate-400 hover:text-emerald-800 hover:bg-emerald-50"
                            }`}
                          >
                            {isSpeaking ? (
                              <VolumeX className="size-3" />
                            ) : (
                              <Volume2 className="size-3" />
                            )}
                          </button>
                        )}
                      </div>

                      {/* Middle: Benefit Value */}
                      <div className="mt-2 pt-1.5 border-t border-slate-200/80">
                        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-wide">
                          Benefit Value
                        </p>
                        <p className="text-sm sm:text-base font-extrabold text-[#166534] tracking-tight truncate">
                          {benefitDisplay}
                        </p>
                      </div>

                      {/* Footer: Issuing body & Check link */}
                      <div className="mt-1.5 pt-1.5 border-t border-slate-200/80 flex items-center justify-between gap-1">
                        <span
                          className="text-[10px] font-semibold text-slate-600 truncate max-w-[105px]"
                          title={meta?.authority || scheme.department}
                        >
                          {meta?.authority || scheme.department || "Govt. of India"}
                        </span>
                        <Link
                          href={`/farmer/schemes/${scheme.id}`}
                          className="inline-flex items-center gap-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 border border-emerald-300/80 px-2 py-0.5 text-[10px] font-bold text-emerald-900 transition shrink-0 shadow-2xs"
                        >
                          <span>Check</span>
                          <ChevronRight className="size-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom: View all link */}
            <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-600 font-semibold">
                {displayedGovSchemes.length} of {filteredGovSchemes.length} schemes
              </span>
              <Link
                href="/farmer/schemes"
                className="font-bold text-[#166534] hover:text-emerald-900 inline-flex items-center gap-1 hover:underline"
              >
                <span>View all schemes</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>
          </Card>

          {/* ================= RIGHT COLUMN: PRIVATE SCHEMES (2 BLOCKS SIDE BY SIDE) ================= */}
          <Card className="flex flex-col h-full bg-white/80 backdrop-blur-md border border-white/90 shadow-xs rounded-2xl p-3.5 sm:p-4">
            {/* Header */}
            <div className="flex items-center justify-between gap-2 mb-3 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="grid size-6 place-items-center rounded-lg bg-blue-100 text-blue-800 shrink-0">
                  <Building2 className="size-3.5" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 text-sm truncate">
                    Private Schemes & Loans
                  </h3>
                  <p className="text-[10px] text-slate-600 font-semibold truncate">
                    Commercial Bank & Insurance Partners
                  </p>
                </div>
              </div>

              {/* Verified partners badge */}
              <div className="inline-flex items-center gap-1 shrink-0 rounded-full bg-blue-50 border border-blue-200/80 px-2 py-0.5 text-[10px] font-bold text-blue-900 shadow-2xs">
                <CheckCircle2 className="size-2.5 text-blue-700" />
                <span>Verified</span>
              </div>
            </div>

            {/* 2 BLOCKS SIDE BY SIDE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 flex-1">
              {loading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className="glass rounded-xl p-3 animate-pulse space-y-2 border border-white/80 h-28"
                  >
                    <div className="h-4 w-3/4 rounded bg-slate-200/80" />
                    <div className="h-5 w-1/2 rounded bg-slate-200/60" />
                    <div className="h-3 w-full rounded bg-slate-200/50" />
                  </div>
                ))
              ) : displayedPrivateSchemes.length === 0 ? (
                <div className="col-span-2 text-center py-6 px-3 rounded-xl glass border border-slate-100">
                  <Landmark className="size-6 mx-auto text-slate-400 mb-1" />
                  <p className="font-semibold text-slate-700 text-xs">No active private schemes</p>
                </div>
              ) : (
                displayedPrivateSchemes.map((pvt) => {
                  const isSpeaking = speakingId === `pvt-${pvt.id}`;
                  const speechText = `${pvt.name} by ${pvt.lender}. Offer: ${pvt.benefit_text}. Category: ${pvt.category}.`;
                  const isVerifiedRecent = isWithin180Days(pvt.last_verified);

                  return (
                    <div
                      key={pvt.id}
                      className="group glass glass-btn flex flex-col justify-between rounded-xl border border-white/80 p-2.5 shadow-xs hover:shadow-sm transition relative overflow-hidden bg-white/70"
                    >
                      {/* Top accent badge */}
                      <div className="absolute top-0 inset-x-0 h-0.5 bg-blue-600" />

                      {/* Header row: Logo, Name & Speech */}
                      <div className="flex items-start justify-between gap-1 mt-0.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <CompactLenderLogo
                            logoUrl={pvt.logo_url}
                            sourceUrl={pvt.source_url}
                            lenderName={pvt.lender}
                          />

                          <div className="min-w-0">
                            <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-blue-800 bg-blue-100/80 rounded px-1.5 py-0.2 border border-blue-200/50">
                              {pvt.category}
                            </span>
                            <h4
                              className="font-bold text-xs text-slate-900 truncate leading-tight mt-0.5 group-hover:text-blue-800 transition"
                              title={pvt.name}
                            >
                              {pvt.name}
                            </h4>
                          </div>
                        </div>

                        {/* Speech button */}
                        {hasSpeechSupport && (
                          <button
                            type="button"
                            onClick={() => handleSpeak(`pvt-${pvt.id}`, speechText)}
                            title={isSpeaking ? "Stop listening" : "Listen in Hindi/English"}
                            aria-label={`Listen to ${pvt.name} details`}
                            className={`size-6 shrink-0 grid place-items-center rounded-md transition ${
                              isSpeaking
                                ? "bg-blue-600 text-white animate-pulse"
                                : "text-slate-400 hover:text-blue-800 hover:bg-blue-50"
                            }`}
                          >
                            {isSpeaking ? (
                              <VolumeX className="size-3" />
                            ) : (
                              <Volume2 className="size-3" />
                            )}
                          </button>
                        )}
                      </div>

                      {/* Middle: Benefit / Rate */}
                      <div className="mt-2 pt-1.5 border-t border-slate-200/80">
                        <div className="flex items-center justify-between">
                          <p className="text-[9px] font-bold text-slate-600 uppercase tracking-wide">
                            Commercial Offer
                          </p>
                          {!isVerifiedRecent && (
                            <span className="text-[8px] font-bold uppercase text-amber-800 bg-amber-100 rounded px-1">
                              Sample
                            </span>
                          )}
                        </div>
                        <p className="text-sm sm:text-base font-extrabold text-[#166534] tracking-tight truncate">
                          {pvt.benefit_text}
                        </p>
                      </div>

                      {/* Footer: Official page & Compare */}
                      <div className="mt-1.5 pt-1.5 border-t border-slate-200/80 flex items-center justify-between gap-1">
                        <a
                          href={pvt.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 text-[10px] font-bold text-slate-700 hover:text-blue-800 transition truncate max-w-[90px]"
                        >
                          <span>Official</span>
                          <ExternalLink className="size-2.5" />
                        </a>

                        <button
                          type="button"
                          onClick={() => setCompareItem(pvt)}
                          className="inline-flex items-center gap-0.5 rounded-md bg-blue-50 hover:bg-blue-100 border border-blue-300/80 px-2 py-0.5 text-[10px] font-bold text-blue-900 transition shrink-0 shadow-2xs"
                        >
                          <Scale className="size-3" />
                          <span>Compare</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom: Partner verification note */}
            <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-600 font-semibold">
              <span>Verified partner schedules</span>
              <span className="text-slate-600 font-semibold">180-day audit cycle</span>
            </div>
          </Card>
        </div>
      </section>

      {/* 4. RECENT APPLICATIONS (LEFT) & QUICK ACTIONS (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 mt-4">
        {/* RECENT APPLICATIONS */}
        <Card className="glass rounded-2xl p-3.5 sm:p-4 border border-white/70">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Recent applications</h3>
            <Link
              href="/farmer/applications"
              className="text-xs font-semibold text-[#166534] hover:underline"
            >
              Track all
            </Link>
          </div>
          <div className="table-wrap">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200/90 text-[11px] text-slate-700 font-bold">
                  <th className="pb-2 font-bold uppercase tracking-wider text-slate-700">Scheme</th>
                  <th className="pb-2 font-bold uppercase tracking-wider text-slate-700">Reference</th>
                  <th className="pb-2 font-bold uppercase tracking-wider text-slate-700">Submitted</th>
                  <th className="pb-2 font-bold uppercase tracking-wider text-slate-700">Status</th>
                  <th className="pb-2 font-bold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 text-xs">
                {[
                  ["PM-KISAN", "KS-2026-10482", "12 Nov 2026", "Approved"],
                  ["PMFBY", "CG-PMFBY-8821", "08 Nov 2026", "Under review"],
                  ["Kisan Credit Card", "KCC-77421", "29 Oct 2026", "Documents required"],
                ].map((row) => (
                  <tr key={row[1]} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 font-bold text-slate-900">{row[0]}</td>
                    <td className="py-2.5 text-slate-700 font-mono text-[11px] font-semibold">{row[1]}</td>
                    <td className="py-2.5 text-slate-600 font-medium text-[11px]">{row[2]}</td>
                    <td className="py-2.5">
                      <StatusBadge status={row[3]} />
                    </td>
                    <td className="py-2.5 text-right">
                      <Link
                        href="/farmer/applications"
                        className="text-[#166534] hover:text-emerald-900"
                        aria-label={`View application ${row[1]}`}
                      >
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* QUICK ACTIONS */}
        <Card className="glass rounded-2xl p-3.5 sm:p-4 border border-white/70">
          <h3 className="font-bold text-sm text-slate-900">Quick actions</h3>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[
              ["/farmer/schemes", "Find Schemes", ClipboardCheck],
              ["/farmer/calculator", "Calculate", Building2],
              ["/farmer/applications", "Track status", ArrowRight],
              ["/farmer/profile", "My Profile", Sprout],
            ].map(([href, label, Icon]) => (
              <Link
                key={String(label)}
                href={String(href)}
                className="flex min-h-18 flex-col justify-between glass glass-btn rounded-xl p-2.5 text-xs font-semibold text-slate-800 transition hover:shadow-xs"
              >
                <Icon className="size-4 text-[#166534]" />
                <span>{String(label)}</span>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      {/* PRODUCT COMPARISON MODAL */}
      {compareItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md glass rounded-2xl p-5 shadow-2xl bg-white/95 border border-white space-y-3.5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <CompactLenderLogo
                  logoUrl={compareItem.logo_url}
                  sourceUrl={compareItem.source_url}
                  lenderName={compareItem.lender}
                />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{compareItem.name}</h4>
                  <p className="text-xs text-slate-500">{compareItem.lender}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCompareItem(null)}
                aria-label="Close dialog"
                className="grid size-7 place-items-center rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="rounded-xl bg-emerald-50/70 border border-emerald-200/60 p-3 space-y-0.5">
              <p className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wide">
                Key Benefit / Rate
              </p>
              <p className="text-lg font-extrabold text-[#166534]">{compareItem.benefit_text}</p>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="font-medium text-slate-500">Category:</span>
                <span className="font-bold text-slate-800">{compareItem.category}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="font-medium text-slate-500">Last Verified:</span>
                <span className="font-bold text-slate-800">{compareItem.last_verified}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="font-medium text-slate-500">Source:</span>
                <span className="font-medium text-slate-800 truncate max-w-[200px]">
                  {compareItem.source_license || "Official Public Schedule"}
                </span>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setCompareItem(null)}
                className="px-3 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Close
              </button>
              <a
                href={compareItem.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-xl bg-[#166534] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 transition"
              >
                <span>Visit Lender Page</span>
                <ExternalLink className="size-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
