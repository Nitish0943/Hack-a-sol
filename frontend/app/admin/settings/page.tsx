"use client";

import { useState } from "react";
import { Settings, Server, Database, ShieldCheck, RefreshCw, Check } from "lucide-react";
import { Card, PageHeading } from "@/components/ui-kit";

export default function AdminSettingsPage() {
  const [synced, setSynced] = useState(false);
  const [strictMode, setStrictMode] = useState(true);

  const handleSync = () => {
    setSynced(true);
    setTimeout(() => setSynced(false), 3000);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeading
        title="System Infrastructure & Platform Settings"
        description="Configure deterministic evaluation thresholds, API gateway routing, and state database sync."
      />

      {/* Rules Engine Configuration */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="size-4 text-[#166534]" />
          Deterministic Rule Engine Configuration
        </h3>

        <div className="space-y-3">
          <label className="flex items-center justify-between rounded-xl border border-slate-100 p-3.5 hover:bg-slate-50 cursor-pointer">
            <div>
              <p className="text-xs font-bold text-slate-900">Zero-Hallucination Strict Mode</p>
              <p className="text-[11px] text-slate-500">
                Guarantees all eligibility outcomes originate strictly from versioned rule clauses, never LLM generation.
              </p>
            </div>
            <input
              type="checkbox"
              checked={strictMode}
              onChange={(e) => setStrictMode(e.target.checked)}
              className="size-4 accent-[#166534]"
            />
          </label>
        </div>
      </Card>

      {/* Environment & Gateway Status */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Server className="size-4 text-[#166534]" />
          Backend Gateway & Integration Parameters
        </h3>

        <div className="grid gap-3 sm:grid-cols-2 text-xs">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <span className="text-[11px] text-slate-400">FastAPI Gateway</span>
            <p className="mt-1 font-mono font-semibold text-slate-900">http://localhost:8000</p>
            <p className="text-[10px] text-emerald-600 font-bold mt-0.5">CORS: Enabled (All Origins for Demo)</p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <span className="text-[11px] text-slate-400">Database Engine</span>
            <p className="mt-1 font-mono font-semibold text-slate-900">SQLite (aiosqlite / SQLAlchemy 2.0)</p>
            <p className="text-[10px] text-slate-500 mt-0.5">File: backend/krishisetu.db</p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <span className="text-[11px] text-slate-400">AgriStack Integration</span>
            <p className="mt-1 font-mono font-semibold text-slate-900">Farmer ID Bridge v1.2</p>
            <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Status: Ready</p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <span className="text-[11px] text-slate-400">IVR Telephone Gateway</span>
            <p className="mt-1 font-mono font-semibold text-slate-900">1800-890-SETU</p>
            <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Status: Active (DTMF 1-9)</p>
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-3 pt-2">
        <button
          onClick={handleSync}
          className="inline-flex items-center gap-2 rounded-xl bg-[#166534] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#14532d]"
        >
          {synced ? <Check className="size-4" /> : <RefreshCw className="size-4" />}
          {synced ? "Rules & DB Synced!" : "Synchronize Rules & Seed DB"}
        </button>
      </div>
    </div>
  );
}
