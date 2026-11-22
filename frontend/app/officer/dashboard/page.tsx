"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ClipboardCheck, IndianRupee, MessageSquareWarning, Users, MapPinned, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Card, StatCard, PageHeading, StatusBadge } from "@/components/ui-kit";
import { getOfficerDashboard } from "@/lib/api";

export default function OfficerDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await getOfficerDashboard();
      setData(res);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeading
        title="Extension Officer Operational Desk"
        description={`Jurisdiction: Raipur District (Dharsiwa & Arang Blocks) · Officer: ${data?.officer_name || "Anita Verma (RAEO)"}`}
      />

      {/* Primary Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Registered Cultivators"
          value={String(data?.total_farmers_count || 48)}
          detail="AgriStack linked profiles"
          icon={<Users className="size-5" />}
        />
        <StatCard
          label="Pending Applications"
          value={String(data?.pending_applications_count || 12)}
          detail="Requires field verification"
          icon={<ClipboardCheck className="size-5" />}
          tone="blue"
        />
        <StatCard
          label="Policy Discrepancies"
          value={String(data?.active_discrepancies_count || 4)}
          detail="Sanction variance flagged"
          icon={<AlertTriangle className="size-5" />}
          tone="yellow"
        />
        <StatCard
          label="Open Grievances"
          value={String(data?.open_grievances_count || 6)}
          detail="Within 15-day SLA"
          icon={<MessageSquareWarning className="size-5" />}
        />
      </div>

      {/* Priority Action Alerts Banner */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="size-4 text-amber-600" />
            Priority Action Required (Field Discrepancies & Verifications)
          </h3>
          <span className="text-xs text-slate-500">Auto-audited by Policy-to-Payment Engine</span>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {data?.priority_alerts?.map((alert: any) => (
            <Card key={alert.id} className="p-4 border-l-4 border-l-amber-500 bg-amber-50/30">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-950">{alert.title}</span>
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                      {alert.severity} Priority
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-amber-900 leading-relaxed">{alert.detail}</p>
                </div>
                <Link
                  href={alert.link}
                  className="inline-flex items-center gap-1 shrink-0 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-amber-700"
                >
                  Review
                  <ArrowRight className="size-3" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Two Column Grid: Scheme Distribution & Cultivator Identity Queue */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Benefit Distribution by Scheme</h3>
          <div className="space-y-4">
            {data?.scheme_distribution?.map((sch: any) => (
              <div key={sch.name} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-800 font-semibold">{sch.name}</span>
                  <span className="text-slate-500">
                    {sch.count} Beneficiaries · <b className="text-slate-900">{sch.amount}</b>
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-[#166534]"
                    style={{ width: `${Math.min(100, (sch.count / 35) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Workbenches */}
        <Card className="p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Quick Workbenches</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/officer/verifications"
              className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 transition hover:border-[#166534] hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <MapPinned className="size-5 text-[#166534]" />
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  {data?.pending_verifications_count || 5} Pending
                </span>
              </div>
              <p className="mt-3 text-xs font-bold text-slate-900">Cultivator Identity Bridge</p>
              <p className="mt-1 text-[11px] text-slate-500">Review tenant & sharecropper declarations</p>
            </Link>

            <Link
              href="/officer/discrepancies"
              className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 transition hover:border-amber-500 hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <AlertTriangle className="size-5 text-amber-600" />
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                  {data?.active_discrepancies_count || 4} Alerts
                </span>
              </div>
              <p className="mt-3 text-xs font-bold text-slate-900">Policy-to-Payment Engine</p>
              <p className="mt-1 text-[11px] text-slate-500">Investigate sanction vs entitlement gaps</p>
            </Link>

            <Link
              href="/officer/applications"
              className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-500 hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <ClipboardCheck className="size-5 text-blue-600" />
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                  {data?.pending_applications_count || 12} Waiting
                </span>
              </div>
              <p className="mt-3 text-xs font-bold text-slate-900">Application Approvals</p>
              <p className="mt-1 text-[11px] text-slate-500">Approve or request revenue documents</p>
            </Link>

            <Link
              href="/officer/grievances"
              className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 transition hover:border-red-500 hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <MessageSquareWarning className="size-5 text-red-600" />
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-800">
                  {data?.open_grievances_count || 6} Open
                </span>
              </div>
              <p className="mt-3 text-xs font-bold text-slate-900">Grievance Investigation</p>
              <p className="mt-1 text-[11px] text-slate-500">Resolve citizen charter complaints</p>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
