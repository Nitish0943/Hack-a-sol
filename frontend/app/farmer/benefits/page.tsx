import Link from "next/link";
import { IndianRupee, WalletCards } from "lucide-react";
import { DemoBanner } from "@/components/demo-banner";
import { Card, PageHeading, StatCard, StatusBadge } from "@/components/ui-kit";

export default function BenefitsPage() {
  const records = [
    ["PM-KISAN","Income support","₹6,000","₹6,000","Received","benefit-1"],
    ["PM Fasal Bima","Crop insurance","₹12,000","₹12,000","Approved","benefit-2"],
    ["Kisan Credit Card","Agricultural credit","₹24,500","₹18,000","Sanctioned","benefit-3"],
  ];
  return <div><DemoBanner /><PageHeading title="My Benefits" description="Financial Digital Twin · demo ledger" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6"><StatCard label="Potential" value="₹42.5K" detail="Estimate" icon={<WalletCards className="size-5" />} /><StatCard label="Applied" value="₹36K" detail="Recorded" icon={<IndianRupee className="size-5" />} tone="blue" /><StatCard label="Approved" value="₹30K" detail="Recorded" icon={<IndianRupee className="size-5" />} /><StatCard label="Sanctioned" value="₹24K" detail="Officer verified" icon={<IndianRupee className="size-5" />} tone="yellow" /><StatCard label="Disbursed" value="₹18K" detail="System record" icon={<IndianRupee className="size-5" />} /><StatCard label="Received" value="₹18K" detail="Confirmed" icon={<IndianRupee className="size-5" />} /></div><Card className="mt-6"><div className="flex gap-2 overflow-x-auto pb-4">{["All","Potential","Applied","Approved","Sanctioned","Disbursed","Received"].map((filter,i)=><button key={filter} className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold ${i===0?"bg-[#166534] text-white":"border border-slate-200"}`}>{filter}</button>)}</div><div className="grid gap-4 lg:grid-cols-3">{records.map(([name,category,estimated,recorded,status,id])=><Link key={id} href={`/farmer/benefits/${id}`} className="rounded-xl border border-slate-200 p-4 hover:border-green-300"><div className="flex justify-between"><div><p className="text-xs text-slate-400">{category}</p><h3 className="mt-1 font-bold">{name}</h3></div><StatusBadge status={status} /></div><dl className="mt-5 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-xs text-slate-400">Estimated</dt><dd className="mt-1 font-bold">{estimated}</dd></div><div><dt className="text-xs text-slate-400">Recorded amount</dt><dd className="mt-1 font-bold">{recorded}</dd></div></dl><p className="mt-4 text-xs text-slate-400">Updated 22 Nov 2026</p></Link>)}</div></Card></div>;
}
