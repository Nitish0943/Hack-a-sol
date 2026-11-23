"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, CircleX, FileText, Eye, ShieldCheck } from "lucide-react";
import { Card, PageHeading, StatusBadge } from "@/components/ui-kit";

export default function VerificationDetailPage({
  params,
}: {
  params: Promise<{ verificationId: string }>;
}) {
  const { verificationId } = use(params);

  const [decision, setDecision] = useState<string | null>(null);
  const [remarks, setRemarks] = useState<string>("");
  const [status, setStatus] = useState<string>("Under review");
  const [showDocModal, setShowDocModal] = useState<boolean>(false);

  const handleDecision = (type: "verified" | "rejected") => {
    if (type === "verified") {
      setStatus("Verified");
      setDecision("Cultivator status successfully verified and updated in registry.");
    } else {
      setStatus("Rejected");
      setDecision("Cultivator declaration rejected due to insufficient evidence.");
    }
  };

  return (
    <div className="space-y-6">
      <Link
        href="/officer/verifications"
        className="glass glass-btn inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200"
      >
        <ArrowLeft className="size-3.5" />
        Back to Verifications
      </Link>

      <PageHeading
        title={`Verification Dossier: ${verificationId.toUpperCase()}`}
        description="Beneficiary: Savitri Bai (KS-CG-10483) · Sharecropper Classification"
        action={<StatusBadge status={status} />}
      />

      {decision && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{decision}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left Column: Declared Information & Evidence */}
        <div className="space-y-6">
          <Card className="glass">
            <h3 className="font-bold text-slate-900 dark:text-white">Declared Farming Information</h3>
            <div className="mt-4 grid grid-cols-2 gap-4 text-xs sm:grid-cols-3">
              <div className="glass rounded-xl p-3.5">
                <p className="text-[11px] text-slate-400">Declared Status</p>
                <p className="mt-1 font-bold text-slate-800 dark:text-slate-100">Sharecropper / Tenant</p>
              </div>
              <div className="glass rounded-xl p-3.5">
                <p className="text-[11px] text-slate-400">Cultivated Area</p>
                <p className="mt-1 font-bold text-slate-800 dark:text-slate-100">1.50 Acres</p>
              </div>
              <div className="glass rounded-xl p-3.5">
                <p className="text-[11px] text-slate-400">Notified Crop</p>
                <p className="mt-1 font-bold text-emerald-700 dark:text-emerald-400">Paddy (Kharif 2026)</p>
              </div>
            </div>
          </Card>

          <Card className="glass">
            <h3 className="font-bold text-slate-900 dark:text-white">Supporting Verification Proof</h3>
            <div className="mt-4 rounded-xl border border-black/5 bg-white/40 p-4 dark:border-white/10 dark:bg-slate-900/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="size-5 text-emerald-600" />
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Gram_Panchayat_Tenancy_Declaration.pdf
                    </p>
                    <p className="text-[11px] text-slate-400">Signed by Sarpanch & Village Patwari</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDocModal(true)}
                  className="glass glass-btn inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200"
                >
                  <Eye className="size-3.5" /> View Proof
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Decision Form */}
        <div className="space-y-5">
          <Card className="glass">
            <h3 className="font-bold text-slate-900 dark:text-white">Field Verification Decision</h3>
            <p className="mt-1 text-xs text-slate-500">
              Confirm cultivator eligibility based on local scrutiny
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="field-verification-notes-textarea" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Verification Notes
                </label>
                <textarea
                  id="field-verification-notes-textarea"
                  aria-label="Verification Notes"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Village visit conducted. Crop cultivation confirmed on site."
                  className="field mt-1.5 min-h-28 text-xs leading-5"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleDecision("verified")}
                  className="glass-btn glass-green flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold text-white shadow"
                >
                  <CheckCircle2 className="size-3.5" />
                  Approve Verification
                </button>
                <button
                  type="button"
                  onClick={() => handleDecision("rejected")}
                  className="glass glass-btn flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold text-rose-700 dark:text-rose-400"
                >
                  <CircleX className="size-3.5" />
                  Reject
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Doc Modal */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="glass w-full max-w-lg rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-black/5 pb-3 dark:border-white/10">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Gram Panchayat Tenancy Declaration
              </h4>
              <button
                onClick={() => setShowDocModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>
            <div className="mt-6 rounded-xl border border-black/5 bg-slate-50/50 p-8 text-center dark:border-white/10 dark:bg-slate-900/50">
              <ShieldCheck className="mx-auto size-12 text-emerald-600" />
              <p className="mt-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
                Panchayat Verified Cultivator Certificate
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Certified by Khamtarai Gram Sabha under Section 4(A) of Tenancy Guidelines.
              </p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDocModal(false)}
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
