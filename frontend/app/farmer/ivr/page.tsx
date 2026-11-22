"use client";

import { useState } from "react";
import { Card, PageHeading } from "@/components/ui-kit";
import { useLanguage } from "@/components/language-provider";
import { translateText } from "@/lib/i18n/translations";

export default function IvrPage() {
  const [key,setKey]=useState<string|null>(null);
  const { language } = useLanguage();
  return <div><PageHeading title="IVR Support" description="Call assistance and simulated keypad preview" /><div className="grid gap-5 lg:grid-cols-[1fr_360px]"><Card><h3 className="font-bold">How to use KrishiSetu IVR</h3><ol className="mt-4 space-y-3 text-sm text-slate-600">{["Call the configured KrishiSetu number.","Choose Hindi or English.","Complete the registered mobile verification.","Press a keypad option from the menu."].map((step,i)=><li key={step} className="flex gap-3"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#EAF4EC] text-xs font-bold text-[#166534]">{i+1}</span>{step}</li>)}</ol><div className="mt-6 table-wrap"><table><thead><tr><th>Key</th><th>Service</th></tr></thead><tbody>{[["1","Government scheme information"],["2","Loan and subsidy information"],["3","Application status"],["4","Payment status"],["5","Register grievance"],["9","Repeat menu"]].map(row=><tr key={row[0]}><td className="font-bold">{row[0]}</td><td>{row[1]}</td></tr>)}</tbody></table></div></Card><Card><h3 className="font-bold">Demo keypad</h3><p className="mt-1 text-xs text-amber-700">Simulated interface — no real call is placed.</p><div className="mx-auto mt-5 grid max-w-48 grid-cols-3 gap-2">{["1","2","3","4","5","6","7","8","9","*","0","#"].map(v=><button key={v} onClick={()=>setKey(v)} className="grid aspect-square place-items-center rounded-full border border-slate-200 font-bold hover:bg-green-50">{v}</button>)}</div><div className="mt-5 rounded-xl bg-slate-900 p-4 text-center text-sm text-white">{key ? `${translateText("Menu option", language)} ${key} ${translateText("selected", language)}` : translateText("Welcome to KrishiSetu", language)}</div></Card></div></div>;
}
