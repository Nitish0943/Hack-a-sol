"use client";

import Link from "next/link";
import { AlertCircle, CheckCircle2, CircleX, Upload } from "lucide-react";
import { Card, PageHeading, StatusBadge } from "@/components/ui-kit";

export default function EligibilityPage() {
  return (
    <div>
      <PageHeading title="Eligibility Checker" description="Evaluate a scheme against the available farmer profile" />
      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <Card className="h-fit"><h3 className="font-bold">Check a scheme</h3><label className="mt-4 block text-sm font-semibold">Scheme<select className="field mt-2"><option>PM-KISAN</option><option>Kisan Credit Card</option><option>PM Fasal Bima Yojana</option></select></label><div className="mt-5 rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase text-slate-400">Farmer profile</p><dl className="mt-3 space-y-2 text-sm"><div className="flex justify-between"><dt>Location</dt><dd>Raipur</dd></div><div className="flex justify-between"><dt>Landholding</dt><dd>2 acres</dd></div><div className="flex justify-between"><dt>Cultivator</dt><dd>Landowner</dd></div><div className="flex justify-between"><dt>Crop</dt><dd>Paddy</dd></div></dl></div><button className="mt-5 w-full rounded-xl bg-[#166534] px-4 py-3 text-sm font-semibold text-white">Check eligibility</button></Card>
        <Card><div className="flex items-start justify-between gap-4"><div><p className="text-xs text-slate-400">Evaluation: 22 Nov 2026</p><h3 className="mt-1 text-xl font-bold">PM-KISAN</h3></div><StatusBadge status="Potentially eligible" /></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4"><CheckCircle2 className="size-5 text-emerald-700" /><p className="mt-2 text-sm font-bold">3 satisfied</p></div><div className="rounded-xl border border-red-100 bg-red-50 p-4"><CircleX className="size-5 text-red-700" /><p className="mt-2 text-sm font-bold">0 not satisfied</p></div><div className="rounded-xl border border-amber-100 bg-amber-50 p-4"><AlertCircle className="size-5 text-amber-700" /><p className="mt-2 text-sm font-bold">1 verification</p></div></div><div className="mt-6 space-y-3">{[
          ["Location condition","Satisfied","Available profile data matches the configured state."],
          ["Landholding record","Verification required","Landholding evidence should be reviewed."],
          ["Cultivator status","Satisfied","Landowner classification matches."],
        ].map(([title,status,detail]) => <div key={title} className="flex gap-3 rounded-xl border border-slate-100 p-4"><CheckCircle2 className={`mt-0.5 size-4 ${status === "Verification required" ? "text-amber-600" : "text-emerald-600"}`} /><div><div className="flex items-center gap-2"><p className="text-sm font-semibold">{title}</p><StatusBadge status={status} /></div><p className="mt-1 text-xs text-slate-500">{detail}</p></div></div>)}</div><div className="mt-6 flex flex-wrap gap-3"><button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold"><Upload className="size-4" /> Upload evidence</button><Link href="/farmer/schemes/pm-kisan" className="rounded-xl bg-[#166534] px-4 py-2.5 text-sm font-semibold text-white">View scheme</Link></div><p className="mt-5 text-xs text-slate-400">Policy version 2026-CG-PMKS-01 · This is an estimate, not official government approval.</p></Card>
      </div>
    </div>
  );
}
