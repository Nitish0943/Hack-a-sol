"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, Lock, Sprout } from "lucide-react";
import { useState } from "react";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
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
          Create New Password
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Enter a secure password for your KrishiSetu account.
        </p>

        {submitted ? (
          <div className="mt-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center space-y-2">
            <CheckCircle2 className="size-8 mx-auto text-emerald-600 dark:text-emerald-400" />
            <p className="font-bold text-slate-900 dark:text-white text-sm">
              Password Successfully Updated
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Your new password is now active. You can log in using your updated credentials.
            </p>
            <Link
              href="/login"
              className="glass-btn glass-green inline-block mt-3 rounded-full px-5 py-2 text-xs font-bold"
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-800 dark:text-slate-200">
                New Password
              </label>
              <div className="relative">
                <input
                  className="field pl-10"
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <Lock className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-800 dark:text-slate-200">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  className="field pl-10"
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <Lock className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {error && (
              <p className="rounded-2xl bg-red-500/10 border border-red-500/20 px-3.5 py-2 text-xs font-semibold text-red-700 dark:text-red-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="glass-btn glass-green w-full rounded-full px-4 py-3.5 font-bold disabled:opacity-60 shadow-md transition"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
