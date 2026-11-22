"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, MapPinned, FileText, CheckCircle2, XCircle, AlertCircle, ShieldCheck, Check } from "lucide-react";
import { Card, PageHeading, StatusBadge } from "@/components/ui-kit";
import { getVerification, reviewVerification } from "@/lib/api";

export default function OfficerVerificationDetailPage({ params }: { params: Promise<{ verificationId: string }> }) {
  const resolvedParams = use(params);
  const [v, setV] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("Pending");
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getVerification(resolvedParams.verificationId);
      setV(data);
      setStatus(data?.status || "Pending");
      setNotes(data?.officer_notes || "");
      setLoading(false);
    }
    load();
  }, [resolvedParams.verificationId]);

  const handleReview = async (newStatus: string) => {
    setSubmitting(true);
    setStatus(newStatus);
    await reviewVerification(resolvedParams.verificationId, newStatus, notes);
    setV((prev: any) => ({ ...prev, status: newStatus, officer_notes: notes }));
    setSaved(true);
    setSubmitting(false);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading || !v) {
    return <div className="py-12 text-center text-sm text-slate-500">Loading cultivator verification dossier...</div>;
  }

  return (
    <div className="space-y-6">
      <Link
        href="/officer/verifications"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="size-4" />
        Back to Verifications Queue
      </Link>

      <PageHeading
        title={`Cultivator Verification: ${v.farmer_name}`}
        description={`Cultivator Type: ${v.cultivator_type} · Village: ${v.village} · ID: ${v.farmer_id_code}`}
        action={<StatusBadge status={v.status} />}
      />

      {saved && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <Check className="size-4 text-emerald-600" />
          Cultivator identity verification determination saved successfully!
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Declaration Statement */}
          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <FileText className="size-4 text-purple-700" />
              Cultivator Self-Declaration & Arrangement Details
            </h3>

            <p className="rounded-xl border border-purple-100 bg-purple-50/40 p-4 text-xs text-purple-950 font-medium leading-relaxed">
              &ldquo;{v.declaration_text}&rdquo;
            </p>

            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-[#166534]" />
                <span className="font-semibold text-slate-800">Attached Evidence:</span>
                <span className="text-slate-600 font-mono">{v.evidence_document_name}</span>
              </div>
              <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                Panchayat Attested
              </span>
            </div>
          </Card>

          {/* Extension Officer Endorsement Form */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Agriculture Extension Officer Endorsement</h3>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record field inspection notes, Sarpanch verification, or reason for rejection..."
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs outline-none focus:border-[#166534] leading-relaxed"
            />

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                disabled={submitting}
                onClick={() => handleReview("Approved")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-purple-700 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-purple-800 disabled:opacity-50"
              >
                <CheckCircle2 className="size-4" />
                Endorse Cultivator Identity (Approve)
              </button>

              <button
                disabled={submitting}
                onClick={() => handleReview("Scheduled Inspection")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100 disabled:opacity-50"
              >
                <MapPinned className="size-4" />
                Schedule Field Inspection
              </button>

              <button
                disabled={submitting}
                onClick={() => handleReview("Rejected")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
              >
                <XCircle className="size-4" />
                Reject Declaration
              </button>
            </div>
          </Card>
        </div>

        {/* Sidebar Context */}
        <div className="space-y-6">
          <Card className="p-5 border-l-4 border-l-purple-600 bg-purple-50/20">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-950 mb-2">
              Agrarian Legal Framework
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed">
              Under Section 165 of the CG Land Revenue Code and the revised 2026 agricultural guidelines, genuine cultivators are entitled to agricultural input subsidies (RGKNY) and crop insurance (PMFBY) irrespective of title deeds, provided active cultivation is verified.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
