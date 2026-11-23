"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Filter, ArrowRight, AlertCircle, ShieldAlert, CheckCircle2, Clock } from "lucide-react";
import { Card, PageHeading, StatusBadge } from "@/components/ui-kit";

interface GrievanceItem {
  id: string;
  referenceNumber: string;
  category: string;
  scheme: string;
  submittedAt: string;
  status: "Submitted" | "Under review" | "Action taken" | "Resolved";
  subject: string;
  priority: "High" | "Medium" | "Low";
}

const INITIAL_GRIEVANCES: GrievanceItem[] = [
  {
    id: "grv-1",
    referenceNumber: "GRV-CG-10482",
    category: "Incorrect subsidy amount",
    scheme: "PM-KISAN",
    submittedAt: "20 Nov 2026",
    status: "Under review",
    subject: "Sanction amount differs from verified benefit estimate",
    priority: "High",
  },
  {
    id: "grv-2",
    referenceNumber: "GRV-CG-10445",
    category: "Payment not received",
    scheme: "PM Fasal Bima",
    submittedAt: "14 Nov 2026",
    status: "Submitted",
    subject: "Claim compensation approved but not credited to bank account",
    priority: "Medium",
  },
  {
    id: "grv-3",
    referenceNumber: "GRV-CG-10398",
    category: "Eligibility issue",
    scheme: "Kisan Credit Card",
    submittedAt: "02 Nov 2026",
    status: "Resolved",
    subject: "Cropping pattern classification updated in district ledger",
    priority: "Low",
  },
];

export default function GrievancesPage() {
  const [grievances] = useState<GrievanceItem[]>(INITIAL_GRIEVANCES);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = grievances.filter((item) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchRef = item.referenceNumber.toLowerCase().includes(q);
      const matchSub = item.subject.toLowerCase().includes(q);
      const matchScheme = item.scheme.toLowerCase().includes(q);
      if (!matchRef && !matchSub && !matchScheme) return false;
    }
    if (statusFilter !== "All" && item.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    return true;
  });

  const total = grievances.length;
  const underReview = grievances.filter((g) => g.status === "Under review").length;
  const submitted = grievances.filter((g) => g.status === "Submitted").length;
  const resolved = grievances.filter((g) => g.status === "Resolved").length;

  return (
    <div className="space-y-6">
      <PageHeading
        title="Grievance Redressal & Support"
        description="Raise and track disputes regarding benefit amounts, delays, and verification records"
        action={
          <Link
            href="/farmer/grievances/new"
            className="glass-btn glass-green inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow"
          >
            <Plus className="size-4" />
            Lodge New Grievance
          </Link>
        }
      />

      {/* Counters */}
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          ["Total Lodged", total, "All time"],
          ["Awaiting Review", submitted, "In queue"],
          ["Under Investigation", underReview, "Assigned to officer"],
          ["Resolved", resolved, "Dispute settled"],
        ].map(([label, val, note]) => (
          <Card key={label as string} className="glass p-4">
            <p className="text-xs text-slate-400">{label as string}</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">
              {val as number}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">{note as string}</p>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <Card className="glass">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 pb-4 dark:border-white/10">
          <div className="relative min-w-[260px] flex-1">
            <Search className="absolute left-3 top-3 size-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by grievance number, subject, or scheme..."
              className="field pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <Filter className="size-3.5 text-slate-400 mr-1" />
            {["All", "Submitted", "Under review", "Resolved"].map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`rounded-lg px-3 py-1.5 font-semibold transition ${
                  statusFilter === filter
                    ? "glass-btn glass-green text-white shadow-sm"
                    : "glass hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="table-wrap mt-4">
          <table>
            <thead>
              <tr>
                <th>Reference ID</th>
                <th>Category</th>
                <th>Related Scheme</th>
                <th>Subject</th>
                <th>Lodged Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-slate-400">
                    No grievances found matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id}>
                    <td className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      {item.referenceNumber}
                    </td>
                    <td className="text-xs">{item.category}</td>
                    <td className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                      {item.scheme}
                    </td>
                    <td className="max-w-[220px] truncate text-xs text-slate-600 dark:text-slate-300">
                      {item.subject}
                    </td>
                    <td className="text-xs text-slate-400">{item.submittedAt}</td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td>
                      <Link
                        href={`/farmer/grievances/${item.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline dark:text-emerald-400"
                      >
                        Details <ArrowRight className="size-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
