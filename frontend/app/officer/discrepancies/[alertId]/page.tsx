"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck, FileText, Send } from "lucide-react";
import { Card, PageHeading, StatusBadge } from "@/components/ui-kit";

export default function DiscrepancyDetailPage({
  params,
}: {
  params: Promise<{ alertId: string }>;
}) {
  const { alertId } = use(params);

  const [decision, setDecision] = useState<string | null>(null);
  const [remarks, setRemarks] = useState<string>("");
  const [status, setStatus] = useState<string>("Pending");

  const handleAction = (type: "verified" | "dismissed") => {
    if (type === "verified") {
      setStatus("Resolved");
      setDecision("Alert verified: Sanction adjustment order dispatched to DBT portal.");
    } else {
      setStatus("Dismissed");
      setDecision("Alert dismissed: Tolerance within authorized policy margin.");
    }
  };

  return (
    <div className="space-y-6">
      <Link
        href="/officer/discrepancies"
        className="glass glass-btn inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200"
      >
        <ArrowLeft className="size-3.5" />
        Back to Discrepancy Alerts
      </Link>

      <PageHeading
        title={`Discrepancy Alert ${alertId.toUpperCase()}`}
        description="Beneficiary: Ramesh Kumar · PM-KISAN Samman Nidhi"
        action={<StatusBadge status={status} />}
      />

      {decision && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{decision}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left Column: Explainable Alert Details */}
        <div className="space-y-6">
          <Card className="glass">
            <h3 className="font-bold text-slate-900 dark:text-white">Explainable Discrepancy Breakdown</h3>
            <p className="mt-3 text-xs leading-6 text-slate-600 dark:text-slate-300">
              The KrishiSetu financial twin engine detected an algorithmic discrepancy. The configured policy estimate is ₹12,000, whereas the recorded treasury sanction is ₹8,000, leaving an unexplained difference of ₹4,000.
            </p>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="glass rounded-xl p-3.5">
                <p className="text-[11px] text-slate-400">Expected Entitlement</p>
                <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">₹12,000</p>
              </div>
              <div className="glass rounded-xl p-3.5">
                <p className="text-[11px] text-slate-400">Recorded Sanction</p>
                <p className="mt-1 text-lg font-bold text-amber-700 dark:text-amber-400">₹8,000</p>
              </div>
              <div className="glass rounded-xl p-3.5">
                <p className="text-[11px] text-slate-400">Unexplained Gap</p>
                <p className="mt-1 text-lg font-bold text-rose-700 dark:text-rose-400">₹4,000</p>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-black/5 bg-white/40 p-4 dark:border-white/10 dark:bg-slate-900/40 text-xs">
              <p className="font-bold uppercase tracking-wider text-slate-400">Audit Source</p>
              <p className="mt-1 text-slate-600 dark:text-slate-300">
                Rule ID: <code>RULE-DISC-009</code> · Rule Version: <code>2026-CG-PMKS-01</code>
              </p>
            </div>
          </Card>
        </div>

        {/* Right Column: Review Action */}
        <div className="space-y-5">
          <Card className="glass">
            <h3 className="font-bold text-slate-900 dark:text-white">Officer Scrutiny & Action</h3>
            <p className="mt-1 text-xs text-slate-500">
              Verify discrepancy or dismiss with authorized justification
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="discrepancy-remarks-textarea" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Review Remarks
                </label>
                <textarea
                  id="discrepancy-remarks-textarea"
                  aria-label="Review Remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter verification notes or reasoning for dismissal..."
                  className="field mt-1.5 min-h-28 text-xs leading-5"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleAction("verified")}
                  className="glass-btn glass-green flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold text-white shadow"
                >
                  <CheckCircle2 className="size-3.5" />
                  Confirm & Rectify
                </button>
                <button
                  type="button"
                  onClick={() => handleAction("dismissed")}
                  className="glass glass-btn flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200"
                >
                  Dismiss Alert
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
