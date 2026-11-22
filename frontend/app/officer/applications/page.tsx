"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClipboardCheck, Search, Filter, ArrowRight, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { Card, PageHeading, StatusBadge } from "@/components/ui-kit";
import { getApplications } from "@/lib/api";

export default function OfficerApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getApplications(filter);
      setApplications(data);
      setLoading(false);
    }
    load();
  }, [filter]);

  const filtered = applications.filter((app) => {
    const matchesFilter = filter === "All" || app.status === filter;
    const matchesSearch =
      app.scheme_name.toLowerCase().includes(search.toLowerCase()) ||
      app.reference_number.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <PageHeading
        title="Application Review & Approval Queue"
        description="Verify farmer eligibility dossiers, inspect revenue deeds, and process sanction approvals."
      />

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {["All", "Under review", "Approved", "Documents required"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  filter === s
                    ? "bg-[#166534] text-white shadow-sm"
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
              placeholder="Search scheme or ref..."
              className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs outline-none focus:border-[#166534]"
            />
          </div>
        </div>
      </Card>

      {/* Queue Table */}
      <Card>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Scheme</th>
                <th>Reference No.</th>
                <th>Submission Date</th>
                <th>Channel</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/50">
                  <td className="font-semibold text-slate-900">{app.scheme_name}</td>
                  <td className="font-mono text-xs font-medium text-slate-700">{app.reference_number}</td>
                  <td className="text-slate-600">{app.submission_date}</td>
                  <td className="text-slate-600">{app.channel}</td>
                  <td>
                    <StatusBadge status={app.status} />
                  </td>
                  <td>
                    <Link
                      href={`/officer/applications/${app.id}`}
                      className="inline-flex items-center gap-1 font-semibold text-[#166534] hover:underline text-xs"
                    >
                      Inspect & Review
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
