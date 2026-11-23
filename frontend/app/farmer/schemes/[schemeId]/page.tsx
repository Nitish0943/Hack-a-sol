import Link from "next/link";
import { ArrowLeft, ExternalLink, Calculator, ShieldCheck, CheckCircle2, FileText, Send } from "lucide-react";
import { Card, PageHeading, StatusBadge } from "@/components/ui-kit";

interface SchemeDetailData {
  id: string;
  name: string;
  subtitle: string;
  department: string;
  category: string;
  status: string;
  description: string;
  benefitsSummary: string;
  eligibilityPoints: string[];
  documentsRequired: string[];
  policyVersion: string;
  lastUpdated: string;
  officialPortal: string;
}

const SCHEME_CATALOG: Record<string, SchemeDetailData> = {
  "pm-kisan": {
    id: "pm-kisan",
    name: "PM-KISAN Samman Nidhi",
    subtitle: "Central Sector Direct Benefit Transfer",
    department: "Ministry of Agriculture & Farmers Welfare",
    category: "Income support",
    status: "Potentially eligible",
    description: "Annual financial support providing direct income assistance transferred into Aadhaar-linked bank accounts for agricultural inputs and domestic sustenance.",
    benefitsSummary: "₹6,000 per financial year in three equal installments of ₹2,000 via DBT.",
    eligibilityPoints: [
      "All landholding farmer families with cultivable land in revenue records",
      "Valid Aadhaar card linked with active bank account (e-KYC verified)",
      "Applicable for small, marginal, and medium farm operators",
      "Excludes institutional landholders and constitutional post holders",
    ],
    documentsRequired: [
      "Land Ownership Record (Khasra/Khatauni or B-1)",
      "Aadhaar Identity Card",
      "Bank Account Passbook / Mandate",
      "Mobile number linked to Aadhaar",
    ],
    policyVersion: "2026-CG-PMKS-01",
    lastUpdated: "18 Nov 2026",
    officialPortal: "https://pmkisan.gov.in",
  },
  "kcc": {
    id: "kcc",
    name: "Kisan Credit Card (KCC) Crop Loan",
    subtitle: "Concessional Institutional Credit",
    department: "Department of Agriculture & Commercial Banks",
    category: "Agricultural credit",
    status: "Potentially eligible",
    description: "Revolving short-term cash credit facility designed for crop production, post-harvest expenses, farm asset upkeep, and domestic consumption needs.",
    benefitsSummary: "Credit limit up to ₹3,00,000 with 3% prompt repayment subvention, reducing net interest to 4% p.a.",
    eligibilityPoints: [
      "All owner cultivators and farmers cultivating notified crops",
      "Tenant farmers, oral lessees, and sharecroppers with recorded agreements",
      "Self Help Groups (SHGs) and Joint Liability Groups (JLGs) of farmers",
      "Satisfactory credit rating and valid land area declaration",
    ],
    documentsRequired: [
      "Application Form with passport photographs",
      "Land Record copy showing cultivated acreage",
      "Cropping pattern declaration for current season",
      "KYC documents (Aadhaar & PAN)",
    ],
    policyVersion: "2026-CG-CREDIT-01",
    lastUpdated: "15 Nov 2026",
    officialPortal: "https://agricoop.nic.in",
  },
  "pmfby": {
    id: "pmfby",
    name: "PM Fasal Bima Yojana (PMFBY)",
    subtitle: "Comprehensive Crop Risk Cover",
    department: "Agriculture Insurance Company & MoA",
    category: "Crop insurance",
    status: "Verification required",
    description: "Safety net shielding farmers against catastrophic yield losses from localized weather events, drought, flood, pests, and unseasonal rainfall.",
    benefitsSummary: "Full sum insured claim compensation against threshold yield shortfall. Farmer premium capped at 2% for Kharif and 1.5% for Rabi.",
    eligibilityPoints: [
      "All farmers growing notified crops in notified insurance units",
      "Both loanee and non-loanee farmers are eligible",
      "Timely sowing declaration and premium payment before season cut-off date",
      "Aadhaar-seeded operational savings account",
    ],
    documentsRequired: [
      "Sowing Certificate / Crop Sowing Declaration",
      "Land record (RoR / B-1 / Patta)",
      "Bank Passbook copy with IFSC code",
      "Aadhaar card",
    ],
    policyVersion: "2026-CG-PMFBY-02",
    lastUpdated: "12 Nov 2026",
    officialPortal: "https://pmfby.gov.in",
  },
  "pmksy": {
    id: "pmksy",
    name: "PM Krishi Sinchayee Yojana (Per Drop More Crop)",
    subtitle: "Micro-Irrigation Capital Grant",
    department: "Department of Water Resources & Agriculture",
    category: "Irrigation",
    status: "Eligible",
    description: "Financial grant for installing precision micro-irrigation systems (drip and sprinkler) that conserve water, save energy, and enhance crop yields.",
    benefitsSummary: "Up to 55% capital subsidy for small and marginal farmers; up to 45% for other categories.",
    eligibilityPoints: [
      "Farmers owning land with an assured irrigation water source",
      "Cultivators of horticulture, vegetable, or high-density crops",
      "Priority for water-stressed blocks and dryland zones",
    ],
    documentsRequired: [
      "Proof of land title and current water source availability",
      "Quotation / proforma invoice from empaneled micro-irrigation vendor",
      "Aadhaar and bank account verification",
    ],
    policyVersion: "2026-CG-PMKSY-03",
    lastUpdated: "10 Nov 2026",
    officialPortal: "https://pmksy.gov.in",
  },
  "smam": {
    id: "smam",
    name: "Sub-Mission on Agricultural Mechanization",
    subtitle: "Farm Implements & Machinery Subsidy",
    department: "Directorate of Agricultural Engineering",
    category: "Farm machinery",
    status: "Potentially eligible",
    description: "Financial grants promoting mechanization of farm operations, establishing custom hiring centers, and reducing production drudgery.",
    benefitsSummary: "40% to 50% capital subsidy on approved farm machinery (rotavators, tillers, laser levelers).",
    eligibilityPoints: [
      "Individual farmers, registered farmer producer organizations (FPOs), or SHGs",
      "Special incentives for SC/ST, women, and small/marginal farm operators",
      "Purchase from recognized and certified agricultural machinery manufacturers",
    ],
    documentsRequired: [
      "Landholding record certificate",
      "Aadhaar card and caste/category certificate if applicable",
      "Bank account details for subsidy remittance",
    ],
    policyVersion: "2026-CG-MECH-04",
    lastUpdated: "05 Nov 2026",
    officialPortal: "https://agrimachinery.nic.in",
  },
};

