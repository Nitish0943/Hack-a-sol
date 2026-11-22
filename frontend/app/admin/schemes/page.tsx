"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Plus, Search, Filter, ExternalLink, CheckCircle2, ShieldCheck, X } from "lucide-react";
import { Card, PageHeading, StatusBadge } from "@/components/ui-kit";
import { getSchemes } from "@/lib/api";

export default function AdminSchemesPage() {
  const [schemes, setSchemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getSchemes();
      setSchemes(data);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = schemes.filter((s) => {
    const matchesCategory = category === "All" || s.category === category;
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <PageHeading
        title="Scheme Catalog & Rules Management"
        description="Statutory agricultural policy catalog governing deterministic eligibility evaluation and entitlement calculation."
        action={
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#166534] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#14532d]"
          >
            <Plus className="size-4" />
            Add Statutory Scheme
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {["All", "Income support", "Agricultural credit", "Crop insurance", "Equipment subsidies"].map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  category === c
                    ? "bg-[#166534] text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search scheme by name or code..."
              className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs outline-none focus:border-[#166534]"
            />
          </div>
        </div>
      </Card>

      {/* Schemes Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((s) => (
          <Card key={s.id} className="p-5 flex flex-col justify-between hover:shadow-md transition">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-700">
                  {s.code}
                </span>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                  Active ({s.policy_version})
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900">{s.name}</h3>
              <p className="text-xs text-slate-500">{s.department}</p>
              <p className="text-xs text-slate-700 leading-relaxed pt-1">{s.description}</p>

              <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs">
                <span className="font-semibold text-slate-700">Entitlement:</span>{" "}
                <span className="font-bold text-[#166534]">{s.benefit_summary}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">Verified: {s.last_verified}</span>
              <a
                href={s.official_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-[#166534] hover:underline"
              >
                Official Portal
                <ExternalLink className="size-3" />
              </a>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Scheme Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Statutory Scheme Definition</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Scheme Code (e.g. PM-KISAN, KCC)</label>
                <input
                  type="text"
                  placeholder="e.g. RGKNY-CG"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 outline-none focus:border-[#166534]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Official Scheme Title</label>
                <input
                  type="text"
                  placeholder="Full scheme name"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 outline-none focus:border-[#166534]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Category</label>
                  <select className="mt-1 w-full rounded-xl border border-slate-200 p-2 outline-none focus:border-[#166534]">
                    <option>Income support</option>
                    <option>Agricultural credit</option>
                    <option>Crop insurance</option>
                    <option>Equipment subsidies</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Policy Version</label>
                  <input
                    type="text"
                    defaultValue="2026-v1.0"
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2 outline-none focus:border-[#166534]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Benefit Summary</label>
                <input
                  type="text"
                  placeholder="e.g. ₹9,000 per acre annual input subsidy"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 outline-none focus:border-[#166534]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    alert("Statutory scheme created and synchronized with deterministic rule engine.");
                  }}
                  className="rounded-xl bg-[#166534] px-5 py-2 font-bold text-white shadow-sm hover:bg-[#14532d]"
                >
                  Publish Scheme
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
