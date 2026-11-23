"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Filter, ArrowRight, FileCheck, CheckCircle2, Clock, Send, AlertCircle } from "lucide-react";
import { Card, PageHeading, StatusBadge } from "@/components/ui-kit";
import { applicationsApi } from "@/lib/api";

interface ApplicationItem {
  id: string;
  schemeName: string;
  schemeId: string;
  applicationNumber: string;
  submittedAt: string;
  status: "Draft" | "Submitted" | "Under review" | "Documents required" | "Approved" | "Completed";
  remarks?: string;
}

const INITIAL_APPLICATIONS: ApplicationItem[] = [
  {
    id: "app-101",
    schemeName: "PM-KISAN Samman Nidhi",
    schemeId: "pm-kisan",
    applicationNumber: "KS-2026-10482",
    submittedAt: "12 Nov 2026",
    status: "Approved",
    remarks: "Land revenue records verified by Revenue Inspector (Patwari).",
  },
  {
    id: "app-102",
    schemeName: "PM Fasal Bima Yojana",
    schemeId: "pmfby",
    applicationNumber: "CG-PMFBY-8821",
    submittedAt: "08 Nov 2026",
    status: "Under review",
    remarks: "Awaiting remote sensing satellite yield report.",
  },
  {
    id: "app-103",
    schemeName: "Kisan Credit Card Crop Loan",
    schemeId: "kcc",
    applicationNumber: "KCC-77421",
    submittedAt: "29 Oct 2026",
    status: "Documents required",
    remarks: "Upload current season cropping pattern declaration.",
  },
];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationItem[]>(INITIAL_APPLICATIONS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState("pm-kisan");
  const [customRef, setCustomRef] = useState(`KS-2026-${Math.floor(10000 + Math.random() * 90000)}`);
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toastNote, setToastNote] = useState<string | null>(null);

  const schemeNames: Record<string, string> = {
    "pm-kisan": "PM-KISAN Samman Nidhi",
    "kcc": "Kisan Credit Card Crop Loan",
    "pmfby": "PM Fasal Bima Yojana",
    "pmksy": "PM Krishi Sinchayee Yojana (Micro-Irrigation)",
    "smam": "Sub-Mission on Agricultural Mechanization",
  };

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setToastNote(null);

    const newApp: ApplicationItem = {
      id: `app-${Date.now()}`,
      schemeName: schemeNames[selectedScheme] || "Agricultural Scheme",
      schemeId: selectedScheme,
      applicationNumber: customRef || `KS-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      submittedAt: "Today, Just now",
      status: "Submitted",
      remarks: remarks || "Application submitted via KrishiSetu portal.",
    };

    try {
      await applicationsApi.create({
        schemeId: selectedScheme,
        applicationNumber: newApp.applicationNumber,
        remarks: newApp.remarks,
      });
      setToastNote(`Application ${newApp.applicationNumber} created and recorded in system.`);
    } catch {
      setToastNote(`Application ${newApp.applicationNumber} recorded locally.`);
    } finally {
      setApplications([newApp, ...applications]);
      setSubmitting(false);
      setModalOpen(false);
      setCustomRef(`KS-2026-${Math.floor(10000 + Math.random() * 90000)}`);
      setRemarks("");
    }
  };

  const filteredApps = applications.filter((app) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchesName = app.schemeName.toLowerCase().includes(q);
      const matchesRef = app.applicationNumber.toLowerCase().includes(q);
      if (!matchesName && !matchesRef) return false;
    }
    if (statusFilter !== "All" && app.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    return true;
  });

  const total = applications.length;
  const underReview = applications.filter((a) => a.status === "Under review" || a.status === "Submitted").length;
  const approved = applications.filter((a) => a.status === "Approved").length;
  const docsRequired = applications.filter((a) => a.status === "Documents required").length;

  return (
    <div className="space-y-6">
      <PageHeading
        title="Application Tracking & Submissions"
        description="Monitor status, review required actions, and submit new scheme applications"
        action={
          <button
            onClick={() => setModalOpen(true)}
            className="glass-btn glass-green inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow"
          >
            <Plus className="size-4" />
            Add New Application
          </button>
        }
      />

      {toastNote && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{toastNote}</span>
        </div>
      )}

      {/* Counters Grid */}
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          ["Total Applications", total, "All recorded"],
          ["Pending Review", underReview, "In progress"],
          ["Approved", approved, "Sanction ready"],
          ["Action Needed", docsRequired, "Documents requested"],
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
              placeholder="Search by reference or scheme name..."
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

        {/* Applications Table */}
        <div className="table-wrap mt-4">
          <table>
            <thead>
              <tr>
                <th>Scheme Name</th>
                <th>Reference ID</th>
                <th>Submission Date</th>
                <th>Status</th>
                <th>Remarks</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                    No applications match the current filter.
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => (
                  <tr key={app.id}>
                    <td className="font-semibold text-slate-900 dark:text-white">
                      {app.schemeName}
                    </td>
                    <td className="font-mono text-xs">{app.applicationNumber}</td>
                    <td className="text-xs text-slate-500">{app.submittedAt}</td>
                    <td>
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="max-w-[220px] truncate text-xs text-slate-500">
                      {app.remarks || "—"}
                    </td>
                    <td>
                      <Link
                        href={`/farmer/applications/${app.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline dark:text-emerald-400"
                      >
                        Inspect <ArrowRight className="size-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Application Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="glass w-full max-w-lg rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-black/5 pb-3 dark:border-white/10">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Add Scheme Application
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateApplication} className="mt-4 space-y-4">
              <div>
                <label htmlFor="scheme-select" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Select Scheme
                </label>
                <select
                  id="scheme-select"
                  aria-label="Select Scheme"
                  value={selectedScheme}
                  onChange={(e) => setSelectedScheme(e.target.value)}
                  className="field mt-1.5 text-xs font-medium"
                >
                  <option value="pm-kisan">PM-KISAN Samman Nidhi</option>
                  <option value="kcc">Kisan Credit Card (KCC)</option>
                  <option value="pmfby">PM Fasal Bima Yojana</option>
                  <option value="pmksy">PM Krishi Sinchayee Yojana</option>
                  <option value="smam">Sub-Mission on Agri-Mechanization</option>
                </select>
              </div>

              <div>
                <label htmlFor="ref-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Application Reference Number
                </label>
                <input
                  id="ref-input"
                  aria-label="Application Reference Number"
                  type="text"
                  value={customRef}
                  onChange={(e) => setCustomRef(e.target.value)}
                  required
                  className="field mt-1.5 text-xs font-mono"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Auto-generated or match your official receipt reference.
                </p>
              </div>

              <div>
                <label htmlFor="remarks-textarea" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Notes & Supporting Details
                </label>
                <textarea
                  id="remarks-textarea"
                  aria-label="Notes & Supporting Details"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Applied at CSC center with Khasra documents..."
                  className="field mt-1.5 min-h-20 text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="glass glass-btn rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="glass-btn glass-green inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white shadow"
                >
                  {submitting ? (
                    <span>Registering...</span>
                  ) : (
                    <>
                      <Send className="size-3.5" />
                      Submit Application
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
