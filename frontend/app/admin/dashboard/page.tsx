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
          tone="green"
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
          <div className="glass-panel p-6 space-y-4 border border-white/10">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2 font-display">
                <Activity className="size-4.5 text-emerald-400" />
                Recent System & Security Audit Logs
              </h3>
              <Link href="/admin/audit-logs" className="text-xs font-bold text-emerald-400 hover:underline">
                View All Logs →
              </Link>
            </div>

            <div className="space-y-3">
              {data?.recent_audit_logs?.map((log: any, idx: number) => (
                <div key={idx} className="flex items-start justify-between rounded-xl border border-white/10 bg-white/[0.02] p-3.5 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white font-mono text-[11px]">{log.action}</span>
                      <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-slate-300 font-mono">{log.user}</span>
                    </div>
                    <p className="text-slate-400 font-mono text-[11px]">{log.resource}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono shrink-0">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Admin Actions */}
          <div className="glass-panel p-6 space-y-4 border border-white/10">
            <h3 className="text-base font-bold text-white font-display">Governance Quick Links</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <Link
                href="/admin/schemes"
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:border-emerald-500/40 hover:bg-emerald-500/10 transition"
              >
                <BookOpen className="size-5 text-emerald-400" />
                <p className="mt-2 text-xs font-bold text-white font-display">Scheme Catalog</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Add or update statutory scheme rules</p>
              </Link>

              <Link
                href="/admin/policies"
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:border-cyan-500/40 hover:bg-cyan-500/10 transition"
              >
                <WalletCards className="size-5 text-cyan-400" />
                <p className="mt-2 text-xs font-bold text-white font-display">Policy Diff Radar</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Clause diffing & impact analysis</p>
              </Link>

              <Link
                href="/admin/users"
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:border-amber-500/40 hover:bg-amber-500/10 transition"
              >
                <Users className="size-5 text-amber-400" />
                <p className="mt-2 text-xs font-bold text-white font-display">Role Permissions</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Manage extension officers & admins</p>
              </Link>
            </div>
          </div>
        </div>

        {/* Sidebar Health */}
        <div className="space-y-6">
          <div className="glass-panel p-6 space-y-4 border border-white/10">
            <h4 className="text-base font-bold text-white flex items-center gap-2 font-display">
              <Server className="size-4.5 text-emerald-400" />
              Engine Infrastructure Health
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
                <span className="font-semibold">FastAPI Gateway</span>
                <span className="font-bold flex items-center gap-1 font-mono">
                  <CheckCircle2 className="size-3.5 text-emerald-400" />
                  Online (v1.0.0)
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
                <span className="font-semibold">Deterministic Rule Engine</span>
                <span className="font-bold font-mono">Active</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
                <span className="font-semibold">Async SQLite Database</span>
                <span className="font-bold font-mono">Connected</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/25">
                <span className="font-semibold">IVR Telephone Gateway</span>
                <span className="font-bold font-mono">1800-890-SETU</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
