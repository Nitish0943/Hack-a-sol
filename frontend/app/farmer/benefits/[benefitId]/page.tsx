import Link from "next/link";
import { ArrowLeft, AlertTriangle, ShieldCheck, CheckCircle2, FileText, ArrowRight, Clock } from "lucide-react";
import { Card, PageHeading, StatusBadge } from "@/components/ui-kit";

interface BenefitRecordDetails {
  id: string;
  name: string;
  code: string;
  category: string;
  status: string;
  estimated: number;
  applied: number;
  approved: number;
  sanctioned: number;
  disbursed: number;
  received: number;
  bankAccount: string;
  discrepancyNote?: string;
  timeline: Array<{ stage: string; date: string; completed: boolean }>;
}

const BENEFIT_MAP: Record<string, BenefitRecordDetails> = {
  "benefit-1": {
    id: "benefit-1",
    name: "PM-KISAN Samman Nidhi",
    code: "BF-CG-001",
    category: "Income support",
    status: "Received",
    estimated: 6000,
    applied: 6000,
    approved: 6000,
    sanctioned: 6000,
    disbursed: 6000,
    received: 6000,
    bankAccount: "SBI •••• 4892 (Aadhaar Seeded)",
    timeline: [
      { stage: "Eligibility identified", date: "02 May 2026", completed: true },
      { stage: "Beneficiary registered & e-KYC", date: "05 May 2026", completed: true },
      { stage: "State verification approved", date: "15 May 2026", completed: true },
      { stage: "R-FTO Generated & Sanctioned", date: "28 May 2026", completed: true },
      { stage: "DBT Direct Bank Credit", date: "22 Nov 2026", completed: true },
    ],
  },
  "benefit-2": {
    id: "benefit-2",
    name: "PM Fasal Bima Yojana",
    code: "BF-CG-002",
    category: "Crop insurance",
    status: "Approved",
    estimated: 12000,
    applied: 12000,
    approved: 12000,
    sanctioned: 0,
    disbursed: 0,
    received: 0,
    bankAccount: "SBI •••• 4892",
    discrepancyNote: "Claim approved by insurance committee, but sanction order is overdue by 14 days.",
    timeline: [
      { stage: "Crop loss claim submitted", date: "10 Oct 2026", completed: true },
      { stage: "Survey & remote sensing verified", date: "24 Oct 2026", completed: true },
      { stage: "Claim compensation approved", date: "08 Nov 2026", completed: true },
      { stage: "Treasury sanction release", date: "Pending issuance", completed: false },
      { stage: "Bank credit confirmation", date: "Pending", completed: false },
    ],
  },
  "benefit-3": {
    id: "benefit-3",
    name: "Kisan Credit Card Subvention",
    code: "BF-CG-003",
    category: "Agricultural credit",
    status: "Sanctioned",
    estimated: 24500,
    applied: 20000,
    approved: 18000,
    sanctioned: 18000,
    disbursed: 12000,
    received: 12000,
    bankAccount: "DCCB Raipur •••• 1928",
    discrepancyNote: "Partial subvention release: ₹6,000 pending audit confirmation.",
    timeline: [
      { stage: "Prompt repayment audited", date: "12 Oct 2026", completed: true },
      { stage: "3% Subvention calculated", date: "20 Oct 2026", completed: true },
      { stage: "District committee sanction", date: "02 Nov 2026", completed: true },
      { stage: "Tranche 1 disbursed (₹12,000)", date: "18 Nov 2026", completed: true },
      { stage: "Tranche 2 balance (₹6,000)", date: "Under review", completed: false },
    ],
  },
};

