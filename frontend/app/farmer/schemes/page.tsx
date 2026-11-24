"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Info,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Volume2,
  VolumeX,
  Wheat,
} from "lucide-react";

import { Card, PageHeading, StatusBadge } from "@/components/ui-kit";
import { getIndexedSchemes, queryPolicyRAG } from "@/lib/api";
import type {
  Citation,
  FarmerQueryResponse,
  IndexedScheme,
} from "@/types/api";

const PRESET_QUERIES = [
  {
    label: "PM-KISAN Eligibility & ₹6,000",
    query: "What is the benefit and eligibility criteria under PM-KISAN?",
    lang: "en",
  },
  {
    label: "पीएम किसान अपात्रता (Exclusions)",
    query: "पीएम किसान योजना में कौन-कौन अपात्र है और किसे लाभ नहीं मिलेगा?",
    lang: "hi",
  },
  {
    label: "छत्तीसगढ़ धान बोनस (Chhattisgarhi)",
    query: "छत्तीसगढ़ म धान के बोनस कतका मिलही और का सहायता हे?",
    lang: "chg",
  },
  {
    label: "PMFBY फसल बीमा दावा नियम",
    query: "पीएम फसल बीमा योजना में सूखा या बाढ़ आने पर क्लेम कैसे मिलता है?",
    lang: "hi",
  },
  {
    label: "KCC Interest Subvention",
    query: "What is the interest rate and subsidy under Kisan Credit Card?",
    lang: "en",
  },
];

const FALLBACK_SCHEMES = [
  {
    id: "pm-kisan",
    name: "PM-KISAN",
    department: "Ministry of Agriculture and Farmers Welfare",
    government_level: "Central",
    category: "Income support",
    description: "Direct income support of ₹6,000 per year payable in three equal four-monthly installments to eligible landholding farmer families.",
    benefit: "₹6,000 per year",
    status: "Potentially eligible",
    source_url: "https://pmkisan.gov.in/",
  },
  {
    id: "kcc",
    name: "Kisan Credit Card (KCC)",
    department: "Department of Agriculture & Farmers Welfare",
    government_level: "Central",
    category: "Agricultural credit",
    description: "Concessional institutional short-term credit for cultivation, harvest expenses, farm maintenance, and animal husbandry.",
    benefit: "Up to ₹3,00,000 at 4% effective interest",
    status: "Potentially eligible",
    source_url: "https://www.myscheme.gov.in/schemes/kcc",
  },
  {
    id: "pmfby",
    name: "PM Fasal Bima Yojana (PMFBY)",
    department: "Department of Agriculture & Farmers Welfare",
    government_level: "Central",
    category: "Crop insurance",
    description: "Comprehensive crop insurance coverage against non-preventable natural risks from pre-sowing to post-harvest stages.",
    benefit: "Comprehensive crop loss protection",
    status: "Verification required",
    source_url: "https://pmfby.gov.in/",
  },
  {
    id: "cg-kisan-nyay",
    name: "Rajiv Gandhi Kisan Nyay Yojana / Paddy Assistance",
    department: "Department of Agriculture, Govt of Chhattisgarh",
    government_level: "State",
    category: "Crop incentive",
    description: "Input assistance and bonus support for paddy, maize, and pulse cultivators in Chhattisgarh to encourage production and crop diversification.",
    benefit: "Input support subsidy for paddy cultivators",
    status: "Active state scheme",
    source_url: "https://agriportal.cg.nic.in/",
  },
];

