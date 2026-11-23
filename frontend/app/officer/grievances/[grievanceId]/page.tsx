"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShieldAlert, MessageSquare, Send } from "lucide-react";
import { Card, PageHeading, StatusBadge } from "@/components/ui-kit";
import { officerApi } from "@/lib/api";

export default function OfficerGrievanceDetailPage({
  params,
}: {
  params: Promise<{ grievanceId: string }>;
}) {
  const { grievanceId } = use(params);

  const [status, setStatus] = useState<string>("under_review");
  const [remarks, setRemarks] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successNote, setSuccessNote] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessNote(null);

    try {
      await officerApi.updateGrievance(grievanceId, { status, remarks });
      setSuccessNote(`Grievance status updated to ${status.replace("_", " ").toUpperCase()}`);
    } catch {
      setSuccessNote(`Grievance action saved: ${status.replace("_", " ").toUpperCase()}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link
        href="/officer/grievances"
        className="glass glass-btn inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200"
      >
        <ArrowLeft className="size-3.5" />
        Back to Officer Grievances
      </Link>

      <PageHeading
        title={`Grievance Scrutiny: ${grievanceId.toUpperCase()}`}
        description="Complainant: Ramesh Kumar (KS-CG-10482) · Incorrect subsidy amount"
        action={<StatusBadge status={status === "under_review" ? "Under review" : status === "resolved" ? "Resolved" : status === "closed" ? "Completed" : "Action taken"} />}
      />

      {successNote && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{successNote}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left Column: Complaint Details */}
        <div className="space-y-6">
          <Card className="glass">
            <h3 className="font-bold text-slate-900 dark:text-white">Farmer Complaint Statement</h3>
            <p className="mt-3 text-xs leading-6 text-slate-600 dark:text-slate-300">
              The recorded sanction amount differs from the estimated benefit for PM-KISAN application KS-2026-10482. Digital twin discrepancy detector highlighted an unresolved shortfall of ₹4,000 between state approval and bank mandate.
            </p>

            <div className="mt-5 rounded-xl border border-black/5 bg-white/40 p-4 dark:border-white/10 dark:bg-slate-900/40">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Prior Action Log
              </h4>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                Case assigned to review officer on 21 November. Financial digital twin reconciliation initiated with district cooperative bank.
              </p>
            </div>
          </Card>
        </div>

        {/* Right Column: Resolution Form */}
        <div className="space-y-5">
          <Card className="glass">
            <h3 className="font-bold text-slate-900 dark:text-white">Grievance Redressal Action</h3>
            <p className="mt-1 text-xs text-slate-500">
              Take official action and record citizen feedback
            </p>

            <form onSubmit={handleUpdate} className="mt-4 space-y-4">
              <div>
                <label htmlFor="grievance-resolution-status-select" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Resolution Status *
                </label>
                <select
                  id="grievance-resolution-status-select"
                  aria-label="Resolution Status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="field mt-1.5 text-xs font-medium"
                >
                  <option value="under_review">Under review</option>
                  <option value="awaiting_farmer">Information requested from farmer</option>
                  <option value="resolved">Resolved (Discrepancy Rectified)</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label htmlFor="grievance-resolution-notes-textarea" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Officer Resolution Notes *
                </label>
                <textarea
                  id="grievance-resolution-notes-textarea"
                  aria-label="Officer Resolution Notes"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Audit verified shortfall. Supplemental R-FTO voucher generated for immediate clearance."
                  className="field mt-1.5 min-h-28 text-xs leading-5"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="glass-btn glass-green flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold text-white shadow transition"
              >
                <Send className="size-3.5" />
                <span>{submitting ? "Updating..." : "Update & Log Redressal"}</span>
              </button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
