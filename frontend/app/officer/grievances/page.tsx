"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquareWarning, Search, Filter, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { Card, PageHeading, StatusBadge } from "@/components/ui-kit";
import { getGrievances } from "@/lib/api";

export default function OfficerGrievancesPage() {
  const [grievances, setGrievances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getGrievances(filter);
      setGrievances(data);
      setLoading(false);
    }
    load();
  }, [filter]);

  const filtered = grievances.filter((g) => {
    const matchesFilter = filter === "All" || g.status === filter;
    const matchesSearch =
      g.scheme_name.toLowerCase().includes(search.toLowerCase()) ||
      g.reference_number.toLowerCase().includes(search.toLowerCase()) ||
      g.category.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <PageHeading
        title="Grievance Investigation & Redressal Desk"
        description="Statutory citizen charter monitoring of farmer entitlement complaints and sanction disputes."
      />

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {["All", "Under review", "Resolved"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  filter === s
                    ? "bg-red-600 text-white shadow-sm"
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
              placeholder="Search ticket or scheme..."
              className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs outline-none focus:border-[#166534]"
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Ticket Ref</th>
                <th>Scheme</th>
                <th>Category</th>
                <th>Registered</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((g) => (
                <tr key={g.id} className="hover:bg-slate-50/50">
                  <td className="font-mono text-xs font-bold text-red-600">{g.reference_number}</td>
                  <td className="font-semibold text-slate-900">{g.scheme_name}</td>
                  <td className="text-xs text-slate-700">{g.category}</td>
                  <td className="text-xs text-slate-500">{g.created_at}</td>
                  <td>
                    <StatusBadge status={g.status} />
                  </td>
                  <td>
                    <Link
                      href={`/officer/grievances/${g.id}`}
                      className="inline-flex items-center gap-1 font-semibold text-red-700 hover:underline text-xs"
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
