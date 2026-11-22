"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Users, MapPinned, ArrowRight, ShieldCheck, AlertTriangle } from "lucide-react";
import { Card, PageHeading, StatusBadge } from "@/components/ui-kit";
import { getFarmers } from "@/lib/api";

export default function OfficerFarmersPage() {
  const [farmers, setFarmers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [villageFilter, setVillageFilter] = useState("All");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getFarmers(search, villageFilter);
      setFarmers(data);
      setLoading(false);
    }
    load();
  }, [search, villageFilter]);

  const filtered = farmers.filter((f) => {
    const matchesVillage = villageFilter === "All" || f.village === villageFilter;
    const matchesSearch =
      f.full_name.toLowerCase().includes(search.toLowerCase()) ||
      f.phone.includes(search) ||
      f.village.toLowerCase().includes(search.toLowerCase());
    return matchesVillage && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <PageHeading
        title="Cultivator Registry Directory"
        description="Comprehensive jurisdiction roster of registered landowners, tenant farmers, and sharecroppers."
      />

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Village:</span>
            {["All", "Khamtarai", "Bhatagaon", "Jamgaon"].map((v) => (
              <button
                key={v}
                onClick={() => setVillageFilter(v)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  villageFilter === v
                    ? "bg-[#166534] text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, village..."
              className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs outline-none focus:border-[#166534]"
            />
          </div>
        </div>
      </Card>

      {/* Farmers Table */}
      <Card>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Farmer Name</th>
                <th>Village & Block</th>
                <th>Landholding</th>
                <th>Cultivator Status</th>
                <th>DBT & Girdawari</th>
                <th>Discrepancies</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((farmer) => (
                <tr key={farmer.id} className="hover:bg-slate-50/50">
                  <td className="font-semibold text-slate-900">
                    <div>
                      <p>{farmer.full_name}</p>
                      <p className="text-[11px] font-mono text-slate-400">Phone: {farmer.phone}</p>
                    </div>
                  </td>
                  <td className="text-xs text-slate-700">
                    <p className="font-medium">{farmer.village}</p>
                    <p className="text-[10px] text-slate-400">{farmer.block}, {farmer.district}</p>
                  </td>
                  <td className="text-xs">
                    <span className="font-bold text-slate-900">{farmer.cultivated_area_acres} Acres</span>
                    <p className="text-[10px] text-slate-500">{farmer.primary_crop} ({farmer.farming_season})</p>
                  </td>
                  <td>
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-[11px] font-semibold ${
                        farmer.cultivator_type === "Sharecropper"
                          ? "bg-purple-100 text-purple-800"
                          : farmer.cultivator_type === "Tenant"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {farmer.cultivator_type}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`size-2 rounded-full ${
                          farmer.npci_mapped ? "bg-emerald-500" : "bg-red-500"
                        }`}
                        title={farmer.npci_mapped ? "NPCI Mapped" : "NPCI Not Seeded"}
                      />
                      <span className="text-[11px] font-medium text-slate-600">
                        {farmer.npci_mapped ? "DBT Active" : "DBT Pending"}
                      </span>
                    </div>
                  </td>
                  <td>
                    {farmer.discrepancies_count > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                        <AlertTriangle className="size-3" />
                        {farmer.discrepancies_count} Flagged
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                        <ShieldCheck className="size-3.5 text-emerald-600" />
                        Clean Record
                      </span>
                    )}
                  </td>
                  <td>
                    <Link
                      href={`/officer/farmers/${farmer.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#166534] hover:underline"
                    >
                      View Dossier
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