export default async function BenefitDetailPage({
  params,
}: {
  params: Promise<{ benefitId: string }>;
}) {
  const { benefitId } = await params;
  const benefit = BENEFIT_MAP[benefitId] || {
    id: benefitId,
    name: "Agricultural Benefit Record",
    code: `BF-CG-${benefitId.slice(0, 6).toUpperCase()}`,
    category: "Government Assistance",
    status: "Approved",
    estimated: 10000,
    applied: 10000,
    approved: 10000,
    sanctioned: 10000,
    disbursed: 0,
    received: 0,
    bankAccount: "State Bank of India •••• 4892",
    timeline: [
      { stage: "Application submitted", date: "01 Nov 2026", completed: true },
      { stage: "Officer verified", date: "10 Nov 2026", completed: true },
      { stage: "Sanction pending", date: "In progress", completed: false },
    ],
  };

  return (
    <div className="space-y-6">
      <Link
        href="/farmer/benefits"
        className="glass glass-btn inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200"
      >
        <ArrowLeft className="size-3.5" />
        Back to Benefit Ledger
      </Link>

      <PageHeading
        title={benefit.name}
        description={`Record ${benefit.code} · ${benefit.category}`}
        action={<StatusBadge status={benefit.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Left Column: Breakdown and Timeline */}
        <div className="space-y-6">
          <Card className="glass">
            <h3 className="font-bold text-slate-900 dark:text-white">Lifecycle Ledger Amounts</h3>
            <p className="mt-1 text-xs text-slate-500">
              Audit trail of benefit entitlements from initial calculation to bank realization
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                ["Estimated", benefit.estimated],
                ["Applied", benefit.applied],
                ["Approved", benefit.approved],
                ["Sanctioned", benefit.sanctioned],
                ["Disbursed", benefit.disbursed],
                ["Received in Bank", benefit.received],
              ].map(([label, value]) => (
                <div key={label as string} className="glass rounded-xl p-3.5">
                  <p className="text-[11px] font-medium text-slate-500">{label as string}</p>
                  <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                    {Number(value) > 0 ? `₹${Number(value).toLocaleString("en-IN")}` : "Pending"}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-black/5 pt-4 dark:border-white/10 text-xs text-slate-500">
              <span>Seeded DBT Account: <strong className="text-slate-800 dark:text-slate-200">{benefit.bankAccount}</strong></span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <ShieldCheck className="size-4" /> NPCI Active
              </span>
            </div>
          </Card>

          <Card className="glass">
            <h3 className="font-bold text-slate-900 dark:text-white">Disbursement Timeline</h3>
            <div className="mt-5 space-y-4">
              {benefit.timeline.map((item, i) => (
                <div key={item.stage} className="flex items-start gap-3">
                  <div className="mt-0.5 grid size-6 place-items-center rounded-full text-xs font-bold shrink-0">
                    {item.completed ? (
                      <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Clock className="size-5 text-amber-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${item.completed ? "text-slate-900 dark:text-white" : "text-amber-700 dark:text-amber-400"}`}>
                      {item.stage}
                    </p>
                    <p className="text-xs text-slate-400">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Alerts and Actions */}
        <div className="space-y-5">
          {benefit.discrepancyNote ? (
            <Card className="glass border-amber-500/30">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />
                <div>
                  <h4 className="text-sm font-bold text-amber-900 dark:text-amber-300">
                    Discrepancy Detected
                  </h4>
                  <p className="mt-1 text-xs leading-5 text-amber-800 dark:text-amber-400">
                    {benefit.discrepancyNote}
                  </p>
                </div>
              </div>

              <Link
                href={`/farmer/grievances/new?scheme=${encodeURIComponent(benefit.name)}&ref=${benefit.code}`}
                className="glass-btn glass-green mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white shadow"
              >
                Raise Grievance for this Record
                <ArrowRight className="size-3.5" />
              </Link>
            </Card>
          ) : (
            <Card className="glass">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Ledger Reconciled
                  </h4>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    All entitlement records and bank transactions for this scheme match verified state records.
                  </p>
                </div>
              </div>
            </Card>
          )}

          <Card className="glass space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Record Metadata
            </h4>
            <dl className="space-y-2 text-xs">
              <div className="flex justify-between">
                <dt className="text-slate-400">Scheme ID</dt>
                <dd className="font-semibold text-slate-700 dark:text-slate-200">{benefit.code}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Ledger Key</dt>
                <dd className="font-mono text-slate-700 dark:text-slate-200">KT-{benefit.id}</dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}
