"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  KeyRound,
  Lock,
  Phone,
  ShieldCheck,
  Sparkles,
  Sprout,
  Tractor,
  UserCheck,
  UserCog,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { LanguageSwitcher } from "@/components/language-switcher";

const DEMO_PERSONAS = [
  {
    id: "farmer1",
    name: "Ramesh Kumar",
    role: "farmer",
    category: "Small Landowner",
    details: "2.0 Acres · Raipur · Paddy & Vegetables",
    badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300",
    icon: Tractor,
    highlights: "PM-KISAN, RGKNY, KCC, Godhan Nyay eligible",
  },
  {
    id: "farmer2",
    name: "Suresh Verma",
    role: "farmer",
    category: "Medium Landowner",
    details: "5.0 Acres · Durg · Irrigated Paddy & Maize",
    badgeColor: "bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300",
    icon: Tractor,
    highlights: "Saur Sujala solar pump & SMAM mechanization eligible",
  },
  {
    id: "farmer3",
    name: "Mohan Sahu",
    role: "farmer",
    category: "Tenant / Sharecropper",
    details: "3.0 Acres · Bilaspur · Rain-fed Cultivator",
    badgeColor: "bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-300",
    icon: Tractor,
    highlights: "Tenant credit line & PMFBY insurance eligible",
  },
  {
    id: "officer",
    name: "Anita Verma",
    role: "officer",
    category: "Govt Extension Officer",
    details: "Agriculture Dept · Raipur District Jurisdiction",
    badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300",
    icon: Building2,
    highlights: "Application review, field verification & grievance resolution",
  },
  {
    id: "admin",
    name: "System Admin",
    role: "admin",
    category: "Platform Administrator",
    details: "Full Governance · Security & Policy Management",
    badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300",
    icon: UserCog,
    highlights: "User provisioning, scheme definitions & audit logging",
  },
];

const homeRoute = (r: string) => {
  if (r === "officer" || r === "government") return "/officer/dashboard";
  if (r === "admin") return "/admin/dashboard";
  return "/farmer/dashboard";
};

