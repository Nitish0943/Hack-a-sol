"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, MailCheck, Sprout } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function VerifyEmailPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4 sm:p-8 bg-slate-50/50 dark:bg-slate-950/50">
      <div className="glass glass-strong w-full max-w-md rounded-[32px] p-6 sm:p-8 border border-slate-200/80 dark:border-white/15 shadow-xl text-center">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400 transition"
          >
            <ArrowLeft className="size-4" /> Back to Login
          </Link>
          <LanguageSwitcher />
        </div>

        <div className="mx-auto mb-4 grid size-16 place-items-center rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
          <MailCheck className="size-8" />
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Email Verification
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Your email address has been verified. You can now use it for communications, notifications,
          and secure role authentication.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/login"
            className="glass-btn glass-green w-full rounded-full py-3 text-sm font-bold shadow-md"
          >
            Continue to Login
          </Link>
          <Link
            href="/"
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            Back to KrishiSetu Home
          </Link>
        </div>
      </div>
    </main>
  );
}
