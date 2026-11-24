import Link from "next/link";
import { ArrowRight, Calculator, CheckCircle2, Landmark, Phone, Search, ShieldCheck, Sprout, UserPlus, WalletCards } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { CountUp, GlassCard, Reveal } from "@/components/motion";
import { MediaBanner } from "@/components/media-banner";

const features = [
  { icon: Search, title: "Smart Scheme Discovery", hi: "सही योजना खोजें", text: "Central and Chhattisgarh schemes in one place.", span: "md:col-span-2" },
  { icon: CheckCircle2, title: "Eligibility Checker", hi: "पात्रता जांचें", text: "Clear yes/no reasons, in plain words.", span: "" },
  { icon: Calculator, title: "Loan & Subsidy Calculator", hi: "ऋण व सब्सिडी", text: "Estimate benefits with live sliders.", span: "" },
  { icon: Landmark, title: "Application Tracking", hi: "आवेदन ट्रैक करें", text: "Every reference and status in one timeline.", span: "" },
  { icon: Phone, title: "IVR Assistance", hi: "फ़ोन पर मदद", text: "Works on any basic mobile phone.", span: "" },
];
const steps = [
  { icon: UserPlus, t: "Register", d: "Create your KrishiSetu Farmer ID in two minutes." },
  { icon: Search, t: "Discover", d: "See schemes that fit your land and crops." },
  { icon: CheckCircle2, t: "Check", d: "Know if you are eligible, and why." },
  { icon: WalletCards, t: "Track", d: "Follow every rupee from potential to received." },
];
const pipeline = [["Potential", 42500], ["Applied", 36000], ["Approved", 30000], ["Sanctioned", 24000], ["Disbursed", 20000], ["Received", 18000]] as const;
const schemes = [["PM-KISAN", "Income support", "₹6,000 / year"], ["PM Fasal Bima", "Crop insurance", "Up to ₹12,000"], ["Kisan Credit Card", "Agricultural credit", "Up to ₹24,500"], ["PM-KMY", "Pension support", "₹3,000 / month"]];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-clip">
      <nav className="sticky top-3 z-40 mx-auto mt-3 flex max-w-6xl items-center justify-between gap-2 px-3 sm:px-4">
        <div className="glass flex w-full items-center justify-between rounded-full py-2 pl-3 pr-2 sm:pl-4 border border-slate-200/90 shadow-md">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-full bg-[#166534] text-white shadow-lg shadow-green-900/20"><Sprout className="size-5" /></span>
            <span className="leading-4"><span className="block font-bold text-slate-900">KrishiSetu</span><span className="text-[11px] text-slate-600 font-semibold">कृषि सेतु</span></span>
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <LanguageSwitcher />
            <Link href="/login" className="rounded-full px-3 py-2 text-xs font-bold text-slate-800 hover:bg-white/80 sm:text-sm transition">Log in</Link>
            <Link href="/register" className="glass-btn glass-green rounded-full px-4 py-2.5 text-xs font-bold text-white sm:text-sm shadow-sm">Register</Link>
          </div>
        </div>
      </nav>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-14 sm:px-8 md:grid-cols-[1.05fr_.95fr] md:pt-20">
        <div>
          <Reveal><span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold text-[#166534] border border-emerald-300/80 shadow-xs"><ShieldCheck className="size-4" /> Transparent agricultural services</span></Reveal>
          <Reveal delay={100}><h1 className="mt-6 text-5xl font-bold leading-[1.04] tracking-tight text-[#0f2415] sm:text-7xl">Know Your Benefits.<br /><span className="bg-gradient-to-r from-[#166534] via-[#22a559] to-[#CA9A04] bg-clip-text text-transparent">Track Every Rupee.</span></h1></Reveal>
          <Reveal delay={200}><p className="mt-6 max-w-xl text-base leading-7 text-slate-700 font-medium sm:text-lg">Discover government schemes, understand your agricultural benefits, track applications and access assistance through your phone.</p></Reveal>
          <Reveal delay={300} className="mt-9 flex flex-wrap gap-3">
            <Link href="/register" className="glass-btn glass-green pulse-ring inline-flex items-center gap-2 rounded-full px-7 py-4 text-sm font-bold text-white shadow-md">Get Started <ArrowRight className="size-4" /></Link>
            <a href="#features" className="glass-btn glass inline-flex items-center rounded-full px-7 py-4 text-sm font-bold text-slate-900 border border-slate-200/90 shadow-sm">Explore Features</a>
          </Reveal>
          <Reveal delay={400} className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-700 font-semibold">
            {["English · हिंदी · छत्तीसगढ़ी", "Chhattisgarh focused", "Works on basic phones"].map((x) => <span key={x} className="flex items-center gap-2"><CheckCircle2 className="size-4 text-[#166534]" />{x}</span>)}
          </Reveal>
        </div>

        <Reveal delay={200}>
          <GlassCard tilt className="float-slow glass-strong p-5 border border-white/90 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-4"><div><p className="text-xs text-slate-600 font-medium">Demo farmer dashboard</p><p className="mt-1 font-bold text-slate-900 text-base">Ramesh Kumar</p></div><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-[#166534] border border-emerald-300">85% complete</span></div>
            <div className="grid grid-cols-2 gap-3 py-5">
              <div className="glass-green rounded-2xl p-4 shadow-sm"><p className="text-xs text-emerald-100 font-medium">Potential Benefits</p><p className="mt-2 text-2xl font-extrabold text-white"><CountUp to={42500} prefix="₹" /></p></div>
              <div className="glass rounded-2xl p-4 border border-slate-200/80 shadow-xs"><p className="text-xs text-slate-600 font-semibold">Confirmed Received</p><p className="mt-2 text-2xl font-extrabold text-slate-900"><CountUp to={18000} prefix="₹" /></p></div>
            </div>
            <div className="space-y-2">
              {[["PM-KISAN Income Support", "₹6,000", "Received"], ["PM Fasal Bima Yojana", "₹12,000", "Under review"], ["Kisan Credit Card", "₹24,500", "Potential"]].map(([n, a, s]) => (
                <div key={n} className="flex items-center justify-between rounded-xl bg-white/80 border border-slate-200/60 px-3 py-3"><div><p className="text-sm font-bold text-slate-900">{n}</p><p className="text-xs text-slate-600 font-medium">{s}</p></div><p className="text-sm font-extrabold text-[#166534]">{a}</p></div>
              ))}
            </div>
          </GlassCard>
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <Reveal><p className="text-xs font-bold uppercase tracking-[.18em] text-[#166534]">How it works</p><h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Four simple steps</h2></Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal key={s.t} delay={i * 90}><GlassCard className="h-full p-6"><span className="grid size-12 place-items-center rounded-2xl bg-[#166534] text-white shadow-lg shadow-green-900/20"><s.icon className="size-5" /></span><p className="mt-1 text-xs font-bold text-[#CA9A04]">STEP {i + 1}</p><h3 className="mt-1 text-lg font-bold">{s.t}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{s.d}</p></GlassCard></Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <Reveal>
          <MediaBanner name="field" className="min-h-[320px]">
            <div className="flex min-h-[320px] flex-col justify-end p-7 text-white sm:p-10">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-green-200">Built for the field</p>
              <h2 className="mt-2 max-w-xl text-3xl font-bold sm:text-4xl">From the village to the bank account, in your own language</h2>
            </div>
          </MediaBanner>
        </Reveal>
      </section>

      <section id="features" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-12 sm:px-8">
        <Reveal><p className="text-xs font-bold uppercase tracking-[.18em] text-[#166534]">One platform, complete visibility</p><h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Everything a farmer needs</h2></Reveal>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 70} className={f.span}><GlassCard tilt className="h-full p-6"><span className="grid size-11 place-items-center rounded-2xl bg-white/80 text-[#166534] shadow"><f.icon className="size-5" /></span><h3 className="mt-4 font-bold">{f.title}</h3><p className="text-xs font-semibold text-[#166534]">{f.hi}</p><p className="mt-2 text-sm leading-6 text-slate-600">{f.text}</p></GlassCard></Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <Reveal>
          <GlassCard className="glass-strong p-6 sm:p-10">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#166534]">Financial Digital Twin</p>
            <h2 className="mt-2 max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">See where every rupee is, from potential to received</h2>
            <div className="mt-8 space-y-3">
              {pipeline.map(([label, amt], i) => (
                <div key={label} className="grid grid-cols-[88px_1fr_84px] items-center gap-3 text-sm sm:grid-cols-[110px_1fr_100px]">
                  <span className="font-semibold text-slate-700">{label}</span>
                  <div className="h-3.5 overflow-hidden rounded-full bg-white/70 shadow-inner"><div className={i === 5 ? "flow h-full rounded-full" : "h-full rounded-full bg-gradient-to-r from-[#86EFAC] to-[#166534]"} style={{ width: `${(amt / 42500) * 100}%` }} /></div>
                  <span className="text-right font-bold tabular-nums">₹{amt.toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
            <p className="mt-5 text-xs text-slate-500">Sample demonstration data. Amounts are never shown as verified unless an authorised record confirms them.</p>
          </GlassCard>
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <Reveal><h2 className="text-3xl font-bold tracking-tight">Featured schemes</h2></Reveal>
        <div className="mt-6 flex snap-x gap-4 overflow-x-auto pb-4">
          {schemes.map(([n, t, b]) => (
            <Link key={n} href="/farmer/schemes" className="snap-start"><GlassCard tilt className="w-64 shrink-0 p-5"><p className="text-xs font-semibold text-slate-500">{t}</p><p className="mt-1 text-lg font-bold">{n}</p><p className="mt-6 font-bold text-[#166534]">{b}</p></GlassCard></Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <Reveal>
          <div className="glass-green flex flex-col items-start justify-between gap-6 rounded-[32px] p-7 sm:flex-row sm:items-center sm:p-10">
            <div><p className="text-sm font-semibold text-green-100">Phone assistance available</p><h2 className="mt-2 text-2xl font-bold sm:text-3xl">Use KrishiSetu even with a basic mobile phone</h2></div>
            <Link href="/farmer/ivr" className="glass-btn inline-flex items-center gap-2 rounded-full bg-[#EAB308] px-6 py-3.5 font-bold text-slate-900 shadow-lg"><Phone className="size-4" /> View IVR Guide</Link>
          </div>
        </Reveal>
      </section>

      <footer className="relative mt-10">
        <svg aria-hidden className="pointer-events-none absolute inset-x-0 bottom-full h-24 w-full text-[#166534]/20" viewBox="0 0 1200 100" preserveAspectRatio="none">
          {Array.from({ length: 60 }).map((_, i) => <path key={i} className="field-sway" style={{ animationDelay: `${-(i % 7) * 0.6}s`, transformOrigin: `${i * 20 + 10}px 100px` }} d={`M${i * 20 + 10} 100 Q${i * 20 + 6} ${50 - (i % 5) * 6} ${i * 20 + 12} ${14 + (i % 4) * 8}`} stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" />)}
        </svg>
        <div className="glass rounded-none border-x-0 border-b-0">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-7 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <p>© 2026 KrishiSetu. Demonstration platform.</p>
            <div className="flex gap-5"><Link href="/login">Login</Link><Link href="/register">Register</Link></div>
          </div>
        </div>
      </footer>
    </main>
  );
}
