"use client";

import { useEffect, useState } from "react";
import { FileClock, Search, ShieldCheck, Filter } from "lucide-react";
import { Card, PageHeading, StatusBadge } from "@/components/ui-kit";
import { getAuditLogs } from "@/lib/api";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getAuditLogs();
      setLogs(data);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = logs.filter((l) => {
    const matchesFilter = filter === "All" || l.action.includes(filter);
    const matchesSearch =
      l.user.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.resource.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <PageHeading
        title="Security & System Audit Ledger"
        description="Immutable forensic log of administrative determinations, policy modifications, and verification actions."
      />

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {["All", "POLICY", "DISCREPANCY", "CULTIVATOR"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  filter === f
                    ? "bg-[#166534] text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f === "All" ? "All Events" : f}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user, action, resource..."
              className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs outline-none focus:border-[#166534]"
            />
          </div>
        </div>
      </Card>

      {/* Audit Table */}
      <Card>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor Identity</th>
                <th>Action Type</th>
                <th>Target Resource</th>
                <th>IP Address</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50">
                  <td className="text-xs font-mono text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                  <td className="text-xs font-semibold text-slate-900">{log.user}</td>
                  <td>
                    <span className="font-mono text-[11px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      {log.action}
                    </span>
                  </td>
                  <td className="text-xs text-slate-600 font-mono">{log.resource}</td>
                  <td className="text-xs font-mono text-slate-400">{log.ip_address}</td>
                  <td>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                      <ShieldCheck className="size-3 text-emerald-600" />
                      {log.status}
                    </span>
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
