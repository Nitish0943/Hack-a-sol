"use client";

import { useState } from "react";
import { Card, PageHeading, StatusBadge } from "@/components/ui-kit";
import { useLanguage } from "@/components/language-provider";
import { translateText } from "@/lib/i18n/translations";

export default function OfficerFarmerDetailPage() {
  const { language } = useLanguage();
  const initialRemark = "Landholding evidence received. Human verification pending for the final record.";
  const [remark, setRemark] = useState("");
  const [remarkEdited, setRemarkEdited] = useState(false);

  return <div><PageHeading title="Ramesh Kumar" description="KS-CG-10482 · Khamtarai, Raipur" action={<StatusBadge status="Verified" />} /><div className="grid gap-5 lg:grid-cols-2"><Card><h3 className="font-bold">Personal & location</h3><dl className="mt-4 grid grid-cols-2 gap-4 text-sm"><div><dt className="text-slate-400">Mobile</dt><dd className="mt-1 font-semibold">98765XXXXX</dd></div><div><dt className="text-slate-400">Cultivator</dt><dd className="mt-1 font-semibold">Landowner</dd></div><div><dt className="text-slate-400">Area</dt><dd className="mt-1 font-semibold">2 acres</dd></div><div><dt className="text-slate-400">Crop</dt><dd className="mt-1 font-semibold">Paddy</dd></div></dl></Card><Card><h3 className="font-bold">Officer remarks</h3><textarea className="field mt-4 min-h-28" value={remarkEdited ? remark : translateText(initialRemark, language)} onChange={(event) => { setRemark(event.target.value); setRemarkEdited(true); }} /><button className="mt-3 rounded-xl bg-[#166534] px-4 py-2.5 text-sm font-semibold text-white">Save remark</button></Card></div></div>;
}
