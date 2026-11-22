"use client";

import { useState } from "react";
import { User, ShieldCheck, MapPin, Building2, Lock, Check } from "lucide-react";
import { Card, PageHeading } from "@/components/ui-kit";

export default function OfficerSettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeading
        title="Officer Profile & Jurisdiction Credentials"
        description="Rural Agriculture Extension Officer (RAEO) credentials and administrative jurisdiction settings."
      />

      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <User className="size-4 text-[#166534]" />
          Official Identity & Designation
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
            <span className="text-[11px] text-slate-400">Officer Name</span>
            <p className="mt-1 text-sm font-bold text-slate-900">Anita Verma</p>
            <p className="text-[10px] text-slate-500">Employee Code: CG-AGRI-RAEO-44821</p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
            <span className="text-[11px] text-slate-400">Designation</span>
            <p className="mt-1 text-sm font-bold text-slate-900">Rural Agriculture Extension Officer</p>
            <p className="text-[10px] text-slate-500">Dept of Agriculture & Farmers Welfare, CG</p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
            <span className="text-[11px] text-slate-400">Assigned Jurisdiction</span>
            <p className="mt-1 text-sm font-bold text-slate-900">Dharsiwa & Arang Blocks</p>
            <p className="text-[10px] text-slate-500">District: Raipur (Halka 12 to 24)</p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
            <span className="text-[11px] text-slate-400">Digital Signing Certificate</span>
            <p className="mt-1 text-sm font-bold text-emerald-700">e-Sign / DSC Token Active</p>
            <p className="text-[10px] text-slate-500">Valid through: 31 Dec 2027</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-3 border-l-4 border-l-[#166534] bg-emerald-50/20">
        <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
          <Lock className="size-4 text-[#166534]" />
          <span>Statutory Integrity Mandate</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Every endorsement, status transition, and discrepancy determination executed by this extension desk creates an immutable timestamped entry in the platform audit ledger, accessible to the State Vigilance and Agriculture Directorate.
        </p>
      </Card>

      <div className="flex justify-end gap-3 pt-2">
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-xl bg-[#166534] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#14532d]"
        >
          {saved ? <Check className="size-4" /> : null}
          {saved ? "Credentials Verified!" : "Confirm Extension Settings"}
        </button>
      </div>
    </div>
  );
}
