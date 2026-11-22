"use client";

import Link from "next/link";
import { ArrowLeft, Sprout, Tractor, ShieldCheck, Settings2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function LoginPage() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [role, setRole] = useState("farmer");
  const [mobileNumber, setMobileNumber] = useState("9876543210");
  const [otp, setOtp] = useState("123456");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingRole, setLoadingRole] = useState<"farmer" | "officer" | "admin" | null>(null);
  const router = useRouter();

  async function loginAsDemo(selectedRole: "farmer" | "officer" | "admin") {
    setError("");
    setLoadingRole(selectedRole);
    try {
      await authApi.demoLogin(selectedRole);
      router.push(
        selectedRole === "officer"
          ? "/officer/dashboard"
          : selectedRole === "admin"
            ? "/admin/dashboard"
            : "/farmer/dashboard",
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not sign in to the demo account.");
    } finally {
      setLoadingRole(null);
    }
  }

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
    <main className="grid min-h-screen bg-[#F8FAF5] lg:grid-cols-[1fr_420px]">
      <section className="hidden flex-col justify-between bg-[#166534] p-10 text-white lg:flex">
        <Link href="/" className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-white text-[#166534]"><Sprout /></span><span className="text-xl font-bold">KrishiSetu</span></Link>
        <div className="max-w-xl"><p className="text-sm font-semibold text-green-200">कृषि सेतु</p><h1 className="mt-3 text-5xl font-bold leading-tight">Every Farmer Deserves to Know What They Are Owed.</h1></div>
        <p className="text-sm text-green-100">Secure demo access · No banking credentials required</p>
      </section>
      <section className="flex items-center justify-center p-5">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500"><ArrowLeft className="size-4" /> Back to home</Link>
            <LanguageSwitcher />
          </div>
          <h1 className="text-3xl font-bold">Sign in to KrishiSetu</h1>
          <p className="mt-2 text-sm text-slate-500">Choose a demo account to open its portal. No details needed.</p>
          <div className="mt-6 space-y-3">
            {([
              ["farmer", "Farmer", "Open the farmer portal", Tractor],
              ["officer", "Government Officer", "Review applications and cases", ShieldCheck],
              ["admin", "Administrator", "Manage platform settings", Settings2],
            ] as const).map(([demoRole, label, description, Icon]) => (
              <button
                key={demoRole}
                type="button"
                disabled={loadingRole !== null || loading}
                onClick={() => loginAsDemo(demoRole)}
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left hover:border-green-300 hover:bg-green-50 disabled:opacity-60"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[#EAF4EC] text-[#166534]"><Icon className="size-5" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold">{loadingRole === demoRole ? "Signing in..." : `Continue as ${label}`}</span>
                  <span className="block text-xs text-slate-500">{description}</span>
                </span>
                <span className="text-[#166534]">→</span>
              </button>
            ))}
          </div>
          <div className="my-6 flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200" /><span>or use mobile OTP</span><span className="h-px flex-1 bg-slate-200" /></div>
          <p className="text-sm font-semibold">Sign in with mobile number</p>
          <p className="mt-1 text-xs text-slate-500">{step === "phone" ? "Demo OTP is 123456." : "Enter the demo OTP 123456."}</p>
          <div className="mt-7 space-y-5">
            {step === "phone" && <div><label className="mb-2 block text-sm font-semibold">Demo role</label><select className="field" value={role} onChange={(event) => setRole(event.target.value)}><option value="farmer">Farmer</option><option value="officer">Government Officer</option><option value="admin">Administrator</option></select></div>}
            {step === "phone" ? <div><label className="mb-2 block text-sm font-semibold">Mobile number</label><div className="flex"><span className="grid place-items-center rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 px-3 text-sm">+91</span><input className="field rounded-l-none" type="tel" value={mobileNumber} onChange={(event)=>setMobileNumber(event.target.value)} /></div></div> : <div><label className="mb-2 block text-sm font-semibold">One-time password</label><input className="field text-center text-xl tracking-[0.6em]" inputMode="numeric" value={otp} onChange={(event)=>setOtp(event.target.value)} /></div>}
            {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <button disabled={loading} onClick={continueLogin} className="w-full rounded-xl bg-[#166534] px-4 py-3 font-semibold text-white disabled:opacity-60">{loading ? "Please wait..." : step === "phone" ? "Send OTP" : "Verify & continue"}</button>
            {step === "otp" && <button onClick={() => setStep("phone")} className="w-full text-center text-sm font-semibold text-[#166534]">Change number</button>}
          </div>
          <p className="mt-6 text-center text-sm text-slate-500">New to KrishiSetu? <Link href="/register" className="font-semibold text-[#166534]">Create account</Link></p>
        </div>
      </section>
    </main>
  );
}
