import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, PageHeading, StatusBadge } from "@/components/ui-kit";

export default function ApplicationDetailPage() {
  return <div><Link href="/farmer/applications" className="mb-5 inline-flex items-center gap-2 text-sm text-slate-500"><ArrowLeft className="size-4" /> Applications</Link><PageHeading title="Kisan Credit Card Application" description="Reference KCC-77421" action={<StatusBadge status="Documents required" />} /><div className="grid gap-5 lg:grid-cols-[1fr_320px]"><Card><h3 className="font-bold">Application timeline</h3><div className="mt-5 space-y-5">{["Application submitted","Documents received","Additional evidence requested","Review pending"].map((item,i)=><div key={item} className="flex gap-3"><span className={`size-3 rounded-full ${i<3?"bg-[#166534]":"bg-slate-300"}`} /><div><p className="text-sm font-semibold">{item}</p><p className="text-xs text-slate-400">{i<3?["29 Oct","30 Oct","16 Nov"][i]: "Awaiting action"}</p></div></div>)}</div></Card><Card className="h-fit"><h3 className="font-bold">Pending action</h3><p className="mt-2 text-sm leading-6 text-slate-500">Upload land ownership or cultivation evidence to continue review.</p><button className="mt-4 w-full rounded-xl bg-[#166534] px-4 py-3 text-sm font-semibold text-white">Upload document</button></Card></div></div>;
}
