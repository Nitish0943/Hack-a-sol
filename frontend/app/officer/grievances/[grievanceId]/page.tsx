"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquareWarning, CheckCircle2, User, ShieldCheck, Check } from "lucide-react";
import { Card, PageHeading, StatusBadge } from "@/components/ui-kit";
import { getGrievance, resolveGrievance } from "@/lib/api";

export default function OfficerGrievanceDetailPage({ params }: { params: Promise<{ grievanceId: string }> }) {
  const resolvedParams = use(params);
  const [grv, setGrv] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resolution, setResolution] = useState("");
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getGrievance(resolvedParams.grievanceId);
      setGrv(data);
      setResolution(data?.officer_resolution || "");
      setLoading(false);
    }
    load();
  }, [resolvedParams.grievanceId]);

  const handleResolve = async (status: string) => {
    if (!resolution.trim()) return;
    setSubmitting(true);
    await resolveGrievance(resolvedParams.grievanceId, resolution, status);
    setGrv((prev: any) => ({ ...prev, status, officer_resolution: resolution, resolution_date: "Today" }));
    setSaved(true);
    setSubmitting(false);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading || !grv) {
    return <div className="py-12 text-center text-sm text-slate-500">Loading grievance case...</div>;
  }

  return (
    <div className="space-y-6">
      <Link
        href="/officer/grievances"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="size-4" />
        Back to Grievances Queue
      </Link>

      <PageHeading
        title={`Grievance Case: ${grv.reference_number}`}
        description={`Scheme: ${grv.scheme_name} · Category: ${grv.category} · Registered on: ${grv.created_at}`}
        action={<StatusBadge status={grv.status} />}
      />

      {saved && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <Check className="size-4 text-emerald-600" />
          Official grievance resolution order recorded successfully!
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Farmer's Complaint Statement */}
          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <MessageSquareWarning className="size-4 text-red-600" />
              Farmer Dispute & Complaint Statement
            </h3>
            <p className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs font-medium text-slate-800 leading-relaxed">
              {grv.description}
            </p>
          </Card>

          {/* Resolution Input */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Official Redressal Resolution</h3>
            <textarea
              rows={4}
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="Record official inquiry details, banking coordination notes, or department rectification order..."
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs outline-none focus:border-[#166534] leading-relaxed"
            />

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                disabled={submitting || !resolution.trim()}
                onClick={() => handleResolve("Resolved")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
              >
                <CheckCircle2 className="size-4" />
                Issue Resolution (Mark Resolved)
              </button>

              <button
                disabled={submitting || !resolution.trim()}
                onClick={() => handleResolve("Under review")}
                className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100 disabled:opacity-50"
              >
                Update Investigation Notes
              </button>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-5 border-l-4 border-l-red-500 bg-red-50/20">
            <h4 className="text-xs font-bold uppercase tracking-wider text-red-950 mb-2">
              Citizen Charter SLA Notice
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed">
              Under Chhattisgarh Public Service Delivery Guarantee, agricultural entitlement disputes must be resolved within 15 working days.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
