"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, User, MapPin, Phone, ShieldCheck, AlertTriangle, Layers, Sprout, FileCheck, CheckCircle2 } from "lucide-react";
import { Card, PageHeading, StatusBadge } from "@/components/ui-kit";
import { getFarmer } from "@/lib/api";

export default function OfficerFarmerDetailPage({ params }: { params: Promise<{ farmerId: string }> }) {
  const resolvedParams = use(params);
  const [farmer, setFarmer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getFarmer(resolvedParams.farmerId);
      setFarmer(data);
      setLoading(false);
    }
    load();
  }, [resolvedParams.farmerId]);

  if (loading || !farmer) {
    return (
      <div className="py-12 text-center text-sm text-slate-500">
        Loading cultivator profile...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/officer/farmers"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="size-4" />
        Back to Cultivator Directory
      </Link>

      <PageHeading
        title={farmer.full_name}
        description={`Farmer ID: KS-CG-10482 · Registered Village: ${farmer.village}, Block: ${farmer.block}, District: ${farmer.district}`}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Details (2 cols) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Identity & Cultivator Bridge */}
          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <User className="size-4 text-[#166534]" />
              Cultivator Identity & Agrarian Status
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                <span className="text-[11px] font-medium text-slate-400">Cultivator Classification</span>
                <p className="mt-1 text-sm font-bold text-slate-900">{farmer.cultivator_type}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Land Title: {farmer.land_ownership}</p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                <span className="text-[11px] font-medium text-slate-400">Total Cultivated Area</span>
                <p className="mt-1 text-sm font-bold text-slate-900">{farmer.cultivated_area_acres} Acres</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Irrigation: {farmer.irrigation_status}</p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                <span className="text-[11px] font-medium text-slate-400">Primary Crops</span>
                <p className="mt-1 text-sm font-bold text-slate-900">{farmer.primary_crop}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Secondary: {farmer.secondary_crop || "None"} ({farmer.farming_season})</p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                <span className="text-[11px] font-medium text-slate-400">Preferred Language</span>
                <p className="mt-1 text-sm font-bold text-slate-900">
                  {farmer.preferred_language === "hi" ? "Hindi (हिन्दी)" : farmer.preferred_language === "cghi" ? "Chhattisgarhi" : "English"}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Phone: +91 {farmer.phone}</p>
              </div>
            </div>
          </Card>

          {/* Infrastructure Seeding & Verification */}
          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ShieldCheck className="size-4 text-[#166534]" />
              Government Gateway & Registry Verification Status
            </h3>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { name: "Aadhaar e-KYC", status: farmer.e_kyc_completed, detail: "Biometric e-KYC completed" },
                { name: "NPCI Bank Mapper (DBT)", status: farmer.npci_mapped, detail: farmer.npci_mapped ? "Bank account mapped for direct benefit transfer" : "ACTION REQUIRED: Account not seeded" },
                { name: "Bhuiyan Revenue Seeding", status: farmer.bhuiyan_linked, detail: "Khasra / B1 verified on CG Bhuiyan" },
                { name: "Girdawari Crop Survey", status: farmer.girdawari_enrolled, detail: "Crop entry approved by Patwari" },
              ].map((item, i) => (
                <div key={i} className={`rounded-xl border p-3.5 ${item.status ? "border-emerald-200 bg-emerald-50/30" : "border-red-200 bg-red-50/30"}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{item.name}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${item.status ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                      {item.status ? "VERIFIED" : "PENDING"}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-600">{item.detail}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar: Cultivator Verification Notice & Discrepancy */}
        <div className="space-y-6">
          <Card className="p-5 border-l-4 border-l-purple-600">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900 mb-2">
              Cultivator Identity Bridge
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed">
              This cultivator is operating as a <b>Sharecropper (बटाईदार)</b> under a 50:50 crop-sharing contract. Under revised 2026 guidelines, sharecroppers are eligible for RGKNY, PMFBY, and KCC with Panchayat Gram Sabha certification.
            </p>
            <div className="mt-4">
              <Link
                href="/officer/verifications"
                className="inline-flex w-full items-center justify-center rounded-xl bg-purple-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-purple-700"
              >
                Inspect Cultivator Evidence
              </Link>
            </div>
          </Card>

          {farmer.discrepancies_count > 0 && (
            <Card className="p-5 border-l-4 border-l-amber-500 bg-amber-50/40">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="size-4 text-amber-600" />
                Active Discrepancies ({farmer.discrepancies_count})
              </h4>
              <p className="text-xs text-amber-900 leading-relaxed">
                Policy-to-Payment engine flagged a ₹4,000 variance in PMFBY claim sanction and an under-allocated KCC credit limit.
              </p>
              <div className="mt-4">
                <Link
                  href="/officer/discrepancies"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-amber-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-amber-700"
                >
                  Investigate Discrepancy
                </Link>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
