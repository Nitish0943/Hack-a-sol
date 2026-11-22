"use client";

import { useState } from "react";
import { Download, FileText, BarChart3, TrendingUp, Users, ShieldCheck, IndianRupee } from "lucide-react";
import { Card, PageHeading, StatCard } from "@/components/ui-kit";

export default function OfficerReportsPage() {
  const [downloading, setDownloading] = useState(false);

  const handleExport = (name: string) => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      alert(`Report "${name}" generated and ready for print.`);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <PageHeading
        title="Jurisdiction Analytics & Audit Reports"
        description="Raipur District Agricultural Entitlement Performance, Discrepancy Audits, and Citizen Charter Metrics."
        action={
          <button
            onClick={() => handleExport("District Entitlement Summary 2026-27")}
            className="inline-flex items-center gap-2 rounded-xl bg-[#166534] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#14532d]"
          >
            <Download className="size-4" />
            Export District Report (PDF)
          </button>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Entitlement Flow"
          value="₹9,88,000"
          detail="Monitored in Raipur block"
          icon={<IndianRupee className="size-5" />}
        />
        <StatCard
          label="Verification Coverage"
          value="94.2%"
          detail="+6.4% from last Kharif"
          icon={<ShieldCheck className="size-5" />}
          tone="green"
        />
        <StatCard
          label="Discrepancies Audited"
          value="18 Resolved"
          detail="Avg resolution: 4.2 days"
          icon={<TrendingUp className="size-5" />}
          tone="blue"
        />
        <StatCard
          label="Cultivator Bridge Rate"
          value="38% Non-title"
          detail="Tenants & sharecroppers"
          icon={<Users className="size-5" />}
        />
      </div>

      {/* Available Audit Reports */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Official Government Audit Schedules</h3>

        <div className="grid gap-4 md:grid-cols-2">
          {[
            {
              title: "Policy-to-Payment Forensic Audit (Kharif 2026)",
              detail: "Complete ledger of PMFBY claim sanctions vs DLTC loss indices across 48 cultivators.",
              filename: "Audit_P2P_Forensic_Raipur_Kharif2026.pdf",
              date: "Updated 22 Nov 2026",
            },
            {
              title: "Cultivator Identity Bridge Endorsement Log",
              detail: "Roster of sharecropper and oral lease endorsements executed under Gram Sabha resolutions.",
              filename: "Cultivator_Bridge_Endorsements_Dharsiwa.pdf",
              date: "Updated 20 Nov 2026",
            },
            {
              title: "Aadhaar-NPCI DBT Connectivity Status Report",
              detail: "Village-wise listing of cultivators requiring bank account seeding or dormant account reactivation.",
              filename: "NPCI_DBT_Seeding_Deficiency_List.pdf",
              date: "Updated 18 Nov 2026",
            },
            {
              title: "PM-KISAN e-KYC & Land Seeding Completion Register",
              detail: "Patwari Halka progress report for 100% digital Bhuiyan synchronization.",
              filename: "PMKISAN_Land_Seeding_Halka_Register.pdf",
              date: "Updated 15 Nov 2026",
            },
          ].map((rep, i) => (
            <Card key={i} className="p-5 flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-[#166534]" />
                  <h4 className="text-sm font-bold text-slate-900">{rep.title}</h4>
                </div>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">{rep.detail}</p>
                <p className="mt-3 text-[10px] text-slate-400">{rep.date} · PDF Format</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => handleExport(rep.title)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#166534] hover:underline"
                >
                  <Download className="size-3.5" />
                  Download Dossier
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
