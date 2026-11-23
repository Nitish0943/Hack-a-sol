import { CountUp, Reveal } from "@/components/motion";

const stages = [
  { k: "Potential", hi: "संभावित", v: 42500, note: "Estimate" },
  { k: "Applied", hi: "आवेदन", v: 36000, note: "Recorded" },
  { k: "Approved", hi: "स्वीकृत", v: 30000, note: "Recorded" },
  { k: "Sanctioned", hi: "मंज़ूर", v: 24000, note: "Officer verified" },
  { k: "Disbursed", hi: "वितरित", v: 18000, note: "System record" },
  { k: "Received", hi: "प्राप्त", v: 18000, note: "Confirmed" },
];

/** Animated money journey. Demo values; labels never claim more than the record says. */
export function TwinPipeline({ compact = false }: { compact?: boolean }) {
  return (
    <div className="glass glass-strong rounded-3xl p-5 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#166534]">Financial Digital Twin</p><h3 className="mt-1 text-xl font-bold">Where is my money?</h3></div>
        <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-slate-600">Demo ledger</span>
      </div>
      <div className="relative mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <div className="pointer-events-none absolute left-[8%] right-[8%] top-[34px] hidden h-1.5 overflow-hidden rounded-full bg-white/70 lg:block"><div className="flow h-full w-full opacity-80" /></div>
        {stages.map((s, i) => (
          <Reveal key={s.k} delay={i * 80}>
            <div className="relative flex items-center gap-4 lg:flex-col lg:text-center">
              <span className={`relative z-10 grid size-[68px] shrink-0 place-items-center rounded-full text-lg font-bold shadow-lg ${i === 5 ? "glass-green" : "glass text-[#166534]"}`}>{i + 1}</span>
              <div className="min-w-0">
                <p className="font-bold">{s.k} <span className="text-xs font-semibold text-slate-400">{s.hi}</span></p>
                <p className="text-xl font-bold tabular-nums text-[#14301e]"><CountUp to={s.v} prefix="₹" /></p>
                {!compact && <p className="text-[11px] text-slate-500">{s.note}</p>}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