export default async function SchemeDetailPage({
  params,
}: {
  params: Promise<{ schemeId: string }>;
}) {
  const resolved = await params;
  const schemeKey = resolved.schemeId.toLowerCase();
  const scheme = SCHEME_CATALOG[schemeKey] || {
    id: resolved.schemeId,
    name: `${resolved.schemeId.toUpperCase()} Support Program`,
    subtitle: "Agricultural Welfare Scheme",
    department: "Department of Agriculture",
    category: "Government Support",
    status: "Potentially eligible",
    description: "Government agricultural program providing technical assistance, input subsidies, or credit enablement for eligible farmers.",
    benefitsSummary: "Financial or input subsidy in accordance with annual budget notification.",
    eligibilityPoints: [
      "Resident cultivator within notified agricultural jurisdiction",
      "Registered with KrishiSetu farmer identity registry",
      "Active bank account with DBT enablement",
    ],
    documentsRequired: [
      "Valid Identity Document (Aadhaar)",
      "Landholding or Tenancy Record",
      "Bank Account Verification Document",
    ],
    policyVersion: "2026-CG-AGRI-DEMO",
    lastUpdated: "November 2026",
    officialPortal: "https://agricoop.nic.in",
  };

  return (
    <div className="space-y-6">
      <Link
        href="/farmer/schemes"
        className="glass glass-btn inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200"
      >
        <ArrowLeft className="size-3.5" />
        Back to All Schemes
      </Link>

      <PageHeading
        title={scheme.name}
        description={`${scheme.department} · ${scheme.category}`}
        action={<StatusBadge status={scheme.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Main Details */}
        <div className="space-y-6">
          <Card className="glass">
            <h3 className="font-bold text-slate-900 dark:text-white">About this Scheme</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              {scheme.description}
            </p>

            <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                Scheme Benefits & Assistance Structure
              </h4>
              <p className="mt-2 text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                {scheme.benefitsSummary}
              </p>
            </div>
          </Card>

          <Card className="glass">
            <h3 className="font-bold text-slate-900 dark:text-white">Eligibility Criteria</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              {scheme.eligibilityPoints.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 size-4.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="glass">
            <h3 className="font-bold text-slate-900 dark:text-white">Required Documentation</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {scheme.documentsRequired.map((doc) => (
                <div
                  key={doc}
                  className="glass flex items-center gap-3 rounded-xl p-3.5 text-xs font-medium text-slate-700 dark:text-slate-200"
                >
                  <FileText className="size-4 shrink-0 text-emerald-600" />
                  <span>{doc}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar Info & Action Card */}
        <div className="space-y-5">
          <Card className="glass h-fit space-y-5">
            <h3 className="font-bold text-slate-900 dark:text-white">Scheme Quick Actions</h3>

            <div className="space-y-2.5">
              <Link
                href={`/farmer/eligibility?scheme=${scheme.id}`}
                className="glass-btn glass-green flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold text-white shadow transition"
              >
                <ShieldCheck className="size-4" />
                Evaluate My Eligibility
              </Link>

              <Link
                href="/farmer/calculator"
                className="glass glass-btn flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
              >
                <Calculator className="size-4" />
                Calculate Estimated Benefit
              </Link>

              <Link
                href="/farmer/applications"
                className="glass glass-btn flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
              >
                <Send className="size-4" />
                Track / Submit Application
              </Link>
            </div>

            <div className="border-t border-black/5 pt-4 dark:border-white/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Administrative Reference
              </h4>
              <dl className="mt-3 space-y-3 text-xs">
                <div className="flex justify-between">
                  <dt className="text-slate-400">Policy Code</dt>
                  <dd className="font-semibold text-slate-700 dark:text-slate-200">{scheme.policyVersion}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400">Last Verified</dt>
                  <dd className="font-semibold text-slate-700 dark:text-slate-200">{scheme.lastUpdated}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400">Department</dt>
                  <dd className="font-semibold text-slate-700 dark:text-slate-200 text-right max-w-[150px] truncate">{scheme.department}</dd>
                </div>
              </dl>
            </div>

            <a
              href={scheme.officialPortal}
              target="_blank"
              rel="noreferrer"
              className="glass glass-btn flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-medium text-slate-600 dark:text-slate-300"
            >
              <span>External Scheme Portal</span>
              <ExternalLink className="size-3.5" />
            </a>
          </Card>
        </div>
      </div>
    </div>
  );
}
