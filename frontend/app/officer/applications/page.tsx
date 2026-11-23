"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Filter, ArrowRight, ShieldCheck } from "lucide-react";
import { Card, PageHeading, StatusBadge } from "@/components/ui-kit";

interface OfficerAppItem {
  id: string;
  reference: string;
  farmerName: string;
  farmerId: string;
  scheme: string;
  submitted: string;
  pendingDays: string;
  status: "Under review" | "Documents required" | "Approved" | "Rejected";
}

const OFFICER_APPS: OfficerAppItem[] = [
  {
    id: "app-101",
    reference: "KS-2026-10482",
    farmerName: "Ramesh Kumar",
    farmerId: "KS-CG-10482",
    scheme: "PM-KISAN",
    submitted: "12 Nov 2026",
    pendingDays: "10 days",
    status: "Under review",
  },
  {
    id: "app-102",
    reference: "CG-PMFBY-8821",
    farmerName: "Savitri Bai",
    farmerId: "KS-CG-10483",
    scheme: "PMFBY",
    submitted: "08 Nov 2026",
    pendingDays: "14 days",
    status: "Documents required",
  },
  {
    id: "app-103",
    reference: "KCC-77421",
    farmerName: "Lakhan Lal Sahu",
    farmerId: "KS-CG-10485",
    scheme: "Kisan Credit Card",
    submitted: "29 Oct 2026",
    pendingDays: "24 days",
    status: "Under review",
  },
  {
    id: "app-104",
    reference: "PMKSY-CG-9912",
    farmerName: "Dinesh Patel",
    farmerId: "KS-CG-10490",
    scheme: "PMKSY Micro-Irrigation",
    submitted: "18 Nov 2026",
    pendingDays: "4 days",
    status: "Approved",
  },
];

export default function OfficerApplicationsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = OFFICER_APPS.filter((item) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = item.farmerName.toLowerCase().includes(q);
      const matchRef = item.reference.toLowerCase().includes(q);
      const matchScheme = item.scheme.toLowerCase().includes(q);
      if (!matchName && !matchRef && !matchScheme) return false;
    }
    if (statusFilter !== "All" && item.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeading
        title="Application Review & Scrutiny"
        description="Verify farmer dossiers, revenue land records, and approve DBT benefit disbursements"
      />

      <Card className="glass">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 pb-4 dark:border-white/10">
          <div className="relative min-w-[260px] flex-1">
            <Search className="absolute left-3 top-3 size-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by farmer name, reference number, or scheme..."
              className="field pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <Filter className="size-3.5 text-slate-400 mr-1" />
            {["All", "Under review", "Documents required", "Approved"].map((filter) => (
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

        <div className="table-wrap mt-4">
          <table>
            <thead>
              <tr>
                <th>Reference ID</th>
                <th>Farmer Applicant</th>
                <th>Scheme</th>
                <th>Submitted</th>
                <th>Pending Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-slate-400">
                    No applications match the current filter.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id}>
                    <td className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      {row.reference}
                    </td>
                    <td>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{row.farmerName}</p>
                        <p className="text-[11px] text-slate-400">{row.farmerId}</p>
                      </div>
                    </td>
                    <td className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                      {row.scheme}
                    </td>
                    <td className="text-xs text-slate-500">{row.submitted}</td>
                    <td className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                      {row.pendingDays}
                    </td>
                    <td>
                      <StatusBadge status={row.status} />
                    </td>
                    <td>
                      <Link
                        href={`/officer/applications/${row.id}`}
                        className="glass-btn glass-green inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-white shadow"
                      >
                        Scrutinize <ArrowRight className="size-3" />
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
