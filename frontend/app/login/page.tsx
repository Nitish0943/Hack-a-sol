"use client";

import Link from "next/link";
import { ArrowLeft, Building2, ShieldCheck, Sprout, Tractor, UserCog, CheckCircle2 } from "lucide-react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { LanguageSwitcher } from "@/components/language-switcher";

const roles = [
  { id: "farmer", label: "Farmer", hi: "किसान", icon: Tractor },
  { id: "officer", label: "Officer", hi: "अधिकारी", icon: Building2 },
  { id: "admin", label: "Admin", hi: "प्रशासक", icon: UserCog },
];
const home = (r: string) => (r === "officer" ? "/officer/dashboard" : r === "admin" ? "/admin/dashboard" : "/farmer/dashboard");

export default function LoginPage() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [role, setRole] = useState("farmer");
  const [mobileNumber, setMobileNumber] = useState("9876543210");
  const [digits, setDigits] = useState<string[]>("123456".split(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const boxes = useRef<(HTMLInputElement | null)[]>([]);
  const [otp, setOtp] = useState("123456");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const otp = digits.join("");

  async function continueLogin() {
    setError(""); setLoading(true);
    try {
      if (step === "phone") { await authApi.sendOtp(mobileNumber); setStep("otp"); }
      else { await authApi.verifyOtp(mobileNumber, otp, role); router.push(home(role)); }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Demo authentication failed.");
    } finally { setLoading(false); }
  }

  async function demoLogin(r: string) {
    setError(""); setLoading(true);
    try { await authApi.sendOtp("9876543210"); await authApi.verifyOtp("9876543210", "123456", r); router.push(home(r)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Demo authentication failed."); setLoading(false); }
  }

  function setDigit(i: number, v: string) {
    const d = v.replace(/\D/g, "");
    if (d.length > 1) { const next = d.slice(0, 6).padEnd(6, " ").split(""); setDigits(next.map((x) => x.trim())); boxes.current[Math.min(d.length, 5)]?.focus(); return; }
    setDigits((p) => p.map((x, k) => (k === i ? d : x)));
    if (d && i < 5) boxes.current[i + 1]?.focus();
  async function continueLogin() {
    setError("");
    setLoading(true);
    try {
      if (step === "phone") {
        await authApi.sendOtp(mobileNumber);
        setStep("otp");
      } else {
        await authApi.verifyOtp(mobileNumber, otp, role);
        router.push(role === "officer" ? "/officer/dashboard" : role === "admin" ? "/admin/dashboard" : "/farmer/dashboard");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Demo authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <section className="relative hidden flex-col justify-between p-10 lg:flex">
        <Link href="/" className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-full bg-[#166534] text-white shadow-lg"><Sprout /></span><span className="text-xl font-bold text-[#14301e]">KrishiSetu</span></Link>
        <div className="max-w-xl">
          <p className="text-sm font-bold text-[#166534]">कृषि सेतु</p>
          <h1 className="mt-3 text-5xl font-bold leading-[1.08] text-[#14301e]">Every Farmer Deserves to Know What They Are Owed.</h1>
          <div className="mt-8 space-y-3">
            {["Check schemes you qualify for", "Track every application", "See your money from potential to received"].map((t, i) => (
              <div key={t} className="glass float-slow flex w-fit items-center gap-3 rounded-full py-2.5 pl-3 pr-5 text-sm font-semibold" style={{ animationDelay: `${-i * 1.6}s` }}><CheckCircle2 className="size-5 text-[#166534]" />{t}</div>
            ))}
          </div>
        </div>
        <p className="flex items-center gap-2 text-sm text-slate-600"><ShieldCheck className="size-4 text-[#166534]" /> Secure demo access · No banking credentials required</p>
      </section>

      <section className="flex items-center justify-center p-4 sm:p-8">
        <div className="glass glass-strong w-full max-w-md rounded-[32px] p-6 sm:p-8">
          <div className="mb-7 flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-600"><ArrowLeft className="size-4" /> Home</Link>
            <LanguageSwitcher />
          </div>
          <h1 className="text-3xl font-bold">{step === "phone" ? "Welcome back" : "Verify your number"}</h1>
          <p className="mt-2 text-sm text-slate-600">{step === "phone" ? "Choose who you are and enter your mobile number." : `Enter the demo OTP 123456 sent to +91 ${mobileNumber}.`}</p>

          <div className="mt-6 space-y-5">
            {step === "phone" ? (<>
              <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Role">
                {roles.map((r) => (
                  <button key={r.id} role="radio" aria-checked={role === r.id} onClick={() => setRole(r.id)} className={`glass-btn flex flex-col items-center gap-1 rounded-2xl px-2 py-3 text-xs font-semibold ${role === r.id ? "glass-green" : "glass"}`}>
                    <r.icon className="size-5" />{r.label}<span className="text-[10px] opacity-70">{r.hi}</span>
                  </button>
                ))}
              </div>
              <div><label className="mb-2 block text-sm font-semibold">Mobile number</label><div className="flex gap-2"><span className="glass grid place-items-center rounded-2xl px-4 text-sm font-semibold">+91</span><input className="field" type="tel" inputMode="numeric" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} /></div></div>
            </>) : (
              <div><label className="mb-3 block text-sm font-semibold">One-time password</label>
                <div className="flex justify-between gap-2">{digits.map((d, i) => (
                  <input key={i} ref={(el) => { boxes.current[i] = el; }} value={d} inputMode="numeric" maxLength={6} aria-label={`Digit ${i + 1}`} onChange={(e) => setDigit(i, e.target.value)} onKeyDown={(e) => { if (e.key === "Backspace" && !d && i > 0) boxes.current[i - 1]?.focus(); }} className="field !px-0 text-center text-2xl font-bold" style={{ height: 56 }} />
                ))}</div>
              </div>
            )}
            {error && <p className="rounded-2xl bg-red-50/80 px-3 py-2 text-sm text-red-700">{error}</p>}
            <button disabled={loading} onClick={continueLogin} className="glass-btn glass-green w-full rounded-full px-4 py-4 font-semibold disabled:opacity-60">{loading ? "Please wait..." : step === "phone" ? "Send OTP" : "Verify & continue"}</button>
      <section className="flex items-center justify-center p-5">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500"><ArrowLeft className="size-4" /> Back to home</Link>
            <LanguageSwitcher />
          </div>
          <h1 className="text-3xl font-bold">{step === "phone" ? "Welcome back" : "Verify your number"}</h1>
          <p className="mt-2 text-sm text-slate-500">{step === "phone" ? "Choose a demo role and enter your mobile number." : "Enter the demo OTP 123456."}</p>
          <div className="mt-7 space-y-5">
            {step === "phone" && <div><label className="mb-2 block text-sm font-semibold">Demo role</label><select className="field" value={role} onChange={(event) => setRole(event.target.value)}><option value="farmer">Farmer</option><option value="officer">Government Officer</option><option value="admin">Administrator</option></select></div>}
            {step === "phone" ? <div><label className="mb-2 block text-sm font-semibold">Mobile number</label><div className="flex"><span className="grid place-items-center rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 px-3 text-sm">+91</span><input className="field rounded-l-none" type="tel" value={mobileNumber} onChange={(event)=>setMobileNumber(event.target.value)} /></div></div> : <div><label className="mb-2 block text-sm font-semibold">One-time password</label><input className="field text-center text-xl tracking-[0.6em]" inputMode="numeric" value={otp} onChange={(event)=>setOtp(event.target.value)} /></div>}
            {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <button disabled={loading} onClick={continueLogin} className="w-full rounded-xl bg-[#166534] px-4 py-3 font-semibold text-white disabled:opacity-60">{loading ? "Please wait..." : step === "phone" ? "Send OTP" : "Verify & continue"}</button>
            {step === "otp" && <button onClick={() => setStep("phone")} className="w-full text-center text-sm font-semibold text-[#166534]">Change number</button>}
          </div>

          <div className="mt-6 border-t border-white/70 pt-5">
            <p className="mb-3 text-center text-xs font-bold uppercase tracking-wider text-[#CA9A04]">Demo login for judges</p>
            <div className="grid grid-cols-3 gap-2">{roles.map((r) => <button key={r.id} disabled={loading} onClick={() => demoLogin(r.id)} className="glass glass-btn rounded-full px-2 py-2.5 text-xs font-bold text-[#166534] disabled:opacity-60">{r.label}</button>)}</div>
          </div>
          <p className="mt-5 text-center text-sm text-slate-600">New to KrishiSetu? <Link href="/register" className="font-semibold text-[#166534]">Create account</Link></p>
        </div>
      </section>
    </main>
  );
}
