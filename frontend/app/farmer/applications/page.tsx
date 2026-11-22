"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Card, PageHeading, StatusBadge } from "@/components/ui-kit";

export default function ApplicationsPage() {
  return <div><PageHeading title="Application Tracking" description="Track recorded applications" action={<button className="inline-flex items-center gap-2 rounded-xl bg-[#166534] px-4 py-2.5 text-sm font-semibold text-white"><Plus className="size-4" /> Add application</button>} /><div className="mb-5 grid gap-3 sm:grid-cols-4">{[["Total","3"],["Under review","1"],["Approved","1"],["Completed","1"]].map(([label,value])=><Card key={label} className="p-4"><p className="text-xs text-slate-400">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p></Card>)}</div><Card><div className="table-wrap"><table><thead><tr><th>Scheme</th><th>Reference</th><th>Submitted</th><th>Status</th><th>Action</th></tr></thead><tbody>{[["PM-KISAN","KS-2026-10482","12 Nov 2026","Approved"],["PMFBY","CG-PMFBY-8821","08 Nov 2026","Under review"],["Kisan Credit Card","KCC-77421","29 Oct 2026","Documents required"]].map(row=><tr key={row[1]}><td className="font-semibold">{row[0]}</td><td>{row[1]}</td><td>{row[2]}</td><td><StatusBadge status={row[3]} /></td><td><Link href="/farmer/applications/app-1" className="font-semibold text-[#166534]">View</Link></td></tr>)}</tbody></table></div></Card></div>;
}
