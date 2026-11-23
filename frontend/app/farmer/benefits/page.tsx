"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { IndianRupee, WalletCards, ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck, Filter } from "lucide-react";
import { DemoBanner } from "@/components/demo-banner";
import { Card, PageHeading, StatCard, StatusBadge } from "@/components/ui-kit";
import { TwinPipeline } from "@/components/twin-pipeline";

interface BenefitRecordItem {
  id: string;
  name: string;
  category: string;
  code: string;
  estimatedAmount: number;
  appliedAmount: number;
  approvedAmount: number;
  sanctionedAmount: number;
  disbursedAmount: number;
  receivedAmount: number;
  status: "Potential" | "Applied" | "Approved" | "Sanctioned" | "Disbursed" | "Received";
  updatedAt: string;
  bankAccount: string;
  notes: string;
}

const BENEFIT_RECORDS: BenefitRecordItem[] = [
  {
    id: "benefit-1",
    name: "PM-KISAN Samman Nidhi",
    category: "Income support",
    code: "BF-CG-001",
    estimatedAmount: 6000,
    appliedAmount: 6000,
    approvedAmount: 6000,
    sanctionedAmount: 6000,
    disbursedAmount: 6000,
    receivedAmount: 6000,
    status: "Received",
    updatedAt: "22 Nov 2026",
    bankAccount: "SBI •••• 4892",
    notes: "Installment #16 credited via NPCI DBT mandate.",
  },
  {
    id: "benefit-2",
    name: "PM Fasal Bima Yojana",
    category: "Crop insurance",
    code: "BF-CG-002",
    estimatedAmount: 12000,
    appliedAmount: 12000,
    approvedAmount: 12000,
    sanctionedAmount: 0,
    disbursedAmount: 0,
    receivedAmount: 0,
    status: "Approved",
    updatedAt: "20 Nov 2026",
    bankAccount: "SBI •••• 4892",
    notes: "Yield assessment approved; sanction voucher pending issuance.",
  },
  {
    id: "benefit-3",
    name: "Kisan Credit Card Subvention",
    category: "Agricultural credit",
    code: "BF-CG-003",
    estimatedAmount: 24500,
    appliedAmount: 20000,
    approvedAmount: 18000,
    sanctionedAmount: 18000,
    disbursedAmount: 12000,
    receivedAmount: 12000,
    status: "Sanctioned",
    updatedAt: "18 Nov 2026",
    bankAccount: "SBI •••• 4892",
    notes: "Prompt repayment 3% interest relief credited by district cooperative bank.",
  },
  {
    id: "benefit-4",
    name: "Micro-Irrigation Subsidy (PMKSY)",
    category: "Irrigation grant",
    code: "BF-CG-004",
    estimatedAmount: 35000,
    appliedAmount: 35000,
    approvedAmount: 0,
    sanctionedAmount: 0,
    disbursedAmount: 0,
    receivedAmount: 0,
    status: "Applied",
    updatedAt: "15 Nov 2026",
    bankAccount: "SBI •••• 4892",
    notes: "Application under technical verification by assistant engineer.",
  },
  {
    id: "benefit-5",
    name: "Agricultural Mechanization (SMAM)",
    category: "Farm implements",
    code: "BF-CG-005",
    estimatedAmount: 50000,
    appliedAmount: 0,
    approvedAmount: 0,
    sanctionedAmount: 0,
    disbursedAmount: 0,
    receivedAmount: 0,
    status: "Potential",
    updatedAt: "10 Nov 2026",
    bankAccount: "SBI •••• 4892",
    notes: "Identified based on 2-acre landholding category and farm equipment eligibility.",
  },
];

const FILTERS = ["All", "Potential", "Applied", "Approved", "Sanctioned", "Disbursed", "Received"] as const;

