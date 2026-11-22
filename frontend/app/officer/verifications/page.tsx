"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPinned, Search, Filter, ArrowRight, ShieldCheck, CheckCircle2, FileText, AlertCircle } from "lucide-react";
import { Card, PageHeading, StatusBadge } from "@/components/ui-kit";
import { getVerifications } from "@/lib/api";

export default function OfficerVerificationsPage() {
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getVerifications(filter);
      setVerifications(data);
      setLoading(false);
    }
    load();
  }, [filter]);

  const filtered = verifications.filter((v) => {
    const matchesFilter = filter === "All" || v.status === filter;
    const matchesSearch =
      v.farmer_name.toLowerCase().includes(search.toLowerCase()) ||
      v.village.toLowerCase().includes(search.toLowerCase()) ||
      v.cultivator_type.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <PageHeading
        title="Cultivator Identity Bridge: Verification Queue"
        description="Verify non-titleholder cultivators (tenant farmers, oral lessees, sharecroppers) for scheme eligibility endorsement."
      />

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {["All", "Pending", "Approved", "Rejected"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  filter === s
                    ? "bg-purple-700 text-white shadow-sm"
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
              placeholder="Search cultivator or village..."
              className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs outline-none focus:border-[#166534]"
            />
          </div>
        </div>
      </Card>

      {/* Verifications Table */}
      <Card>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Cultivator</th>
                <th>Village</th>
                <th>Cultivator Arrangement</th>
                <th>Evidence Document</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/50">
                  <td className="font-semibold text-slate-900">
                    <p>{v.farmer_name}</p>
                    <p className="text-[10px] font-mono text-slate-400">{v.farmer_id_code}</p>
                  </td>
                  <td className="text-xs text-slate-700">{v.village}</td>
                  <td>
                    <span className="inline-block rounded bg-purple-100 px-2 py-0.5 text-[11px] font-semibold text-purple-800">
                      {v.cultivator_type}
                    </span>
                  </td>
                  <td className="text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <FileText className="size-3.5 text-[#166534]" />
                      <span>{v.evidence_document_name}</span>
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={v.status} />
                  </td>
                  <td>
                    <Link
                      href={`/officer/verifications/${v.id}`}
                      className="inline-flex items-center gap-1 font-semibold text-purple-700 hover:underline text-xs"
                    >
                      Review & Endorse
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
