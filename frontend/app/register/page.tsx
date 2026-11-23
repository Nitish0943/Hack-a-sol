"use client";

import Link from "next/link";
import { ArrowLeft, Sprout, CheckCircle2, AlertCircle, RefreshCw, KeyRound, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { authApi } from "@/lib/api";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("123456");
  const [otpSentNote, setOtpSentNote] = useState<string | null>(null);

  // Initialize with a fresh unique test number to avoid 409 collisions
  useEffect(() => {
    generateNewNumber();
  }, []);

  const generateNewNumber = () => {
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const num = `98765${randomDigits}`;
    setMobileNumber(num);
    setError("");
    setOtpSentNote(null);
  };

  const handleSendOtp = async () => {
    if (!mobileNumber || mobileNumber.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setError("");
    try {
      const res = await authApi.sendOtp(mobileNumber);
      setOtp(res.demoOtp || "123456");
      setOtpSentNote(`Demo OTP (${res.demoOtp || "123456"}) issued successfully! Valid for 5 minutes.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not send OTP.");
    }
  };

  async function submitRegistration(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const form = new FormData(event.currentTarget);
    const enteredMobile = mobileNumber.trim();
    const enteredOtp = otp.trim() || "123456";

    try {
      // Ensure OTP challenge exists in backend
      await authApi.sendOtp(enteredMobile);

      const registered = await authApi.register({
        mobileNumber: enteredMobile,
        otp: enteredOtp,
        fullName: String(form.get("fullName") || "Ramesh Kumar"),
        preferredLanguage: String(form.get("preferredLanguage") || "Hindi"),
        state: String(form.get("state") || "Chhattisgarh"),
        district: String(form.get("district") || "Raipur"),
        block: String(form.get("block") || "Arang"),
        village: String(form.get("village") || "Khamtarai"),
        pincode: String(form.get("pincode") || "") || undefined,
        farmerCategory: String(form.get("farmerCategory") || "Small & marginal farmer"),
        cultivatorStatus: String(form.get("cultivatorStatus") || "Landowner"),
        landholdingArea: Number(form.get("landholdingArea") || 2),
      });

      // Persist session locally
      if (typeof window !== "undefined") {
        localStorage.setItem("krishisetu_token", registered.accessToken);
        localStorage.setItem("krishisetu_user", JSON.stringify(registered.user));
        localStorage.setItem("krishisetu_farmer", JSON.stringify(registered.farmer));
      }

      setSuccess(`Farmer successfully registered! ID: ${registered.farmer.farmer_id}`);
      setTimeout(() => {
        router.push("/farmer/dashboard");
      }, 1000);
    } catch (cause) {
      const msg = cause instanceof Error ? cause.message : "Registration failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const isAlreadyRegistered = error.toLowerCase().includes("already registered");

  return (
    <main className="min-h-screen bg-[#F8FAF5] px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[#166534] text-white">
              <Sprout className="size-5" />
            </span>
            <span className="font-bold text-slate-900 dark:text-white">KrishiSetu</span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/login"
              className="glass glass-btn inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              <ArrowLeft className="size-3.5" /> Already registered? Log in
            </Link>
          </div>
        </div>

        <section className="glass rounded-3xl p-5 sm:p-8 shadow-xl">
          <div className="mb-7">
            <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#166534]">
              Farmer Onboarding
            </span>
            <h1 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
              Create your farmer profile
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Fields marked * are required. This system registers your profile in the decentralized agricultural registry.
            </p>
          </div>

          <form onSubmit={submitRegistration}>
            <div className="space-y-8">
              {/* Personal Information */}
              <fieldset>
                <legend className="mb-4 text-base font-bold text-slate-900 dark:text-white">
                  Personal information
                </legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Full name *
                    <input
                      name="fullName"
                      className="field mt-2"
                      required
                      defaultValue="Ramesh Kumar"
                      placeholder="Enter legal name as per Aadhaar"
                    />
                  </label>

                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Mobile number *
                      </label>
                      <button
                        type="button"
                        onClick={generateNewNumber}
                        className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
                      >
                        <RefreshCw className="size-3" /> New number
                      </button>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <div className="relative flex-1">
                        <Phone className="absolute left-3 top-3 size-4 text-slate-400" />
                        <input
                          name="mobileNumber"
                          className="field pl-9 font-mono"
                          required
                          type="tel"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          placeholder="10-digit mobile number"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="glass glass-btn rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200"
                      >
                        Send OTP
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Demo OTP *
                    </label>
                    <div className="relative mt-2">
                      <KeyRound className="absolute left-3 top-3 size-4 text-slate-400" />
                      <input
                        name="otp"
                        className="field pl-9 font-mono tracking-widest"
                        required
                        inputMode="numeric"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="123456"
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Demo OTP is <strong>123456</strong> for testing.
                    </p>
                  </div>

                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Preferred language *
                    <select name="preferredLanguage" className="field mt-2">
                      <option>Hindi</option>
                      <option>English</option>
                    </select>
                  </label>
                </div>
              </fieldset>

              {otpSentNote && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="size-4 shrink-0" />
                  <span>{otpSentNote}</span>
                </div>
              )}

              {/* Location Information */}
              <fieldset className="border-t border-slate-200/60 pt-6 dark:border-white/10">
                <legend className="mb-4 text-base font-bold text-slate-900 dark:text-white">
                  Location information
                </legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    State *
                    <input name="state" className="field mt-2" required defaultValue="Chhattisgarh" />
                  </label>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    District *
                    <input name="district" className="field mt-2" required defaultValue="Raipur" />
                  </label>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Block *
                    <input name="block" className="field mt-2" required defaultValue="Arang" />
                  </label>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Village *
                    <input name="village" className="field mt-2" required defaultValue="Khamtarai" />
                  </label>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    PIN code
                    <input name="pincode" className="field mt-2" placeholder="492001" defaultValue="492001" />
                  </label>
                </div>
              </fieldset>

              {/* Farmer Information */}
              <fieldset className="border-t border-slate-200/60 pt-6 dark:border-white/10">
                <legend className="mb-4 text-base font-bold text-slate-900 dark:text-white">
                  Farmer & Landholding details
                </legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Farmer category *
                    <select name="farmerCategory" className="field mt-2" required>
                      <option>Small &amp; marginal farmer</option>
                      <option>Medium farmer</option>
                      <option>Large farmer</option>
                      <option>Other farmer</option>
                    </select>
                  </label>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Cultivator status *
                    <select name="cultivatorStatus" className="field mt-2" required>
                      <option>Landowner</option>
                      <option>Tenant farmer</option>
                      <option>Sharecropper</option>
                      <option>Joint landholder</option>
                      <option>Other</option>
                    </select>
                  </label>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    KrishiSetu / existing Farmer ID
                    <input className="field mt-2" placeholder="Optional (e.g. KS-CG-10482)" />
                  </label>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Landholding area (acres) *
                    <input
                      name="landholdingArea"
                      className="field mt-2"
                      required
                      type="number"
                      step="0.1"
                      min="0.1"
                      defaultValue="2.0"
                    />
                  </label>
                </div>
              </fieldset>
            </div>

            {error && (
              <div className="mt-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs font-semibold text-rose-800 dark:text-rose-300">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="size-4 shrink-0 mt-0.5 text-rose-600" />
                  <div className="flex-1">
                    <p>{error}</p>
                    {isAlreadyRegistered && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link
                          href="/login"
                          className="glass-btn glass-green inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-white shadow"
                        >
                          Log in with {mobileNumber}
                        </Link>
                        <button
                          type="button"
                          onClick={generateNewNumber}
                          className="glass glass-btn inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200"
                        >
                          <RefreshCw className="size-3" /> Generate Different Number
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="mt-6 flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>{success} Redirecting to your farmer dashboard...</span>
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <button
                disabled={loading}
                type="submit"
                className="glass-btn glass-green flex w-full items-center justify-center gap-2 rounded-2xl px-8 py-3.5 font-bold text-white shadow-lg disabled:opacity-60 sm:w-auto"
              >
                {loading ? "Creating farmer profile..." : "Create farmer profile"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
