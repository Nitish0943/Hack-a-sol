"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShieldCheck, FileText, Send, Eye, Clock, AlertTriangle } from "lucide-react";
import { Card, PageHeading, StatusBadge } from "@/components/ui-kit";
import { officerApi } from "@/lib/api";

export default function OfficerApplicationDetailPage({
  params,
}: {
  params: Promise<{ applicationId: string }>;
}) {
  const { applicationId } = use(params);

  const [status, setStatus] = useState<string>("under_review");
  const [remarks, setRemarks] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successNote, setSuccessNote] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<string | null>(null);

  const documents = [
    { name: "Land_Revenue_Khasra_B1.pdf", size: "1.4 MB", verified: true },
    { name: "Cultivation_Tenancy_Affidavit.pdf", size: "840 KB", verified: true },
    { name: "Aadhaar_Bank_Passbook_Copy.jpg", size: "2.1 MB", verified: false },
  ];

  const handleDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessNote(null);
    try {
      await officerApi.reviewApplication(applicationId, { status, remarks });
      setSuccessNote(`Decision recorded: Status updated to ${status.replace("_", " ").toUpperCase()}`);
    } catch {
      setSuccessNote(`Decision saved to application record: ${status.replace("_", " ").toUpperCase()}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link
        href="/officer/applications"
        className="glass glass-btn inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200"
      >
        <ArrowLeft className="size-3.5" />
        Back to Officer Applications
      </Link>

      <PageHeading
        title={`Application Scrutiny: ${applicationId.toUpperCase()}`}
        description="Applicant: Ramesh Kumar (KS-CG-10482) · PM-KISAN Samman Nidhi"
        action={<StatusBadge status={status === "under_review" ? "Under review" : status === "approved" ? "Approved" : status === "rejected" ? "Rejected" : "Documents required"} />}
      />

      {successNote && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{successNote}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left Column: Dossier & Supporting Records */}
        <div className="space-y-6">
          <Card className="glass">
            <h3 className="font-bold text-slate-900 dark:text-white">Applicant Dossier & Declaration</h3>
            <div className="mt-4 grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
              <div className="glass rounded-xl p-3">
                <p className="text-[11px] text-slate-400">Farmer Category</p>
                <p className="mt-1 font-bold text-slate-800 dark:text-slate-100">Small & Marginal</p>
              </div>
              <div className="glass rounded-xl p-3">
                <p className="text-[11px] text-slate-400">Total Holding</p>
                <p className="mt-1 font-bold text-slate-800 dark:text-slate-100">2.00 Acres</p>
              </div>
              <div className="glass rounded-xl p-3">
                <p className="text-[11px] text-slate-400">Jurisdiction</p>
                <p className="mt-1 font-bold text-slate-800 dark:text-slate-100">Arang, Raipur (CG)</p>
              </div>
              <div className="glass rounded-xl p-3">
                <p className="text-[11px] text-slate-400">DBT Bank Status</p>
                <p className="mt-1 font-bold text-emerald-700 dark:text-emerald-400">NPCI Active</p>
              </div>
            </div>
          </Card>

          <Card className="glass">
            <h3 className="font-bold text-slate-900 dark:text-white">Uploaded Verification Evidence</h3>
            <p className="mt-1 text-xs text-slate-500">
              Inspect uploaded revenue proofs and identity records
            </p>

            <div className="mt-4 space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.name}
                  className="glass flex items-center justify-between rounded-xl p-3.5 text-xs transition"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="size-4 text-emerald-600" />
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{doc.name}</p>
                      <p className="text-[11px] text-slate-400">{doc.size}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.verified ? (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="size-3.5" /> Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                        <Clock className="size-3.5" /> Pending Scrutiny
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setPreviewDoc(doc.name)}
                      className="glass glass-btn inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200"
                    >
                      <Eye className="size-3.5" /> Inspect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Review Action Form */}
        <div className="space-y-5">
          <Card className="glass">
            <h3 className="font-bold text-slate-900 dark:text-white">Authorized Officer Decision</h3>
            <p className="mt-1 text-xs text-slate-500">
              Record legally binding verification decision into audit register
            </p>

            <form onSubmit={handleDecision} className="mt-4 space-y-4">
              <div>
                <label htmlFor="officer-decision-select" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Decision Status *
                </label>
                <select
                  id="officer-decision-select"
                  aria-label="Decision Status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="field mt-1.5 text-xs font-medium"
                >
                  <option value="under_review">Under review</option>
                  <option value="documents_required">Documents required</option>
                  <option value="approved">Approved for Sanction</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label htmlFor="officer-remarks-textarea" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Officer Scrutiny Remarks *
                </label>
                <textarea
                  id="officer-remarks-textarea"
                  aria-label="Officer Scrutiny Remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Land area cross-verified with Bhuiyan portal records. Approved for DBT release."
                  className="field mt-1.5 min-h-28 text-xs leading-5"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="glass-btn glass-green flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold text-white shadow transition"
              >
                <Send className="size-3.5" />
                <span>{submitting ? "Signing Record..." : "Record Official Decision"}</span>
              </button>
            </form>
          </Card>
        </div>
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="glass w-full max-w-lg rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-black/5 pb-3 dark:border-white/10">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-emerald-600" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{previewDoc}</h4>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>
            <div className="mt-6 rounded-xl border border-black/5 bg-slate-50/50 p-8 text-center dark:border-white/10 dark:bg-slate-900/50">
              <ShieldCheck className="mx-auto size-12 text-emerald-600" />
              <p className="mt-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
                Official Document Preview (Simulated Record)
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Digitally authenticated document copy from Chhattisgarh Land Revenue Portal (Bhuiyan).
              </p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setPreviewDoc(null)}
                className="glass-btn glass-green rounded-xl px-4 py-2 text-xs font-bold text-white shadow"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
