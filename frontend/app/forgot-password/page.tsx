"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, KeyRound, Sprout } from "lucide-react";
import { useState } from "react";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4 sm:p-8 bg-slate-50/50 dark:bg-slate-950/50">
      <div className="glass glass-strong w-full max-w-md rounded-[32px] p-6 sm:p-8 border border-slate-200/80 dark:border-white/15 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400 transition"
          >
            <ArrowLeft className="size-4" /> Back to Login
          </Link>
          <LanguageSwitcher />
        </div>

        <div className="flex items-center gap-3 mb-4">
          <span className="grid size-10 place-items-center rounded-2xl bg-emerald-600 text-white shadow-md">
            <Sprout className="size-5" />
          </span>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            KrishiSetu
          </span>
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Reset Your Password
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Enter your registered mobile number or email to receive password reset instructions.
        </p>

        {submitted ? (
          <div className="mt-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center space-y-2">
            <CheckCircle2 className="size-8 mx-auto text-emerald-600 dark:text-emerald-400" />
            <p className="font-bold text-slate-900 dark:text-white text-sm">
              Password Reset Initiated
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              If an account is associated with {identifier}, reset instructions have been dispatched.
            </p>
            <Link
              href="/login"
              className="glass-btn glass-green inline-block mt-3 rounded-full px-5 py-2 text-xs font-bold"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-800 dark:text-slate-200">
                Registered Email or Mobile Number
              </label>
              <div className="relative">
                <input
                  className="field pl-10"
                  type="text"
                  placeholder="e.g. 9876543210 or farmer@demo.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
                <KeyRound className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="glass-btn glass-green w-full rounded-full px-4 py-3.5 font-bold disabled:opacity-60 shadow-md transition"
            >
              {loading ? "Processing..." : "Send Reset Instructions"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
