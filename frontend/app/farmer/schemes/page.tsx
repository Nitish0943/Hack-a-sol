"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Filter, ArrowRight, ShieldCheck, Tag, Building2, CheckCircle2 } from "lucide-react";
import { Card, PageHeading, StatusBadge } from "@/components/ui-kit";

interface SchemeDirectoryItem {
  id: string;
  name: string;
  department: string;
  category: string;
  description: string;
  benefit: string;
  status: "Potentially eligible" | "Eligible" | "Verification required" | "Not eligible";
  updated: string;
  tags: string[];
}

const DEFAULT_SCHEMES: SchemeDirectoryItem[] = [
  {
    id: "pm-kisan",
    name: "PM-KISAN Samman Nidhi",
    department: "Ministry of Agriculture & Farmers Welfare",
    category: "Income support",
    description: "Direct annual financial assistance of ₹6,000 paid in three equal installments to eligible landholding farmer families across the country.",
    benefit: "₹6,000 per financial year",
    status: "Potentially eligible",
    updated: "18 Nov 2026",
    tags: ["Central Sector", "DBT", "Income Support"],
  },
  {
    id: "kcc",
    name: "Kisan Credit Card (KCC) Crop Loan",
    department: "Department of Agriculture & Banking Partners",
    category: "Agricultural credit",
    description: "Concessional institutional short-term credit for crop cultivation, post-harvest expenses, and allied farm machinery maintenance with 3% interest subvention.",
    benefit: "Credit up to ₹3,00,000 @ 4% net interest",
    status: "Potentially eligible",
    updated: "15 Nov 2026",
    tags: ["Short-term Credit", "Subvention", "NABARD"],
  },
  {
    id: "pmfby",
    name: "PM Fasal Bima Yojana (PMFBY)",
    department: "Ministry of Agriculture & Insurance Partners",
    category: "Crop insurance",
    description: "Comprehensive risk insurance cover for non-preventable natural risks from pre-sowing to post-harvest loss at nominal premium (2% Kharif, 1.5% Rabi).",
    benefit: "Risk-based claim compensation",
    status: "Verification required",
    updated: "12 Nov 2026",
    tags: ["Insurance", "Climate Resilience", "Kharif & Rabi"],
  },
  {
    id: "pmksy",
    name: "PM Krishi Sinchayee Yojana (Per Drop More Crop)",
    department: "Department of Water Resources & Agriculture",
    category: "Irrigation",
    description: "Financial subsidy assistance for the installation of micro-irrigation systems (drip and sprinkler) to improve farm water use efficiency.",
    benefit: "Up to 55% capital subsidy",
    status: "Eligible",
    updated: "10 Nov 2026",
    tags: ["Drip Irrigation", "Water Efficiency", "Capital Grant"],
  },
  {
    id: "smam",
    name: "Sub-Mission on Agricultural Mechanization (SMAM)",
    department: "Directorate of Agricultural Engineering",
    category: "Farm machinery",
    description: "Subsidies for small and marginal farmers on custom hiring services and procurement of tractors, power tillers, rotavators, and laser land levelers.",
    benefit: "40% to 50% equipment subsidy",
    status: "Potentially eligible",
    updated: "05 Nov 2026",
    tags: ["Farm Machinery", "Mechanization", "Women Farmer Bonus"],
  },
  {
    id: "soil-health",
    name: "Soil Health Card Scheme",
    department: "Department of Agriculture, Cooperation & Farmers Welfare",
    category: "Soil & inputs",
    description: "Periodic testing of soil samples and issuance of nutrient recommendations tailored to individual farm holdings to reduce fertilizer wastage.",
    benefit: "Free testing & customized dosage advice",
    status: "Eligible",
    updated: "01 Nov 2026",
    tags: ["Nutrient Management", "Free Service"],
  },
];

