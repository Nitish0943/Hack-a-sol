"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ClipboardCheck, IndianRupee, MessageSquareWarning, Users, MapPinned, ArrowRight, ShieldCheck, CheckCircle2, Activity } from "lucide-react";
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
          tone="green"
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
          tone="red"
        />
      </div>

      {/* Priority Action Alerts Banner */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 font-display">
            <AlertTriangle className="size-4 text-amber-400" />
            Priority Action Required (Field Discrepancies & Verifications)
          </h3>
          <span className="text-xs text-slate-400 font-mono">Auto-audited by Policy-to-Payment Engine</span>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {data?.priority_alerts?.map((alert: any) => (
            <div key={alert.id} className="glass-card p-5 border-l-4 border-l-amber-400 bg-amber-500/10">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white font-display">{alert.title}</span>
                    <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-300 border border-amber-500/30">
                      {alert.severity} Priority
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{alert.detail}</p>
                </div>
                <Link
                  href={alert.link}
                  className="inline-flex items-center gap-1 shrink-0 rounded-xl bg-amber-500 hover:bg-amber-400 px-3.5 py-1.5 text-xs font-bold text-slate-950 shadow-sm transition"
                >
                  <span>Review</span>
                  <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Grid: Scheme Distribution & Quick Workbenches */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-panel p-6 space-y-4 border border-white/10">
          <h3 className="text-base font-bold text-white font-display">Benefit Distribution by Scheme</h3>
          <div className="space-y-4">
            {data?.scheme_distribution?.map((sch: any) => (
              <div key={sch.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-200">{sch.name}</span>
                  <span className="text-slate-400 font-mono">
                    {sch.count} Beneficiaries · <b className="text-emerald-400">{sch.amount}</b>
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399]"
                    style={{ width: `${Math.min(100, (sch.count / 35) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Workbenches */}
        <div className="glass-panel p-6 space-y-4 border border-white/10">
          <h3 className="text-base font-bold text-white font-display">Operational Workbenches</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/officer/verifications"
              className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-purple-500/40 hover:bg-purple-500/10"
            >
              <div className="flex items-center justify-between">
                <MapPinned className="size-5 text-purple-400" />
                <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-purple-300 border border-purple-500/30">
                  {data?.pending_verifications_count || 5} Pending
                </span>
              </div>
              <p className="mt-3 text-xs font-bold text-white font-display">Cultivator Identity Bridge</p>
              <p className="mt-0.5 text-[11px] text-slate-400">Review tenant & sharecropper declarations</p>
            </Link>

            <Link
              href="/officer/discrepancies"
              className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-amber-500/40 hover:bg-amber-500/10"
            >
              <div className="flex items-center justify-between">
                <AlertTriangle className="size-5 text-amber-400" />
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-300 border border-amber-500/30">
                  {data?.active_discrepancies_count || 4} Alerts
                </span>
              </div>
              <p className="mt-3 text-xs font-bold text-white font-display">Policy-to-Payment Engine</p>
              <p className="mt-0.5 text-[11px] text-slate-400">Investigate sanction vs entitlement gaps</p>
            </Link>

            <Link
              href="/officer/applications"
              className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-cyan-500/40 hover:bg-cyan-500/10"
            >
              <div className="flex items-center justify-between">
                <ClipboardCheck className="size-5 text-cyan-400" />
                <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-cyan-300 border border-cyan-500/30">
                  {data?.pending_applications_count || 12} Waiting
                </span>
              </div>
              <p className="mt-3 text-xs font-bold text-white font-display">Application Approvals</p>
              <p className="mt-0.5 text-[11px] text-slate-400">Approve or request revenue documents</p>
            </Link>

            <Link
              href="/officer/grievances"
              className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-rose-500/40 hover:bg-rose-500/10"
            >
              <div className="flex items-center justify-between">
                <MessageSquareWarning className="size-5 text-rose-400" />
                <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-rose-300 border border-rose-500/30">
                  {data?.open_grievances_count || 6} Open
                </span>
              </div>
              <p className="mt-3 text-xs font-bold text-white font-display">Grievance Investigation</p>
              <p className="mt-0.5 text-[11px] text-slate-400">Resolve citizen charter complaints</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
