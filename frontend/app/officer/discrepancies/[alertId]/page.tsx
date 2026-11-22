"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, ShieldCheck, CheckCircle2, BookOpen, User, Scale, Check } from "lucide-react";
import { Card, PageHeading, StatusBadge } from "@/components/ui-kit";
import { getDiscrepancy, reviewDiscrepancy } from "@/lib/api";

export default function OfficerDiscrepancyDetailPage({ params }: { params: Promise<{ alertId: string }> }) {
  const resolvedParams = use(params);
  const [alert, setAlert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("Investigating");
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getDiscrepancy(resolvedParams.alertId);
      setAlert(data);
      setStatus(data?.status || "Investigating");
      setNotes(data?.officer_notes || "");
      setLoading(false);
    }
    load();
  }, [resolvedParams.alertId]);

  const handleSave = async (newStatus: string) => {
    setSubmitting(true);
    setStatus(newStatus);
    await reviewDiscrepancy(resolvedParams.alertId, newStatus, notes);
    setAlert((prev: any) => ({ ...prev, status: newStatus, officer_notes: notes }));
    setSaved(true);
    setSubmitting(false);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading || !alert) {
    return <div className="py-12 text-center text-sm text-slate-500">Loading discrepancy investigation workbench...</div>;
  }

  return (
    <div className="space-y-6">
      <Link
        href="/officer/discrepancies"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="size-4" />
        Back to Discrepancies Queue
      </Link>

      <PageHeading
        title={`Audit Investigation: ${alert.alert_type}`}
        description={`Cultivator: ${alert.farmer_name} (${alert.farmer_id_code}) · Scheme: ${alert.scheme_name}`}
        action={<StatusBadge status={alert.status} />}
      />

      {saved && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <Check className="size-4 text-emerald-600" />
          Discrepancy review and determination updated successfully!
        </div>
      )}

      {/* Discrepancy Amount Card */}
      <Card className="p-6 border-l-4 border-l-red-500 bg-red-50/20">
        <div className="grid gap-4 sm:grid-cols-3 text-center">
          <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-100">
            <span className="text-xs font-semibold text-slate-500">Policy Entitlement Amount</span>
            <p className="mt-1 text-2xl font-bold text-emerald-700">₹{alert.expected_amount.toLocaleString()}</p>
            <p className="mt-1 text-[11px] text-slate-400">Calculated by Eligibility Engine</p>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-100">
            <span className="text-xs font-semibold text-slate-500">Official Sanction Order</span>
            <p className="mt-1 text-2xl font-bold text-slate-800">₹{alert.actual_amount.toLocaleString()}</p>
            <p className="mt-1 text-[11px] text-slate-400">Issued by Department Desk</p>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm border border-red-200">
            <span className="text-xs font-semibold text-red-600">Unaccounted Variance Gap</span>
            <p className="mt-1 text-2xl font-bold text-red-600">-₹{alert.difference.toLocaleString()}</p>
            <p className="mt-1 text-[11px] text-red-500 font-semibold">Variance of {Math.round((alert.difference / alert.expected_amount) * 100)}%</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Explanation & Clause Reference */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Scale className="size-4 text-amber-600" />
              Automated Forensic Analysis
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
              {alert.explanation}
            </p>

            <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-950">
                <BookOpen className="size-4 text-blue-700" />
                <span>Statutory Policy Authority: {alert.policy_clause}</span>
              </div>
              <p className="text-[11px] text-blue-800">Enforced Version: {alert.policy_version} · Verified by State Agriculture Directorate</p>
            </div>
          </Card>

          {/* Officer Investigation Form */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Officer Investigation Findings & Action</h3>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record findings from CCE yield survey, bank branch inquiry, or issue rectification directive..."
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs outline-none focus:border-[#166534] leading-relaxed"
            />

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                disabled={submitting}
                onClick={() => handleSave("Investigating")}
                className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 disabled:opacity-50"
              >
                Mark as Investigating
              </button>

              <button
                disabled={submitting}
                onClick={() => handleSave("Resolved")}
                className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
              >
                Issue Rectification Order (Resolved)
              </button>

              <button
                disabled={submitting}
                onClick={() => handleSave("Dismissed")}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Dismiss with Reason
              </button>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <User className="size-4 text-[#166534]" />
              Beneficiary Dossier
            </h4>
            <div className="space-y-2 text-xs">
              <p className="font-bold text-slate-900">{alert.farmer_name}</p>
              <p className="text-slate-500">Farmer Code: {alert.farmer_id_code}</p>
              <p className="text-slate-500">Village: Khamtarai, Dharsiwa</p>
              <div className="pt-2">
                <Link
                  href={`/officer/farmers/${alert.farmer_id}`}
                  className="text-xs font-semibold text-[#166534] hover:underline"
                >
                  View Complete Cultivator Profile →
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
