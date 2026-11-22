"use client";

import Link from "next/link";
import { ArrowLeft, Check, Lock, Phone, ShieldCheck, Sprout, UserCheck } from "lucide-react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useTranslation } from "@/lib/i18n/context";

export default function LoginPage() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [role, setRole] = useState<"farmer" | "officer" | "admin">("farmer");
  const [phone, setPhone] = useState("9876543210");
  const [otp, setOtp] = useState("123456");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t, locale } = useTranslation();

  const handleRoleSelect = (r: "farmer" | "officer" | "admin") => {
    setRole(r);
    if (r === "farmer") setPhone("9876543210");
    else if (r === "officer") setPhone("9876543211");
    else setPhone("9876543212");
  };

  const handleLogin = async () => {
    if (step === "phone") {
      setStep("otp");
      return;
    }

    setLoading(true);
    try {
      await fetch("http://localhost:8000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp, role }),
      }).catch(() => null);
    } catch {
      // ignore
    }

    setTimeout(() => {
      setLoading(false);
      if (role === "officer") router.push("/officer/dashboard");
      else if (role === "admin") router.push("/admin/dashboard");
      else router.push("/farmer/dashboard");
    }, 400);
  };

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_480px] text-slate-100 relative">
      {/* Left Visual Brand Column */}
      <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#06180E]/90 via-[#0A2616]/80 to-[#041209]/95 p-12 text-white lg:flex border-r border-white/10 backdrop-blur-3xl">
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-slate-950 shadow-lg border border-white/30">
              <Sprout className="size-7 text-slate-950" />
            </span>
            <div>
              <span className="text-2xl font-black tracking-tight leading-none font-display">KrishiSetu</span>
              <span className="block text-xs font-bold text-emerald-400 mt-1 font-mono">कृषि सेतु · Transparency Portal</span>
            </div>
          </Link>
          <LanguageSwitcher showAudioPill={false} />
        </div>

        <div className="relative z-10 max-w-lg my-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3.5 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
            <ShieldCheck className="size-4" /> GT-01 Policy & Subsidy Intelligence
          </span>
          <h1 className="text-4xl xl:text-5xl font-extrabold leading-tight font-display">
            {locale === "cghi"
              ? "अपन फायदा जानव। हर रुपिया के हिसाब रखव।"
              : locale === "hi"
                ? "हर किसान का अधिकार। पारदर्शी हिसाब, सही समय पर लाभ।"
                : "Every Farmer Deserves to Know What They Are Owed."}
          </h1>
          <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
            Consolidated benefit ledger, deterministic scheme eligibility, discrepancy alerts, and phone IVR assistance for rural Indian cultivators.
          </p>

          <div className="pt-2 grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 backdrop-blur-md">
              <p className="text-xl font-bold text-amber-300 font-mono">₹42.5K</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Sample Entitlement</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 backdrop-blur-md">
              <p className="text-xl font-bold text-white font-mono">6 Lifecycle</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Ledger Stages</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 backdrop-blur-md">
              <p className="text-xl font-bold text-emerald-400 font-mono">1800-SETU</p>
              <p className="text-[11px] text-slate-400 mt-0.5">IVR Helpline</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-400 border-t border-white/10 pt-4 flex justify-between font-mono">
          <span>Demonstration Environment · Safe Sandbox</span>
          <span>Zero plaintext Aadhaar storage</span>
        </div>
      </section>

      {/* Right Login Action Card */}
      <section className="flex items-center justify-center p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition"
            >
              <ArrowLeft className="size-4" /> {t("common.backToHome")}
            </Link>
            <div className="lg:hidden">
              <LanguageSwitcher showAudioPill={false} />
            </div>
          </div>

          <div className="glass-panel p-7 sm:p-8 space-y-6 border border-white/15 shadow-2xl">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <UserCheck className="size-5" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-white font-display">
                  {step === "phone" ? "Demo Workspace Login" : "Enter Verification OTP"}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {step === "phone" ? "Choose a prototype persona or enter mobile" : "Use demo verification code 123456"}
                </p>
              </div>
            </div>

            {/* Role Quick Selector */}
            {step === "phone" && (
              <div>
                <label className="mb-2 block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Select Role Persona
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "farmer", label: "Farmer", sub: "Ramesh Kumar" },
                    { id: "officer", label: "Officer", sub: "Anita Verma" },
                    { id: "admin", label: "Admin", sub: "Platform" },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleRoleSelect(r.id as any)}
                      className={`rounded-xl border p-2.5 text-left transition cursor-pointer ${
                        role === r.id
                          ? "border-emerald-400 bg-emerald-500/20 shadow-sm ring-1 ring-emerald-400/40"
                          : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{r.label}</span>
                        {role === r.id && <Check className="size-3.5 text-emerald-400" />}
                      </div>
                      <span className="block text-[10px] text-slate-400 truncate mt-0.5 font-mono">{r.sub}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Inputs */}
            <div className="space-y-4">
              {step === "phone" ? (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                    Mobile Number (मोबाइल नंबर)
                  </label>
                  <div className="flex rounded-xl">
                    <span className="grid place-items-center rounded-l-xl border border-r-0 border-white/15 bg-white/5 px-3.5 text-xs font-mono font-bold text-slate-400">
                      +91
                    </span>
                    <input
                      className="field rounded-l-none font-mono"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                    One-Time Password (OTP)
                  </label>
                  <input
                    className="field text-center text-2xl font-bold tracking-[0.5em] text-white py-3 font-mono"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                  <p className="mt-2 text-center text-xs text-emerald-400 font-semibold font-mono">
                    ✓ Pre-filled demo OTP: 123456
                  </p>
                </div>
              )}

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full btn-primary py-3 text-sm mt-2 shadow-lg cursor-pointer"
              >
                {loading ? "Authenticating..." : step === "phone" ? "Send OTP →" : "Verify & Enter Portal"}
              </button>

              {step === "otp" && (
                <button
                  onClick={() => setStep("phone")}
                  className="w-full text-center text-xs font-bold text-emerald-400 hover:underline pt-1 cursor-pointer"
                >
                  ← Change number or role
                </button>
              )}
            </div>

            <div className="border-t border-white/[0.08] pt-4 text-center">
              <p className="text-xs text-slate-400">
                New farmer on KrishiSetu?{" "}
                <Link href="/register" className="font-bold text-emerald-400 hover:underline">
                  Create Farmer Profile
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