export default function LoginPage() {
  const router = useRouter();

  // Tab: "demo" | "otp" | "password"
  const [activeTab, setActiveTab] = useState<"demo" | "otp" | "password">("demo");
  const [demoLoginEnabled, setDemoLoginEnabled] = useState(true);

  // OTP Form State
  const [otpStep, setOtpStep] = useState<"phone" | "otp">("phone");
  const [mobileNumber, setMobileNumber] = useState("9876543210");
  const [otpDigits, setOtpDigits] = useState<string[]>(["1", "2", "3", "4", "5", "6"]);
  const otpBoxes = useRef<(HTMLInputElement | null)[]>([]);

  // Password Form State
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  // Feedback State
  const [loading, setLoading] = useState(false);
  const [activeDemoId, setActiveDemoId] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Fetch demo status on mount
  useEffect(() => {
    let isMounted = true;
    authApi
      .getDemoStatus()
      .then((res) => {
        if (isMounted && res && typeof res.demoLoginEnabled === "boolean") {
          setDemoLoginEnabled(res.demoLoginEnabled);
          if (!res.demoLoginEnabled) {
            setActiveTab("otp");
          }
        }
      })
      .catch(() => {
        // Fallback default
      });
    return () => {
      isMounted = false;
    };
  }, []);

  function handleSaveAuthAndRedirect(token: string, user: { role: string; full_name?: string }) {
    if (typeof window !== "undefined") {
      localStorage.setItem("krishisetu_token", token);
      localStorage.setItem("krishisetu_user", JSON.stringify(user));
    }
    router.push(homeRoute(user.role));
  }

  // 1-Click Demo Login
  async function handleDemoLogin(personaId: string) {
    setError("");
    setActiveDemoId(personaId);
    setLoading(true);

    try {
      const res = await authApi.demoLogin(personaId);
      if (res.accessToken && res.user) {
        handleSaveAuthAndRedirect(res.accessToken, res.user);
      } else {
        throw new Error("Invalid session received from demo login");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Demo authentication failed");
    } finally {
      setLoading(false);
      setActiveDemoId(null);
    }
  }

  // Password Login
  async function handlePasswordLogin(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!identifier.trim()) {
      setError("Please enter your registered email or mobile number.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await authApi.loginWithPassword(identifier.trim(), password);
      if (res.accessToken && res.user) {
        handleSaveAuthAndRedirect(res.accessToken, res.user);
      } else {
        throw new Error("Invalid authentication response");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Password authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  // Mobile OTP Login
  async function handleOtpLogin() {
    setError("");
    setLoading(true);
    const cleanMobile = mobileNumber.replace(/\D/g, "").slice(-10);

    if (!cleanMobile || cleanMobile.length < 10) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      setLoading(false);
      return;
    }

    try {
      if (otpStep === "phone") {
        await authApi.sendOtp(cleanMobile);
        setOtpStep("otp");
      } else {
        const fullOtp = otpDigits.join("");
        const res = await authApi.verifyOtp(cleanMobile, fullOtp);
        if (res.accessToken && res.user) {
          handleSaveAuthAndRedirect(res.accessToken, res.user);
        } else {
          throw new Error("Invalid OTP response received.");
        }
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "OTP authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  function handleDigitChange(index: number, val: string) {
    const d = val.replace(/\D/g, "");
    if (d.length > 1) {
      const next = d.slice(0, 6).padEnd(6, " ").split("");
      setOtpDigits(next.map((x) => x.trim()));
      otpBoxes.current[Math.min(d.length, 5)]?.focus();
      return;
    }
    setOtpDigits((prev) => prev.map((x, i) => (i === index ? d : x)));
    if (d && index < 5) otpBoxes.current[index + 1]?.focus();
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_1.15fr]">
      {/* Left Branding / Value Hero Section */}
      <section className="relative hidden flex-col justify-between p-10 lg:flex bg-gradient-to-br from-emerald-950 via-slate-900 to-green-950 text-white">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-emerald-600 text-white shadow-lg">
            <Sprout className="size-6" />
          </span>
          <span className="text-2xl font-bold tracking-tight">KrishiSetu</span>
        </Link>

        <div className="max-w-xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-300">
            <Sparkles className="size-3.5" />
            <span>Role-Based Benefits Transparency</span>
          </div>

          <h1 className="text-4xl font-extrabold leading-[1.12] lg:text-5xl">
            Every Farmer Deserves to Know What They Are Owed.
          </h1>

          <p className="text-base text-slate-300 leading-relaxed">
            KrishiSetu transparently connects Chhattisgarh farmers with verified government schemes,
            transparent subsidy tracking, and targeted private agricultural financing.
          </p>

          <div className="space-y-3 pt-2">
            {[
              "Personalized eligibility evaluation based on land title & cultivation status",
              "Real-time Financial Digital Twin from potential to disbursed subsidies",
              "Dedicated jurisdictional officer portal & role-scoped administration",
            ].map((text, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm font-semibold backdrop-blur-md"
              >
                <CheckCircle2 className="size-5 shrink-0 text-emerald-400" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-white/10 pt-6 text-xs text-slate-400">
          <p className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-400" />
            Enterprise-grade RBAC & Session Security
          </p>
          <span>Chhattisgarh · Hackathon MVP</span>
        </div>
      </section>

      {/* Right Interactive Authentication Section */}
      <section className="flex items-center justify-center p-4 sm:p-8 bg-slate-50/50 dark:bg-slate-950/50">
        <div className="glass glass-strong w-full max-w-xl rounded-[32px] p-6 sm:p-8 border border-slate-200/80 dark:border-white/15 shadow-xl">
          {/* Top Bar */}
          <div className="mb-6 flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400 transition"
            >
              <ArrowLeft className="size-4" /> Home
            </Link>
            <LanguageSwitcher />
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Access KrishiSetu
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Select an evaluated demo persona or sign in with your registered credentials.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="mb-6 grid grid-cols-3 gap-1 rounded-2xl bg-slate-200/70 dark:bg-slate-800/80 p-1.5 text-xs font-bold">
            {demoLoginEnabled && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab("demo");
                  setError("");
                }}
                className={`flex items-center justify-center gap-1.5 rounded-xl py-2 transition ${
                  activeTab === "demo"
                    ? "bg-white text-emerald-800 shadow-xs dark:bg-emerald-600 dark:text-white"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                }`}
              >
                <Users className="size-3.5" />
                <span>Demo Personas</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setActiveTab("otp");
                setError("");
              }}
              className={`flex items-center justify-center gap-1.5 rounded-xl py-2 transition ${
                activeTab === "otp"
                  ? "bg-white text-emerald-800 shadow-xs dark:bg-emerald-600 dark:text-white"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
              }`}
            >
              <Phone className="size-3.5" />
              <span>Mobile OTP</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("password");
                setError("");
              }}
              className={`flex items-center justify-center gap-1.5 rounded-xl py-2 transition ${
                activeTab === "password"
                  ? "bg-white text-emerald-800 shadow-xs dark:bg-emerald-600 dark:text-white"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
              }`}
            >
              <KeyRound className="size-3.5" />
              <span>Password</span>
            </button>
          </div>

          {/* TAB 1: QUICK DEMO PERSONAS FOR JUDGES */}
          {activeTab === "demo" && demoLoginEnabled && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                  1-Click Evaluated Identities
                </span>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Click any card to inspect
                </span>
              </div>

              <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                {DEMO_PERSONAS.map((persona) => {
                  const Icon = persona.icon;
                  const isCurrent = activeDemoId === persona.id;
                  return (
                    <button
                      key={persona.id}
                      type="button"
                      disabled={loading}
                      onClick={() => handleDemoLogin(persona.id)}
                      className="w-full text-left glass glass-btn rounded-2xl p-3.5 border border-slate-200/90 dark:border-white/15 hover:border-emerald-500/50 hover:shadow-md transition group disabled:opacity-60"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <span className="grid size-10 place-items-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 shrink-0 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/60 group-hover:text-emerald-800 dark:group-hover:text-emerald-300 transition">
                            <Icon className="size-5" />
                          </span>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                                {persona.name}
                              </h3>
                              <span
                                className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${persona.badgeColor}`}
                              >
                                {persona.category}
                              </span>
                            </div>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5 truncate">
                              {persona.details}
                            </p>
                            <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mt-1 line-clamp-1">
                              • {persona.highlights}
                            </p>
                          </div>
                        </div>

                        <span className="shrink-0 rounded-full bg-emerald-600/10 p-1.5 text-emerald-700 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition">
                          {isCurrent ? (
                            <span className="block size-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                          ) : (
                            <UserCheck className="size-4" />
                          )}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: MOBILE NUMBER + OTP */}
          {activeTab === "otp" && (
            <div className="space-y-4">
              {otpStep === "phone" ? (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-800 dark:text-slate-200">
                      Mobile number
                    </label>
                    <div className="flex gap-2">
                      <span className="glass grid place-items-center rounded-2xl px-4 text-sm font-bold text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-white/15">
                        +91
                      </span>
                      <input
                        className="field"
                        type="tel"
                        inputMode="numeric"
                        placeholder="e.g. 9876543210"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                      />
                    </div>
                    <p className="mt-1.5 text-xs text-slate-500">
                      Standard demo OTP is <span className="font-bold text-emerald-600">123456</span>.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleOtpLogin}
                    className="glass-btn glass-green w-full rounded-full px-4 py-3.5 font-bold disabled:opacity-60 shadow-md transition"
                  >
                    {loading ? "Sending OTP..." : "Send OTP"}
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <label className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        One-time password
                      </label>
                      <button
                        type="button"
                        onClick={() => setOtpStep("phone")}
                        className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                      >
                        Change number (+91 {mobileNumber})
                      </button>
                    </div>

                    <div className="flex justify-between gap-2">
                      {otpDigits.map((d, i) => (
                        <input
                          key={i}
                          ref={(el) => {
                            otpBoxes.current[i] = el;
                          }}
                          value={d}
                          inputMode="numeric"
                          maxLength={6}
                          aria-label={`Digit ${i + 1}`}
                          onChange={(e) => handleDigitChange(i, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Backspace" && !d && i > 0) {
                              otpBoxes.current[i - 1]?.focus();
                            }
                          }}
                          className="field !px-0 text-center text-2xl font-bold"
                          style={{ height: 56 }}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleOtpLogin}
                    className="glass-btn glass-green w-full rounded-full px-4 py-3.5 font-bold disabled:opacity-60 shadow-md transition"
                  >
                    {loading ? "Verifying..." : "Verify & Sign In"}
                  </button>
                </>
              )}
            </div>
          )}

          {/* TAB 3: PASSWORD LOGIN */}
          {activeTab === "password" && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-800 dark:text-slate-200">
                  Email or Mobile number
                </label>
                <div className="relative">
                  <input
                    className="field pl-10"
                    type="text"
                    placeholder="e.g. farmer1@krishisetu.demo or 9876543210"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                  <Users className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-800 dark:text-slate-200">
                  Password
                </label>
                <div className="relative">
                  <input
                    className="field pl-10"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Lock className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                </div>
                <p className="mt-1.5 text-xs text-slate-500">
                  Demo password format: <span className="font-mono font-semibold">DemoFarmer1@2026</span> /{" "}
                  <span className="font-mono font-semibold">DemoOfficer@2026</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="glass-btn glass-green w-full rounded-full px-4 py-3.5 font-bold disabled:opacity-60 shadow-md transition"
              >
                {loading ? "Signing in..." : "Sign In with Password"}
              </button>
            </form>
          )}

          {/* Error Notice */}
          {error && (
            <p className="mt-4 rounded-2xl bg-red-500/10 border border-red-500/20 px-3.5 py-2.5 text-xs font-semibold text-red-700 dark:text-red-300">
              {error}
            </p>
          )}

          {/* Register Link */}
          <div className="mt-6 border-t border-slate-200/80 dark:border-white/15 pt-5 text-center">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              New to KrishiSetu?{" "}
              <Link
                href="/register"
                className="font-bold text-[#166534] dark:text-emerald-400 hover:underline"
              >
                Create new farmer account
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