export default function SchemesSearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("auto");
  const [selectedState, setSelectedState] = useState<string>("all");
  const [responseStyle, setResponseStyle] = useState<"detailed" | "ivr">("detailed");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ragResult, setRagResult] = useState<FarmerQueryResponse | null>(null);

  const [indexedSchemes, setIndexedSchemes] = useState<IndexedScheme[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Fetch indexed schemes on mount
  useEffect(() => {
    let ignore = false;
    async function loadSchemes() {
      try {
        const res = await getIndexedSchemes();
        if (!ignore && res.schemes && res.schemes.length > 0) {
          setIndexedSchemes(res.schemes);
        }
      } catch {
        // Silent fallback to curated mock list if backend is not currently running
      }
    }
    loadSchemes();
    return () => {
      ignore = true;
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  async function handleSearch(queryText?: string) {
    const textToQuery = (queryText ?? searchQuery).trim();
    if (!textToQuery) return;

    setLoading(true);
    setError(null);

    try {
      const response = await queryPolicyRAG({
        question: textToQuery,
        language: selectedLanguage,
        state: selectedState === "all" ? undefined : selectedState,
        response_style: responseStyle,
      });

      startTransition(() => {
        setRagResult(response);
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to query the KrishiSetu AI assistant.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function handleVoiceReadAloud(textToRead: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in your browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.95;
    if (ragResult?.language === "hi" || ragResult?.language === "chg") {
      utterance.lang = "hi-IN";
    } else {
      utterance.lang = "en-IN";
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  function handleQuickChipClick(query: string, lang: string) {
    setSearchQuery(query);
    setSelectedLanguage(lang);
    handleSearch(query);
  }

  // Filter local/indexed schemes
  const displaySchemes = FALLBACK_SCHEMES.filter((scheme) => {
    const matchesCategory =
      selectedCategory === "All" ||
      scheme.category.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesCategory;
  });

  return (
    <div className="space-y-6">
      <PageHeading
        title="KrishiSetu AI Policy & Scheme Discovery"
        description="Ask questions in English, Hindi or Chhattisgarhi. Responses are grounded in official government policy documents with verifiable citations."
        action={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
              <Sparkles className="size-3.5" />
              Grounded AI Active
            </span>
          </div>
        }
      />

      {/* AI Search Card */}
      <Card className="border-green-200/60 bg-gradient-to-b from-white to-green-50/20">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="space-y-4"
        >
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 size-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ask about PM-KISAN, crop insurance, धान बोनस, or subsidy rules..."
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-medium text-slate-800 placeholder-slate-400 shadow-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                aria-label="Language"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 shadow-sm focus:outline-none"
              >
                <option value="auto">🌐 Auto Detect (स्वचालित)</option>
                <option value="en">English</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="chg">छत्तीसगढ़ी (Chhattisgarhi)</option>
              </select>

              <select
                aria-label="State"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 shadow-sm focus:outline-none"
              >
                <option value="all">🇮🇳 All India / Central</option>
                <option value="Chhattisgarh">🌾 Chhattisgarh</option>
              </select>

              <select
                aria-label="Response Format"
                value={responseStyle}
                onChange={(e) => setResponseStyle(e.target.value as "detailed" | "ivr")}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 shadow-sm focus:outline-none"
              >
                <option value="detailed">📄 Detailed Policy Guide</option>
                <option value="ivr">📞 IVR Spoken Summary</option>
              </select>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-[#166534] px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-[#14532d] disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <RefreshCw className="size-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" />
                    Ask Policy AI
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick preset chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="font-semibold text-slate-500">Popular inquiries:</span>
            {PRESET_QUERIES.map((preset) => (
              <button
                type="button"
                key={preset.label}
                onClick={() => handleQuickChipClick(preset.query, preset.lang)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-600 transition hover:border-green-300 hover:bg-green-50 hover:text-green-800"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </form>
      </Card>

      {/* Error alert */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertTriangle className="size-5 shrink-0 text-red-600" />
          <div className="flex-1">
            <p className="font-bold">Assistant Query Notice</p>
            <p className="mt-1 text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* RAG Answer Output Container */}
      {ragResult && (
        <Card className="border-2 border-green-600/30 bg-white shadow-md">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-[#EAF4EC] text-[#166534]">
                <Wheat className="size-4" />
              </span>
              <div>
                <h3 className="font-bold text-slate-900">
                  {ragResult.scheme_name ? `Policy Guidance: ${ragResult.scheme_name}` : "Official Policy Guidance"}
                </h3>
                <p className="text-xs text-slate-500">
                  Evidence Status: <span className="font-semibold text-slate-700">{ragResult.evidence_status}</span> · Language: <span className="uppercase font-semibold">{ragResult.language}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <StatusBadge status={ragResult.answer_status === "answered" ? "Verified Evidence" : ragResult.answer_status} />
              {(ragResult.ivr_summary || ragResult.answer) && (
                <button
                  type="button"
                  onClick={() => handleVoiceReadAloud(ragResult.ivr_summary || ragResult.answer)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                    isSpeaking
                      ? "border-amber-300 bg-amber-50 text-amber-800"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="size-3.5 text-amber-600" /> Stop Audio
                    </>
                  ) : (
                    <>
                      <Volume2 className="size-3.5 text-[#166534]" /> Listen (ऑडियो)
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Answer Content */}
          <div className="mt-5 space-y-4">
            {/* IVR spoken audio callout if available */}
            {ragResult.ivr_summary && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                  <Volume2 className="size-4 text-emerald-700" />
                  <span>IVR Phone Summary (ध्वनि संदेश)</span>
                </div>
                <p className="mt-1 text-sm leading-6 text-emerald-950 font-medium">
                  {ragResult.ivr_summary}
                </p>
              </div>
            )}

            {/* Main Grounded Answer */}
            <div className="text-sm leading-7 text-slate-800 whitespace-pre-line">
              {ragResult.answer}
            </div>

            {/* Important Conditions & Exclusions Checklist */}
            {ragResult.important_conditions && ragResult.important_conditions.length > 0 && (
              <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
                  <CheckCircle2 className="size-4 text-[#166534]" />
                  Key Policy Conditions & Eligibility Rules
                </h4>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {ragResult.important_conditions.map((cond, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[#166534]" />
                      <span>{cond}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Citations Section */}
            {ragResult.citations && ragResult.citations.length > 0 && (
              <div className="mt-5 border-t border-slate-100 pt-4">
                <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
                  <BookOpen className="size-4 text-blue-600" />
                  Official Policy Sources & Citations ({ragResult.citations.length})
                </h4>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {ragResult.citations.map((cite: Citation, idx: number) => (
                    <div
                      key={idx}
                      className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3.5 text-xs shadow-sm hover:border-blue-300"
                    >
                      <div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span className="font-semibold text-blue-700">{cite.scheme_name}</span>
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">
                            {cite.page_reference}
                          </span>
                        </div>
                        <p className="mt-1.5 font-bold text-slate-800 line-clamp-2">
                          {cite.document_title}
                        </p>
                        <p className="mt-1 text-slate-500">{cite.issuing_department}</p>
                      </div>

                      {cite.source_url && (
                        <a
                          href={cite.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#166534] hover:underline"
                        >
                          View Official Document <ExternalLink className="size-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mandatory Disclaimer */}
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200/80 bg-amber-50/60 p-3 text-xs text-amber-900">
              <ShieldCheck className="size-4 shrink-0 text-amber-700 mt-0.5" />
              <p>
                <span className="font-bold">Government Policy Disclaimer: </span>
                {ragResult.eligibility_disclaimer}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Directory of Government Agricultural Schemes */}
      <div>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Authoritative Scheme Directory</h3>
            <p className="text-xs font-semibold text-slate-600">
              Central & State programs indexed in the KrishiSetu policy knowledge base
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              aria-label="Filter category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm"
            >
              <option value="All">All Categories</option>
              <option value="Income">Income Support</option>
              <option value="Credit">Agricultural Credit</option>
              <option value="Insurance">Crop Insurance</option>
              <option value="Incentive">State Incentives</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {displaySchemes.map((scheme) => (
            <Card key={scheme.id} className="flex flex-col justify-between hover:border-slate-300">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#166534]">{scheme.category}</span>
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                        {scheme.government_level}
                      </span>
                    </div>
                    <h4 className="mt-1 text-base font-bold text-slate-900">{scheme.name}</h4>
                  </div>
                  <StatusBadge status={scheme.status} />
                </div>

                <p className="mt-2.5 text-xs leading-5 text-slate-600">
                  {scheme.description}
                </p>
              </div>

              <div className="mt-4 border-t border-slate-200/80 pt-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-[11px] font-semibold text-slate-600">{scheme.department}</p>
                  <p className="mt-0.5 text-xs font-bold text-[#166534]">{scheme.benefit}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery(`Tell me about the eligibility and benefits of ${scheme.name}`);
                      handleSearch(`Tell me about the eligibility and benefits of ${scheme.name}`);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-2.5 py-1.5 text-xs font-semibold text-[#166534] hover:bg-green-100 transition"
                  >
                    <Sparkles className="size-3" /> Ask AI
                  </button>

                  <Link
                    href={`/farmer/schemes/${scheme.id}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Details <ArrowRight className="size-3" />
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