export default function SchemesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All categories");
  const [eligibilityFilter, setEligibilityFilter] = useState("All");

  const filteredSchemes = useMemo(() => {
    return DEFAULT_SCHEMES.filter((scheme) => {
      // Search matching
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = scheme.name.toLowerCase().includes(query);
        const matchesDesc = scheme.description.toLowerCase().includes(query);
        const matchesDept = scheme.department.toLowerCase().includes(query);
        const matchesTags = scheme.tags.some((t) => t.toLowerCase().includes(query));
        if (!matchesName && !matchesDesc && !matchesDept && !matchesTags) {
          return false;
        }
      }

      // Category matching
      if (category !== "All categories" && scheme.category.toLowerCase() !== category.toLowerCase()) {
        return false;
      }

      // Eligibility matching
      if (eligibilityFilter !== "All" && scheme.status.toLowerCase() !== eligibilityFilter.toLowerCase()) {
        return false;
      }

      return true;
    });
  }, [search, category, eligibilityFilter]);

  return (
    <div className="space-y-6">
      <PageHeading
        title="Government Scheme Directory"
        description="Discover central and state agricultural schemes, check eligibility criteria, and calculate benefit entitlements"
      />

      {/* Filter Card */}
      <Card className="glass">
        <div className="grid gap-3 md:grid-cols-[1fr_200px_200px]">
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by scheme name, crop, or benefit keywords..."
              className="field pl-10"
            />
          </div>

          <div>
            <label htmlFor="scheme-category-filter" className="sr-only">Filter by category</label>
            <select
              id="scheme-category-filter"
              aria-label="Filter by category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="field"
            >
              <option>All categories</option>
              <option value="Income support">Income support</option>
              <option value="Agricultural credit">Agricultural credit</option>
              <option value="Crop insurance">Crop insurance</option>
              <option value="Irrigation">Irrigation</option>
              <option value="Farm machinery">Farm machinery</option>
              <option value="Soil & inputs">Soil & inputs</option>
            </select>
          </div>

          <div>
            <label htmlFor="scheme-eligibility-filter" className="sr-only">Filter by eligibility</label>
            <select
              id="scheme-eligibility-filter"
              aria-label="Filter by eligibility"
              value={eligibilityFilter}
              onChange={(e) => setEligibilityFilter(e.target.value)}
              className="field"
            >
              <option value="All">Eligibility: All</option>
              <option value="Eligible">Eligible</option>
              <option value="Potentially eligible">Potentially eligible</option>
              <option value="Verification required">Verification required</option>
            </select>
          </div>
        </div>

        {/* Quick filter pills */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-black/5 pt-3 dark:border-white/10 text-xs text-slate-500">
          <span className="font-semibold flex items-center gap-1">
            <Filter className="size-3.5" /> Quick Filters:
          </span>
          {["All", "Income support", "Agricultural credit", "Crop insurance", "Farm machinery"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat === "All" ? "All categories" : cat)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                (cat === "All" && category === "All categories") || category === cat
                  ? "glass-green font-bold text-white shadow-sm"
                  : "glass hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              {cat}
            </button>
          ))}
          {(search || category !== "All categories" || eligibilityFilter !== "All") && (
            <button
              onClick={() => {
                setSearch("");
                setCategory("All categories");
                setEligibilityFilter("All");
              }}
              className="ml-auto text-xs text-rose-600 hover:underline dark:text-rose-400 font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </Card>

      {/* Schemes Grid */}
      {filteredSchemes.length === 0 ? (
        <Card className="glass py-12 text-center">
          <p className="text-base font-semibold text-slate-700 dark:text-slate-200">
            No agricultural schemes match your search criteria.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Try resetting your filters or typing different keywords.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setCategory("All categories");
              setEligibilityFilter("All");
            }}
            className="glass-btn glass-green mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white"
          >
            Show All Schemes
          </button>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {filteredSchemes.map((scheme) => (
            <Card
              key={scheme.id}
              className="glass relative flex flex-col justify-between overflow-hidden transition hover:shadow-xl"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                      <Tag className="size-3" />
                      {scheme.category}
                    </span>
                    <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                      {scheme.name}
                    </h3>
                  </div>
                  <StatusBadge status={scheme.status} />
                </div>

                <p className="mt-3 text-xs leading-5 text-slate-600 dark:text-slate-300">
                  {scheme.description}
                </p>

                {/* Tags */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {scheme.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-black/5 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-white/10 dark:text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 border-t border-black/5 pt-4 dark:border-white/10">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Building2 className="size-3" />
                      <span className="truncate max-w-[180px]">{scheme.department}</span>
                    </div>
                    <p className="mt-1 text-sm font-bold text-emerald-700 dark:text-emerald-400">
                      {scheme.benefit}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/farmer/schemes/${scheme.id}`}
                      className="glass-btn glass-green inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-white shadow transition"
                    >
                      <span>Details</span>
                      <ArrowRight className="size-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
