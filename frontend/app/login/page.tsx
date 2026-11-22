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
    <main className="grid min-h-screen bg-[#F8FAF5] lg:grid-cols-[1.1fr_480px]">
      {/* Left Visual Brand Column */}
      <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-forest-950 p-12 text-white lg:flex">
        {/* Specular glows */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 size-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 size-96 rounded-full bg-yellow-500/10 blur-3xl" />

        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-white text-emerald-900 shadow-md">
              <Sprout className="size-7 text-emerald-800" />
            </span>
            <div>
              <span className="text-2xl font-black tracking-tight leading-none">KrishiSetu</span>
              <span className="block text-xs font-bold text-emerald-300 mt-1">कृषि सेतु · Transparency Portal</span>
            </div>
          </Link>
          <LanguageSwitcher showAudioPill={false} />
        </div>

        <div className="relative z-10 max-w-lg my-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-emerald-300 border border-white/10 mb-4 backdrop-blur-md">
            <ShieldCheck className="size-4" /> GT-01 Policy & Subsidy Intelligence
          </span>
          <h1 className="text-4xl xl:text-5xl font-black leading-tight">
            {locale === "cghi"
              ? "अपन फायदा जानव। हर रुपिया के हिसाब रखव।"
              : locale === "hi"
                ? "हर किसान का अधिकार। पारदर्शी हिसाब, सही समय पर लाभ।"
                : "Every Farmer Deserves to Know What They Are Owed."}
          </h1>
          <p className="mt-5 text-emerald-100/80 leading-relaxed font-medium text-sm sm:text-base">
            Consolidated benefit ledger, deterministic scheme eligibility, discrepancy alerts, and phone IVR assistance for rural Indian cultivators.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
              <p className="text-xl font-black text-amber-300">₹42.5K</p>
              <p className="text-[11px] text-emerald-200 mt-0.5">Sample Entitlement</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
              <p className="text-xl font-black text-white">4 Lifecycle</p>
              <p className="text-[11px] text-emerald-200 mt-0.5">Ledger Stages</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
              <p className="text-xl font-black text-emerald-300">1800-SETU</p>
              <p className="text-[11px] text-emerald-200 mt-0.5">IVR Helpline</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-emerald-200/70 border-t border-white/10 pt-4 flex justify-between">
          <span>Demonstration Environment · Safe Sandbox</span>
          <span>No banking credentials or Aadhaar OTP required</span>
        </div>
      </section>

      {/* Right Login Action Card */}
      <section className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-emerald-800 transition"
            >
              <ArrowLeft className="size-4" /> {t("common.backToHome")}
            </Link>
            <div className="lg:hidden">
              <LanguageSwitcher showAudioPill={false} />
            </div>
          </div>

          <div className="rounded-3xl border border-white/90 bg-white/80 p-7 sm:p-8 shadow-[0_16px_40px_-8px_rgba(20,83,45,0.08),0_0_0_1px_rgba(22,101,52,0.06)] backdrop-blur-2xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="grid size-10 place-items-center rounded-xl bg-emerald-100 text-emerald-800">
                <UserCheck className="size-5" />
              </span>
              <div>
                <h2 className="text-2xl font-black text-slate-900 leading-tight">
                  {step === "phone" ? "Demo Workspace Login" : "Enter Verification OTP"}
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {step === "phone" ? "Choose a prototype persona or enter mobile" : "Use demo verification code 123456"}
                </p>
              </div>
            </div>

            {/* Role Quick Selector */}
            {step === "phone" && (
              <div className="mb-6">
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
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
                          ? "border-emerald-600 bg-emerald-50/80 shadow-2xs"
                          : "border-slate-200/80 bg-white/60 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-900">{r.label}</span>
                        {role === r.id && <Check className="size-3.5 text-emerald-700" />}
                      </div>
                      <span className="block text-[10px] text-slate-500 truncate mt-0.5">{r.sub}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Inputs */}
            <div className="space-y-4">
              {step === "phone" ? (
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">
                    Mobile Number (मोबाइल नंबर)
                  </label>
                  <div className="flex rounded-xl shadow-xs">
                    <span className="grid place-items-center rounded-l-xl border border-r-0 border-slate-200 bg-slate-100/80 px-3.5 text-xs font-bold text-slate-600">
                      +91
                    </span>
                    <input
                      className="field rounded-l-none"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">
                    One-Time Password (OTP)
                  </label>
                  <input
                    className="field text-center text-2xl font-black tracking-[0.5em] text-slate-900 py-3"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                  <p className="mt-2 text-center text-xs text-emerald-800 font-semibold">
                    ✓ Pre-filled demo OTP for judges: 123456
                  </p>
                </div>
              )}

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full btn-primary py-3.5 text-base mt-2 shadow-md cursor-pointer"
              >
                {loading ? "Authenticating..." : step === "phone" ? "Send OTP →" : "Verify & Enter Portal"}
              </button>

              {step === "otp" && (
                <button
                  onClick={() => setStep("phone")}
                  className="w-full text-center text-xs font-bold text-emerald-800 hover:underline pt-1"
                >
                  ← Change number or role
                </button>
              )}
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4 text-center">
              <p className="text-xs text-slate-500 font-medium">
                New farmer on KrishiSetu?{" "}
                <Link href="/register" className="font-bold text-emerald-800 hover:underline">
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
