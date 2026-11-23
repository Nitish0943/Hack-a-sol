import Link from "next/link";
import { AlertCircle, ArrowRight, Calculator, ClipboardCheck, FileText, IndianRupee, Landmark, MessageSquareWarning, WalletCards } from "lucide-react";
import { DemoBanner } from "@/components/demo-banner";
import { Card, StatCard, StatusBadge } from "@/components/ui-kit";
import { CountUp, Reveal } from "@/components/motion";
import { TwinPipeline } from "@/components/twin-pipeline";

export default function FarmerDashboard() {
  return (
    <div>
      <DemoBanner />
      <section className="glass-green mb-6 flex flex-col gap-4 rounded-[28px] p-5 sm:flex-row sm:items-end sm:justify-between sm:p-8">
        <div><p className="text-sm text-green-100">Sunday, 22 November 2026</p><h2 className="mt-1 text-3xl font-bold sm:text-4xl">Namaste, Ramesh Kumar 🙏</h2><p className="mt-2 text-sm text-green-100">KS-CG-10482 · Khamtarai, Raipur</p></div>
        <div className="w-full rounded-xl bg-white/10 p-3 sm:w-64"><div className="flex justify-between text-xs"><span>Profile completion</span><span>85%</span></div><div className="mt-2 h-2 rounded-full bg-white/20"><div className="flow h-2 w-[85%] rounded-full" /></div></div>
      </section>
      <Reveal className="mb-6"><Link href="/farmer/eligibility" className="glass glass-btn flex items-center gap-4 rounded-3xl p-4 sm:p-5">
        <span className="pulse-ring grid size-12 shrink-0 place-items-center rounded-2xl bg-[#EAB308] text-slate-900"><ClipboardCheck className="size-6" /></span>
        <div className="min-w-0"><p className="text-xs font-bold uppercase tracking-wider text-[#CA9A04]">Your next best action</p><p className="font-bold">Check eligibility for Kisan Credit Card</p><p className="text-xs text-slate-500">You may unlock up to <CountUp to={24500} prefix="₹" /> in credit. Takes 2 minutes.</p></div>
        <ArrowRight className="ml-auto size-5 shrink-0 text-[#166534]" />
      </Link></Reveal>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Potential benefits" value="₹42,500" detail="3 schemes" icon={<WalletCards className="size-5" />} />
        <StatCard label="Applications" value="3" detail="1 under review" icon={<FileText className="size-5" />} tone="blue" />
        <StatCard label="Sanctioned" value="₹24,000" detail="Verified record" icon={<Landmark className="size-5" />} tone="yellow" />
        <StatCard label="Received" value="₹18,000" detail="Confirmed" icon={<IndianRupee className="size-5" />} />
        <StatCard label="Pending actions" value="4" detail="Profile & documents" icon={<AlertCircle className="size-5" />} tone="slate" />
      </div>

      <div className="mt-6"><TwinPipeline compact /></div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="min-w-0 space-y-6">
          <Card>
            <div className="mb-4 flex items-center justify-between"><div><h3 className="font-bold">Recommended schemes</h3><p className="mt-1 text-xs text-slate-500">Based on your demo profile</p></div><Link href="/farmer/schemes" className="text-sm font-semibold text-[#166534]">View all</Link></div>
            <div className="grid gap-3 md:grid-cols-3">
              {[["PM-KISAN","Income support","Potentially eligible","₹6,000 / year"],["PM-KMY","Pension support","Verification required","₹3,000 / month"],["Kisan Credit Card","Agricultural credit","Potentially eligible","Up to ₹24,500"]].map(([name,type,status,benefit]) => (
                <Link key={name} href="/farmer/schemes/pm-kisan" className="glass glass-btn rounded-2xl p-4"><div className="flex items-start justify-between gap-2"><p className="text-sm font-bold">{name}</p><StatusBadge status={status} /></div><p className="mt-2 text-xs text-slate-500">{type}</p><p className="mt-4 text-sm font-bold text-[#166534]">{benefit}</p></Link>
              ))}
            </div>
          </Card>
          <Card>
            <div className="mb-4 flex items-center justify-between"><h3 className="font-bold">Recent applications</h3><Link href="/farmer/applications" className="text-sm font-semibold text-[#166534]">Track all</Link></div>
            <div className="table-wrap"><table><thead><tr><th>Scheme</th><th>Reference</th><th>Submitted</th><th>Status</th><th></th></tr></thead><tbody>
              {[["PM-KISAN","KS-2026-10482","12 Nov 2026","Approved"],["PMFBY","CG-PMFBY-8821","08 Nov 2026","Under review"],["Kisan Credit Card","KCC-77421","29 Oct 2026","Documents required"]].map((row) => <tr key={row[1]}><td className="font-semibold">{row[0]}</td><td>{row[1]}</td><td>{row[2]}</td><td><StatusBadge status={row[3]} /></td><td><Link href="/farmer/applications/app-1" className="text-[#166534]"><ArrowRight className="size-4" /></Link></td></tr>)}
            </tbody></table></div>
          </Card>
        </div>
        <div className="space-y-6">
          <Card><h3 className="font-bold">Quick actions</h3><div className="mt-4 grid grid-cols-2 gap-3">{[
            ["/farmer/schemes","Find Schemes",ClipboardCheck],[ "/farmer/calculator","Calculate",Calculator],[ "/farmer/applications","Track application",FileText],[ "/farmer/grievances/new","Raise grievance",MessageSquareWarning],
          ].map(([href,label,Icon]) => <Link key={String(label)} href={String(href)} className="flex min-h-24 flex-col justify-between glass glass-btn rounded-2xl p-3 text-sm font-semibold"><Icon className="size-5 text-[#166534]" /><span>{String(label)}</span></Link>)}</div></Card>
          <Card><h3 className="font-bold">Recent activity</h3><div className="mt-4 space-y-4">{[
            ["PM-KISAN approved","₹6,000 benefit record","Today"],
            ["Discrepancy detected","Sanction amount mismatch","Yesterday"],
            ["Profile updated","Landholding changed to 2 acres","18 Nov"],
          ].map(([title,detail,date]) => <div key={title} className="flex gap-3"><span className="mt-1 size-2 shrink-0 rounded-full bg-[#166534]" /><div className="min-w-0"><p className="text-sm font-semibold">{title}</p><p className="text-xs text-slate-500">{detail}</p></div><p className="ml-auto shrink-0 text-[11px] text-slate-400">{date}</p></div>)}</div></Card>
        </div>
      </div>
    </div>
  );
}
