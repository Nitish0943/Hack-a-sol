import { Download } from "lucide-react";
import { Card, PageHeading, StatCard } from "@/components/ui-kit";

export default function OfficerReportsPage() {
  return <div><PageHeading title="Reports" description="Authorized district-level reporting" action={<button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold"><Download className="size-4" /> Export CSV</button>} /><div className="grid gap-4 sm:grid-cols-3"><StatCard label="Registrations" value="1,284" detail="Raipur district" /><StatCard label="Approved applications" value="492" detail="58% of recorded" /><StatCard label="Resolved grievances" value="217" detail="70% resolution rate" /></div><Card className="mt-5"><h3 className="font-bold">Benefit distribution records</h3><div className="mt-5 space-y-4">{[["PM-KISAN","₹48.2 lakh","82%"],["PMFBY","₹31.6 lakh","64%"],["KCC","₹1.42 crore","71%"]].map(row=><div key={row[0]}><div className="mb-1 flex justify-between text-sm"><span>{row[0]}</span><b>{row[1]}</b></div><div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-[#166534]" style={{width:row[2]}} /></div></div>)}</div></Card></div>;
}
