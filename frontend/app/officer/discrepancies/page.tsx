"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Search, Filter, ArrowRight, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Card, PageHeading, StatusBadge } from "@/components/ui-kit";
import { getDiscrepancies } from "@/lib/api";

export default function OfficerDiscrepanciesPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getDiscrepancies(filter);
      setAlerts(data);
      setLoading(false);
    }
    load();
  }, [filter]);

  const filtered = alerts.filter((a) => {
    const matchesFilter = filter === "All" || a.status === filter;
    const matchesSearch =
      a.farmer_name.toLowerCase().includes(search.toLowerCase()) ||
      a.scheme_name.toLowerCase().includes(search.toLowerCase()) ||
      a.alert_type.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <PageHeading
        title="Policy-to-Payment Discrepancy Workbench"
        description="Continuous automated audit detecting variance between policy entitlement guidelines and official sanction orders."
      />

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {["All", "Pending", "Investigating", "Resolved"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  filter === s
                    ? "bg-amber-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search farmer or scheme..."
              className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs outline-none focus:border-[#166534]"
            />
          </div>
        </div>
      </Card>

      {/* Discrepancies Table */}
      <Card>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Cultivator</th>
                <th>Scheme</th>
                <th>Discrepancy Type</th>
                <th>Severity</th>
                <th>Expected vs Sanctioned</th>
                <th>Variance Gap</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((alert) => (
                <tr key={alert.id} className="hover:bg-slate-50/50">
                  <td className="font-semibold text-slate-900">
                    <p>{alert.farmer_name}</p>
                    <p className="text-[10px] font-mono text-slate-400">{alert.farmer_id_code}</p>
                  </td>
                  <td className="text-slate-800">{alert.scheme_name}</td>
                  <td className="text-xs font-medium text-slate-700">{alert.alert_type}</td>
                  <td>
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                        alert.severity === "High"
                          ? "bg-red-100 text-red-800"
                          : alert.severity === "Medium"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </td>
                  <td className="text-xs">
                    <span className="text-emerald-700 font-bold">₹{alert.expected_amount.toLocaleString()}</span>
                    <span className="text-slate-400"> vs </span>
                    <span className="text-slate-900 font-medium">₹{alert.actual_amount.toLocaleString()}</span>
                  </td>
                  <td className="text-xs font-bold text-red-600">-₹{alert.difference.toLocaleString()}</td>
                  <td>
                    <StatusBadge status={alert.status} />
                  </td>
                  <td>
                    <Link
                      href={`/officer/discrepancies/${alert.id}`}
                      className="inline-flex items-center gap-1 font-semibold text-amber-700 hover:underline text-xs"
                    >
                      Investigate
                      <ArrowRight className="size-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
