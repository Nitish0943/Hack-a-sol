import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Card, PageHeading, StatusBadge } from "@/components/ui-kit";

export default function SchemeDetailPage({ params }: { params: Promise<{ schemeId: string }> }) {
  void params;
  return (
    <div>
      <Link href="/farmer/schemes" className="mb-5 inline-flex items-center gap-2 text-sm text-slate-500"><ArrowLeft className="size-4" /> All schemes</Link>
      <PageHeading title="PM-KISAN Income Support" description="Central government · Income support" action={<StatusBadge status="Potentially eligible" />} />
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5"><Card><h3 className="font-bold">About this scheme</h3><p className="mt-3 text-sm leading-7 text-slate-600">A sample income-support scheme record. The platform uses a configured policy version to explain potential eligibility and benefit estimates; it does not confirm official approval.</p><h4 className="mt-5 font-semibold">Benefits</h4><p className="mt-2 text-sm text-slate-600">Estimated support: ₹6,000 per financial year, subject to official eligibility and policy conditions.</p></Card><Card><h3 className="font-bold">Eligibility requirements</h3><ul className="mt-4 space-y-3 text-sm text-slate-600">{["State or union territory applicant","Cultivator or landholder category","Available landholding record","Active mobile number"].map((item) => <li key={item} className="flex gap-3"><span className="mt-1 size-2 rounded-full bg-[#166534]" />{item}</li>)}</ul></Card></div>
        <Card className="h-fit"><h3 className="font-bold">Application information</h3><dl className="mt-4 space-y-4 text-sm"><div><dt className="text-slate-400">Policy version</dt><dd className="mt-1 font-semibold">2026-CG-PMKS-01</dd></div><div><dt className="text-slate-400">Last updated</dt><dd className="mt-1 font-semibold">18 Nov 2026</dd></div><div><dt className="text-slate-400">Source</dt><dd className="mt-1 font-semibold">Official policy portal (demo link)</dd></div></dl><Link href="/farmer/eligibility" className="mt-5 block rounded-xl bg-[#166534] px-4 py-3 text-center text-sm font-semibold text-white">Check my eligibility</Link><a href="#" className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold">Official application <ExternalLink className="size-4" /></a></Card>
      </div>
    </div>
  );
}
