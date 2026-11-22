import Link from "next/link";
import { Plus } from "lucide-react";
import { Card, PageHeading, StatusBadge } from "@/components/ui-kit";

export default function GrievancesPage() {
  return <div><PageHeading title="My Grievances" description="Create and track complaints" action={<Link href="/farmer/grievances/new" className="inline-flex items-center gap-2 rounded-xl bg-[#166534] px-4 py-2.5 text-sm font-semibold text-white"><Plus className="size-4" /> New grievance</Link>} /><div className="mb-5 grid gap-3 sm:grid-cols-4">{[["Total","2"],["Submitted","1"],["Under review","1"],["Resolved","0"]].map(([label,value])=><Card key={label} className="p-4"><p className="text-xs text-slate-400">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p></Card>)}</div><Card><div className="table-wrap"><table><thead><tr><th>Reference</th><th>Category</th><th>Scheme</th><th>Submitted</th><th>Status</th><th></th></tr></thead><tbody>{[["GRV-CG-10482","Incorrect subsidy amount","PM-KISAN","20 Nov","Under review"],["GRV-CG-10445","Payment not received","PM Fasal Bima","14 Nov","Submitted"]].map(row=><tr key={row[0]}><td className="font-semibold">{row[0]}</td><td>{row[1]}</td><td>{row[2]}</td><td>{row[3]}</td><td><StatusBadge status={row[4]} /></td><td><Link href="/farmer/grievances/grv-1" className="font-semibold text-[#166534]">View</Link></td></tr>)}</tbody></table></div></Card></div>;
}
