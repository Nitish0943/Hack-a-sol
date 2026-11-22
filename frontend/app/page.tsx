import Link from "next/link";
import { ArrowRight, Calculator, CheckCircle2, Landmark, Phone, Search, ShieldCheck, Sprout, WalletCards } from "lucide-react";

const features = [
  { icon: Search, title: "Smart Scheme Discovery", text: "Find relevant central and Chhattisgarh schemes in one place." },
  { icon: CheckCircle2, title: "Eligibility Checker", text: "Understand matching conditions with clear explanations." },
  { icon: Calculator, title: "Loan & Subsidy Calculator", text: "Estimate benefits using configured policy assumptions." },
  { icon: WalletCards, title: "Financial Digital Twin", text: "Track potential, sanctioned and confirmed benefit amounts separately." },
  { icon: Landmark, title: "Application Tracking", text: "Keep your application references and status history together." },
  { icon: Phone, title: "IVR Assistance", text: "Access important information through a simple phone menu." },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#F8FAF5]">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-[#166534] text-white"><Sprout className="size-6" /></span>
          <div><span className="block text-lg font-bold leading-5">KrishiSetu</span><span className="text-xs text-slate-500">कृषि सेतु</span></div>
        </Link>
        <div className="flex items-center gap-2">
          <select aria-label="Language" className="hidden rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm sm:block"><option>English</option><option>हिन्दी</option></select>
          <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700">Log in</Link>
          <Link href="/register" className="rounded-lg bg-[#166534] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#14532d]">Register</Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-10 sm:px-8 md:grid-cols-[1.1fr_.9fr] md:pt-16">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-green-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#166534]">
            <ShieldCheck className="size-4" /> Transparent agricultural services
          </div>
          <h1 className="max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight text-[#1F2937] sm:text-6xl">Know Your Benefits.<br /><span className="text-[#166534]">Track Every Rupee.</span></h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">Discover government schemes, understand your agricultural benefits, track applications and access assistance through your phone.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register" className="inline-flex items-center gap-2 rounded-xl bg-[#166534] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-green-900/10">Get Started <ArrowRight className="size-4" /></Link>
            <a href="#features" className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700">Explore Features</a>
          </div>
          <div className="mt-8 flex flex-wrap gap-5 text-sm text-slate-600"><span className="flex items-center gap-2"><CheckCircle2 className="size-4 text-[#166534]" /> Hindi & English</span><span className="flex items-center gap-2"><CheckCircle2 className="size-4 text-[#166534]" /> Chhattisgarh focused</span></div>
        </div>
        <div className="relative rounded-[28px] border border-green-100 bg-white p-5 shadow-[0_30px_80px_rgba(22,101,52,.12)]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4"><div><p className="text-xs text-slate-400">Demo farmer dashboard</p><p className="mt-1 font-bold">Ramesh Kumar</p></div><span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-[#166534]">85% complete</span></div>
          <div className="grid grid-cols-2 gap-3 py-5">
            <div className="rounded-2xl bg-[#166534] p-4 text-white"><p className="text-xs opacity-75">Potential Benefits</p><p className="mt-2 text-2xl font-bold">₹42,500</p></div>
            <div className="rounded-2xl border border-slate-100 p-4"><p className="text-xs text-slate-500">Confirmed Received</p><p className="mt-2 text-2xl font-bold text-slate-900">₹18,000</p></div>
          </div>
          <div className="space-y-2">
            {[["PM-KISAN Income Support","₹6,000","Received"],["PM Fasal Bima Yojana","₹12,000","Under review"],["Kisan Credit Card","₹24,500","Potential"]].map(([name,amount,status]) => (
              <div key={name} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-3"><div><p className="text-sm font-semibold">{name}</p><p className="text-xs text-slate-400">{status}</p></div><p className="text-sm font-bold">{amount}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#166534]">One platform, complete visibility</p>
          <h2 className="mt-2 max-w-xl text-3xl font-bold tracking-tight">From application to confirmed payment</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{features.map((feature) => (
            <div key={feature.title} className="rounded-2xl border border-slate-200 p-5"><span className="grid size-11 place-items-center rounded-xl bg-[#EAF4EC] text-[#166534]"><feature.icon className="size-5" /></span><h3 className="mt-4 font-bold">{feature.title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{feature.text}</p></div>
          ))}</div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8"><div className="flex flex-col items-start justify-between gap-6 rounded-[24px] bg-[#166534] p-7 text-white sm:flex-row sm:items-center sm:p-10"><div><p className="text-sm font-semibold text-green-100">Phone assistance available</p><h2 className="mt-2 text-2xl font-bold">Use KrishiSetu even with a basic mobile phone</h2></div><Link href="/farmer/ivr" className="inline-flex items-center gap-2 rounded-xl bg-[#EAB308] px-5 py-3 font-bold text-slate-900"><Phone className="size-4" /> View IVR Guide</Link></div></section>
      <footer className="border-t border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-7 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8"><p>© 2026 KrishiSetu. Demonstration platform.</p><div className="flex gap-5"><Link href="/login">Login</Link><Link href="/register">Register</Link></div></div></footer>
    </main>
  );
}