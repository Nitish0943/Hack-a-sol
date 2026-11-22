"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle, FileText, Building2, Calendar, ShieldCheck, Clock, Check } from "lucide-react";
import { Card, PageHeading, StatusBadge } from "@/components/ui-kit";
import { getApplication, updateApplicationStatus } from "@/lib/api";

export default function OfficerApplicationDetailPage({ params }: { params: Promise<{ applicationId: string }> }) {
  const resolvedParams = use(params);
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState("");
  const [actionDone, setActionDone] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getApplication(resolvedParams.applicationId);
      setApp(data);
      setRemarks(data?.remarks || "");
      setLoading(false);
    }
    load();
  }, [resolvedParams.applicationId]);

  const handleUpdate = async (status: string) => {
    setSubmitting(true);
    await updateApplicationStatus(resolvedParams.applicationId, status, remarks);
    setApp((prev: any) => ({ ...prev, status, remarks }));
    setActionDone(`Application marked as ${status}`);
    setSubmitting(false);
    setTimeout(() => setActionDone(null), 4000);
  };

  if (loading || !app) {
    return <div className="py-12 text-center text-sm text-slate-500">Loading application dossier...</div>;
  }

  let timeline: any[] = [];
  try {
    timeline = typeof app.timeline_json === "string" ? JSON.parse(app.timeline_json) : (app.timeline_json || []);
  } catch (e) {
    timeline = [];
  }

  return (
    <div className="space-y-6">
      <Link
        href="/officer/applications"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="size-4" />
        Back to Applications Queue
      </Link>

      <PageHeading
        title={`Review Application: ${app.scheme_name}`}
        description={`Reference Number: ${app.reference_number} · Submitted on: ${app.submission_date} via ${app.channel}`}
        action={<StatusBadge status={app.status} />}
      />

      {actionDone && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <Check className="size-4 text-emerald-600" />
          {actionDone}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Dossier Overview */}
          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="size-4 text-[#166534]" />
              Submitted Application Credentials
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                <span className="text-[11px] text-slate-400">Applicant Farmer</span>
                <p className="mt-1 text-sm font-bold text-slate-900">Ramesh Kumar</p>
                <p className="text-[10px] text-slate-500">Farmer ID: KS-CG-10482 · Village: Khamtarai</p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                <span className="text-[11px] text-slate-400">Submission Channel</span>
                <p className="mt-1 text-sm font-bold text-slate-900">{app.channel}</p>
                <p className="text-[10px] text-slate-500">Submission Date: {app.submission_date}</p>
              </div>
            </div>

            {app.pending_action && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/80 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="size-5 shrink-0 text-amber-600" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-900">Pending Field / Revenue Action</h4>
                    <p className="mt-1 text-xs text-amber-800 leading-relaxed">{app.pending_action}</p>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Officer Verification Form */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Extension Officer Determination & Notes</h3>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter official examination remarks, land verification report findings, or document requests..."
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs outline-none focus:border-[#166534] leading-relaxed"
            />

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                disabled={submitting}
                onClick={() => handleUpdate("Approved")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
              >
                <CheckCircle2 className="size-4" />
                Approve Sanction
              </button>

              <button
                disabled={submitting}
                onClick={() => handleUpdate("Documents required")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
              >
                <AlertTriangle className="size-4" />
                Request Documents
              </button>

              <button
                disabled={submitting}
                onClick={() => handleUpdate("Rejected")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
              >
                <XCircle className="size-4" />
                Reject Application
              </button>
            </div>
          </Card>

          {/* Verification Timeline */}
          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="size-4 text-[#166534]" />
              Dossier Audit & Verification Trail
            </h3>

            <div className="space-y-4 pl-4 border-l-2 border-slate-200">
              {timeline.map((step: any, idx: number) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[21px] top-1 size-3 rounded-full bg-[#166534]" />
                  <p className="text-xs font-bold text-slate-900">{step.title}</p>
                  <p className="text-[11px] text-slate-500">{step.date} — {step.detail}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar Supporting Checks */}
        <div className="space-y-6">
          <Card className="p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <ShieldCheck className="size-4 text-[#166534]" />
              Automated Pre-Checks
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 text-emerald-900">
                <span>Revenue Bhuiyan Linked</span>
                <span className="font-bold">Pass</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 text-emerald-900">
                <span>Aadhaar-NPCI Mapped</span>
                <span className="font-bold">Pass</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 text-emerald-900">
                <span>Duplicate Claim Check</span>
                <span className="font-bold">Clear (0 Duplicate)</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
