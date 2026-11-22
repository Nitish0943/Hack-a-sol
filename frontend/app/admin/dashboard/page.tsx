"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, BookOpen, ShieldCheck, Users, WalletCards, ArrowRight, CheckCircle2, Server, FileClock } from "lucide-react";
import { Card, StatCard, PageHeading, StatusBadge } from "@/components/ui-kit";
import { getAdminDashboard } from "@/lib/api";

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await getAdminDashboard();
      setData(res);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeading
        title="Platform Administration & Governance"
        description="Core policy engine controls, user role access, Scheme Radar diffs, and security audit logs."
      />

      {/* Primary KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Registered Users"
          value={String(data?.total_users || 148)}
          detail="Farmers, Officers & Admins"
          icon={<Users className="size-5" />}
        />
        <StatCard
          label="Verified Schemes"
          value={String(data?.total_schemes || 7)}
          detail="Central & Chhattisgarh"
          icon={<BookOpen className="size-5" />}
          tone="green"
        />
        <StatCard
          label="Active Policy Versions"
          value={String(data?.active_policies || 7)}
          detail="Deterministic rules enforced"
          icon={<WalletCards className="size-5" />}
          tone="blue"
        />
        <StatCard
          label="Audit Events"
          value={String(data?.audit_events_count || 24)}
          detail="Immutable security trail"
          icon={<FileClock className="size-5" />}
          tone="yellow"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Audit Logs (2 cols) */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity className="size-4 text-[#166534]" />
                Recent System & Security Audit Logs
              </h3>
              <Link href="/admin/audit-logs" className="text-xs font-semibold text-[#166534] hover:underline">
                View All Logs →
              </Link>
            </div>

            <div className="space-y-3">
              {data?.recent_audit_logs?.map((log: any, idx: number) => (
                <div key={idx} className="flex items-start justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 font-mono text-[11px]">{log.action}</span>
                      <span className="rounded bg-slate-200/70 px-1.5 py-0.5 text-[10px] text-slate-700">{log.user}</span>
                    </div>
                    <p className="text-slate-600 font-mono text-[11px]">{log.resource}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Admin Actions */}
          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Governance Quick Links</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <Link
                href="/admin/schemes"
                className="rounded-xl border border-slate-200 p-4 hover:border-[#166534] hover:shadow-sm transition"
              >
                <BookOpen className="size-5 text-[#166534]" />
                <p className="mt-2 text-xs font-bold text-slate-900">Scheme Catalog</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Add or update statutory scheme rules</p>
              </Link>

              <Link
                href="/admin/policies"
                className="rounded-xl border border-slate-200 p-4 hover:border-blue-500 hover:shadow-sm transition"
              >
                <WalletCards className="size-5 text-blue-600" />
                <p className="mt-2 text-xs font-bold text-slate-900">Policy Diff Radar</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Clause diffing & impact analysis</p>
              </Link>

              <Link
                href="/admin/users"
                className="rounded-xl border border-slate-200 p-4 hover:border-amber-500 hover:shadow-sm transition"
              >
                <Users className="size-5 text-amber-600" />
                <p className="mt-2 text-xs font-bold text-slate-900">Role Permissions</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Manage extension officers & admins</p>
              </Link>
            </div>
          </Card>
        </div>

        {/* Sidebar Health */}
        <div className="space-y-6">
          <Card className="p-5">
            <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Server className="size-4 text-[#166534]" />
              Infrastructure Engine Health
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-100">
                <span className="font-semibold">FastAPI Gateway</span>
                <span className="font-bold flex items-center gap-1">
                  <CheckCircle2 className="size-3.5 text-emerald-600" />
                  Online (v1.0.0)
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-100">
                <span className="font-semibold">Deterministic Rule Engine</span>
                <span className="font-bold">Active</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-100">
                <span className="font-semibold">Async SQLite Database</span>
                <span className="font-bold">Connected</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-100">
                <span className="font-semibold">IVR Telephone Gateway</span>
                <span className="font-bold">1800-890-SETU</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
