"use client";
import { usePathname } from "next/navigation";

type Scene = "field" | "sunrise" | "leaves" | "coins" | "waves" | "grid";

function sceneFor(p: string): Scene {
  if (p === "/") return "field";
  if (p.startsWith("/login") || p.startsWith("/register")) return "sunrise";
  if (p.startsWith("/farmer/schemes") || p.startsWith("/farmer/eligibility")) return "leaves";
  if (p.startsWith("/farmer/calculator") || p.startsWith("/farmer/benefits") || p.startsWith("/farmer/applications")) return "coins";
  if (p.startsWith("/farmer/ivr")) return "waves";
  if (p.startsWith("/officer") || p.startsWith("/admin")) return "grid";
  return "field";
}

const rnd = (i: number, m: number) => (i * 37 + 11) % m;
const seeds = Array.from({ length: 14 }, (_, i) => i);

function Wheat({ rows = 2 }: { rows?: number }) {
  return (
    <svg className="absolute inset-x-0 bottom-0 h-40 w-full text-[#166534]" viewBox="0 0 1200 160" preserveAspectRatio="none">
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: 56 }).map((_, i) => {
          const x = i * 22 + (r ? 11 : 0);
          return <path key={`${r}-${i}`} className="field-sway" style={{ animationDelay: `${-((i + r * 3) % 8) * 0.55}s`, transformOrigin: `${x}px 160px`, opacity: r ? 0.12 : 0.22 }} d={`M${x} 160 Q${x - 4} ${90 - rnd(i, 5) * 6} ${x + 2} ${40 + rnd(i + r, 4) * 12}`} stroke="currentColor" strokeWidth={r ? 2 : 3} fill="none" strokeLinecap="round" />;
        })
      )}
    </svg>
  );
}

function SceneLayer({ scene }: { scene: Scene }) {
  switch (scene) {
    case "field":
      return (<><div className="sun-glow" /><Wheat /></>);
    case "sunrise":
      return (
        <>
          <div className="sun-rays" /><div className="sun-rise" />
          <svg className="absolute inset-x-0 bottom-0 h-1/3 w-full" viewBox="0 0 1200 300" preserveAspectRatio="none">
            <path d="M0 200 Q300 110 600 190 T1200 150 V300 H0Z" fill="#16653422" /><path d="M0 250 Q320 170 640 240 T1200 210 V300 H0Z" fill="#16653433" />
          </svg>
        </>
      );
    case "leaves":
      return (<>{Array.from({ length: 9 }).map((_, i) => (
        <svg key={i} className="leaf" viewBox="0 0 24 24" style={{ left: `${rnd(i, 95)}%`, animationDuration: `${18 + rnd(i, 14)}s`, animationDelay: `${-rnd(i + 3, 18)}s`, width: 22 + rnd(i, 26), ["--r" as string]: `${rnd(i, 120) - 60}deg` }}>
          <path d="M12 2C6 6 4 12 6 20c8-1 14-7 12-18-2 0-4 0-6 0Z" fill="currentColor" />
        </svg>))}</>);
    case "coins":
      return (<>
        <div className="ripple r1" /><div className="ripple r2" /><div className="ripple r3" />
        {Array.from({ length: 10 }).map((_, i) => (<span key={i} className="coin" style={{ left: `${5 + rnd(i, 88)}%`, animationDuration: `${12 + rnd(i, 10)}s`, animationDelay: `${-rnd(i + 5, 14)}s` }}>₹</span>))}
      </>);
    case "waves":
      return (<>
        <div className="ripple r1 phone-ring" /><div className="ripple r2 phone-ring" /><div className="ripple r3 phone-ring" />
        <div className="eq">{Array.from({ length: 48 }).map((_, i) => <i key={i} style={{ animationDelay: `${-rnd(i, 20) / 10}s`, animationDuration: `${0.9 + rnd(i, 9) / 10}s` }} />)}</div>
      </>);
    case "grid":
      return (<><div className="data-grid" /><div className="scan-line" /></>);
  }
}

export function LivingField() {
  const scene = sceneFor(usePathname() || "/");
  return (
    <div className="living-field" data-scene={scene} aria-hidden="true">
      <div className="blob b1" /><div className="blob b2" /><div className="blob b3" /><div className="blob b4" />
      <SceneLayer scene={scene} />
      {seeds.map((i) => (
        <span key={i} className="seed" style={{ left: `${(i * 37 + 8) % 100}%`, animationDuration: `${14 + ((i * 5) % 12)}s`, animationDelay: `${-((i * 3) % 14)}s`, ["--dx" as string]: `${(i % 2 ? 1 : -1) * (30 + ((i * 11) % 60))}px` }} />
      ))}
      <div className="grain" />
    </div>
  );
}
