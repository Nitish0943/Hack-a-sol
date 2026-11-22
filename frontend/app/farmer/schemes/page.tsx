"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { Card, PageHeading, StatusBadge } from "@/components/ui-kit";

const schemes = [
  { id:"pm-kisan", name:"PM-KISAN", department:"Ministry of Agriculture", category:"Income support", description:"Direct income support for eligible landholding farmer families.", benefit:"₹6,000 per year", status:"Potentially eligible", updated:"18 Nov 2026" },
  { id:"kcc", name:"Kisan Credit Card", department:"Department of Agriculture", category:"Agricultural credit", description:"Short-term credit for cultivation, post-harvest and allied activities.", benefit:"Interest support on eligible loan", status:"Potentially eligible", updated:"15 Nov 2026" },
  { id:"pmfby", name:"PM Fasal Bima Yojana", department:"Agriculture Insurance", category:"Crop insurance", description:"Crop insurance against yield loss from notified natural risks.", benefit:"Risk-based premium subsidy", status:"Verification required", updated:"12 Nov 2026" },
];

export default function SchemesPage() {
  return (
    <div>
      <PageHeading title="Government Scheme Directory" description="Explore sample government agricultural schemes" />
      <Card className="mb-5">
        <div className="grid gap-3 md:grid-cols-[1fr_180px_180px]"><label className="relative"><Search className="absolute left-3 top-3 size-4 text-slate-400" /><input className="field pl-10" placeholder="Search schemes" /></label><select className="field"><option>All categories</option><option>Loan schemes</option><option>Subsidy schemes</option><option>Insurance</option></select><select className="field"><option>Eligibility: Any</option><option>Potentially eligible</option><option>Not eligible</option></select></div>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">{schemes.map((scheme) => <Card key={scheme.id}><div className="flex items-start justify-between gap-3"><div><p className="text-xs text-[#166534]">{scheme.category}</p><h3 className="mt-1 text-lg font-bold">{scheme.name}</h3></div><StatusBadge status={scheme.status} /></div><p className="mt-3 text-sm leading-6 text-slate-500">{scheme.description}</p><div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-4"><div><p className="text-xs text-slate-400">{scheme.department}</p><p className="mt-1 text-sm font-bold text-[#166534]">{scheme.benefit}</p></div><Link href={`/farmer/schemes/${scheme.id}`} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold">View details</Link></div></Card>)}</div>
    </div>
  );
}