export default function BenefitsPage() {
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const filteredRecords = useMemo(() => {
    if (activeFilter === "All") return BENEFIT_RECORDS;
    return BENEFIT_RECORDS.filter(
      (b) => b.status.toLowerCase() === activeFilter.toLowerCase(),
    );
  }, [activeFilter]);

  // Totals
  const totalPotential = BENEFIT_RECORDS.reduce((s, b) => s + b.estimatedAmount, 0);
  const totalApplied = BENEFIT_RECORDS.reduce((s, b) => s + b.appliedAmount, 0);
  const totalApproved = BENEFIT_RECORDS.reduce((s, b) => s + b.approvedAmount, 0);
  const totalSanctioned = BENEFIT_RECORDS.reduce((s, b) => s + b.sanctionedAmount, 0);
  const totalDisbursed = BENEFIT_RECORDS.reduce((s, b) => s + b.disbursedAmount, 0);
  const totalReceived = BENEFIT_RECORDS.reduce((s, b) => s + b.receivedAmount, 0);

  return (
    <div className="space-y-6">
      <DemoBanner />

      <PageHeading
        title="Financial Digital Twin & Benefit Ledger"
        description="Immutable single-pane ledger mapping potential entitlements to verified bank disbursements"
      />

      {/* Metric Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Potential"
          value={`₹${(totalPotential / 1000).toFixed(1)}K`}
          detail="Identified entitlements"
          icon={<WalletCards className="size-5" />}
        />
        <StatCard
          label="Applied"
          value={`₹${(totalApplied / 1000).toFixed(1)}K`}
          detail="In review"
          icon={<IndianRupee className="size-5" />}
          tone="blue"
        />
        <StatCard
          label="Approved"
          value={`₹${(totalApproved / 1000).toFixed(1)}K`}
          detail="Authorized"
          icon={<IndianRupee className="size-5" />}
        />
        <StatCard
          label="Sanctioned"
          value={`₹${(totalSanctioned / 1000).toFixed(1)}K`}
          detail="Order issued"
          icon={<IndianRupee className="size-5" />}
          tone="yellow"
        />
        <StatCard
          label="Disbursed"
          value={`₹${(totalDisbursed / 1000).toFixed(1)}K`}
          detail="In transit"
          icon={<IndianRupee className="size-5" />}
        />
        <StatCard
          label="Received"
          value={`₹${(totalReceived / 1000).toFixed(1)}K`}
          detail="In bank account"
          icon={<CheckCircle2 className="size-5" />}
        />
      </div>

      {/* Digital Twin Stage Pipeline */}
      <div className="glass rounded-2xl p-5">
        <TwinPipeline />
      </div>

      {/* Ledger Section with Interactive Filters */}
      <Card className="glass">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 pb-4 dark:border-white/10">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">
              Farmer Benefit Records ({filteredRecords.length})
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Filter records by stage in the disbursement lifecycle
            </p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <Filter className="size-3.5 text-slate-400 mr-1" />
            {FILTERS.map((filter) => {
              const count =
                filter === "All"
                  ? BENEFIT_RECORDS.length
                  : BENEFIT_RECORDS.filter((b) => b.status === filter).length;
              return (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    activeFilter === filter
                      ? "glass-btn glass-green text-white shadow-sm"
                      : "glass hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  {filter} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRecords.map((record) => (
            <Link
              key={record.id}
              href={`/farmer/benefits/${record.id}`}
              className="glass glass-btn relative flex flex-col justify-between rounded-2xl p-4.5 text-left transition hover:shadow-xl"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-400">
                      {record.category} · {record.code}
                    </span>
                    <h4 className="mt-1 font-bold text-slate-900 dark:text-white">
                      {record.name}
                    </h4>
                  </div>
                  <StatusBadge status={record.status} />
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="glass rounded-xl p-2.5">
                    <dt className="text-[11px] text-slate-400">Estimated</dt>
                    <dd className="mt-0.5 font-bold text-slate-800 dark:text-slate-100">
                      ₹{record.estimatedAmount.toLocaleString("en-IN")}
                    </dd>
                  </div>
                  <div className="glass rounded-xl p-2.5">
                    <dt className="text-[11px] text-slate-400">Recorded</dt>
                    <dd className="mt-0.5 font-bold text-emerald-700 dark:text-emerald-400">
                      ₹{(record.receivedAmount || record.sanctionedAmount || record.approvedAmount || record.appliedAmount).toLocaleString("en-IN")}
                    </dd>
                  </div>
                </dl>

                <p className="mt-3 text-[11px] leading-4 text-slate-500">
                  {record.notes}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-3 dark:border-white/10 text-[11px] text-slate-400">
                <span>Updated {record.updatedAt}</span>
                <span className="flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400">
                  Inspect Record <ArrowRight className="size-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
