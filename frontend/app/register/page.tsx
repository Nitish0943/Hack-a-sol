"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShieldCheck, Sprout, UserCheck, Wheat } from "lucide-react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useTranslation } from "@/lib/i18n/context";

export default function RegisterPage() {
  const router = useRouter();
  const { t, locale, language } = useTranslation();
  const [loading, setLoading] = useState(false);

  // Form State
  const [fullName, setFullName] = useState("Ramesh Kumar");
  const [phone, setPhone] = useState("9876543210");
  const [preferredLang, setPreferredLang] = useState("hi");
  const [state, setState] = useState("Chhattisgarh");
  const [district, setDistrict] = useState("Raipur");
  const [block, setBlock] = useState("Arang");
  const [village, setVillage] = useState("Khamtarai");
  const [farmerCat, setFarmerCat] = useState("Small & Marginal");
  const [cultivatorStatus, setCultivatorStatus] = useState("Sharecropper");
  const [landAcres, setLandAcres] = useState(2.0);
  const [crops, setCrops] = useState("Paddy, Kodo-Kutki");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fetch("http://localhost:8000/api/v1/farmers/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          state,
          district,
          block,
          village,
          farmer_category: farmerCat,
          cultivator_status: cultivatorStatus,
          landholding_acres: Number(landAcres),
          cultivated_area: Number(landAcres),
          crops_json: JSON.stringify(crops.split(",").map((c) => c.trim())),
        }),
      }).catch(() => null);
    } catch {
      // ignore
    }

    setTimeout(() => {
      setLoading(false);
      router.push("/farmer/dashboard");
    }, 400);
  };

  return (
    <main className="min-h-screen px-4 py-8 text-slate-100 relative">
      <div className="mx-auto max-w-3xl space-y-6 relative z-10">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="size-4" /> {t("common.backToHome")}
          </Link>
          <LanguageSwitcher showAudioPill={false} />
        </div>

        {/* Card */}
        <div className="glass-panel p-6 sm:p-10 space-y-8 border border-white/15 shadow-2xl">
          <div className="flex items-center gap-3 border-b border-white/[0.08] pb-6">
            <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-slate-950 shadow-lg border border-white/30">
              <Sprout className="size-6 text-slate-950" />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-white font-display">
                Create Farmer Entitlement Profile
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Takes only 2 minutes. Configures deterministic eligibility for Central and State schemes.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Identity & Contact */}
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-display flex items-center gap-2">
                <span className="size-5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-xs flex items-center justify-center font-bold">1</span>
                <span>Personal & Language Preference</span>
              </h2>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-1">
                  <label className="text-xs font-semibold text-slate-300">Full Name *</label>
                  <input
                    required
                    className="field mt-1"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Mobile Number *</label>
                  <input
                    required
                    type="tel"
                    className="field mt-1 font-mono"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Preferred Language</label>
                  <select
                    className="field mt-1 cursor-pointer"
                    value={preferredLang}
                    onChange={(e) => setPreferredLang(e.target.value)}
                  >
                    <option value="hi" className="bg-[#07130B]">हिन्दी (Hindi)</option>
                    <option value="cghi" className="bg-[#07130B]">छत्तीसगढ़ी (Chhattisgarhi)</option>
                    <option value="en" className="bg-[#07130B]">English</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Geography */}
            <div className="space-y-3 pt-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-display flex items-center gap-2">
                <span className="size-5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-xs flex items-center justify-center font-bold">2</span>
                <span>Administrative Geography (Location)</span>
              </h2>

              <div className="grid gap-4 sm:grid-cols-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300">State *</label>
                  <input
                    required
                    className="field mt-1"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">District *</label>
                  <input
                    required
                    className="field mt-1"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Block / Tehsil *</label>
                  <input
                    required
                    className="field mt-1"
                    value={block}
                    onChange={(e) => setBlock(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Village *</label>
                  <input
                    required
                    className="field mt-1"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* 3. Cultivator Identity Bridge */}
            <div className="space-y-3 pt-3">
              <h2 className="text-sm font-bold text-purple-300 uppercase tracking-wider font-display flex items-center gap-2">
                <span className="size-5 rounded-full bg-purple-500/20 text-purple-400 font-mono text-xs flex items-center justify-center font-bold">3</span>
                <span>Cultivator Identity Bridge (Land vs Cultivation)</span>
              </h2>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Cultivator Status *</label>
                  <select
                    className="field mt-1 cursor-pointer"
                    value={cultivatorStatus}
                    onChange={(e) => setCultivatorStatus(e.target.value)}
                  >
                    <option value="Sharecropper" className="bg-[#07130B]">Sharecropper (बटाईदार / 50:50 Oral Lease)</option>
                    <option value="Tenant" className="bg-[#07130B]">Tenant Farmer (पट्टेदार / Leaseholder)</option>
                    <option value="Landowner" className="bg-[#07130B]">Landowner (भू-स्वामी)</option>
                    <option value="Joint Owner" className="bg-[#07130B]">Joint Family Landholding</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Cultivated Area (Acres) *</label>
                  <input
                    required
                    type="number"
                    step="0.1"
                    className="field mt-1 font-mono"
                    value={landAcres}
                    onChange={(e) => setLandAcres(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Farmer Category</label>
                  <select
                    className="field mt-1 cursor-pointer"
                    value={farmerCat}
                    onChange={(e) => setFarmerCat(e.target.value)}
                  >
                    <option value="Small & Marginal" className="bg-[#07130B]">Small & Marginal (&lt; 5 acres)</option>
                    <option value="Medium" className="bg-[#07130B]">Medium Farmer (5–10 acres)</option>
                    <option value="Large" className="bg-[#07130B]">Large Farmer (&gt; 10 acres)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Major Crops Cultivated *</label>
                <input
                  required
                  className="field mt-1"
                  value={crops}
                  onChange={(e) => setCrops(e.target.value)}
                  placeholder="e.g. Paddy, Kodo-Kutki, Mustard"
                />
              </div>
            </div>

            {/* Privacy Guarantee Notice */}
            <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3.5 text-xs text-emerald-300 flex items-start gap-2.5">
              <ShieldCheck className="size-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                KrishiSetu adheres strictly to MeitY AgriStack privacy standards. We do not store plaintext Aadhaar numbers, biometric PINs, or confidential banking passwords.
              </span>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <Link href="/login" className="text-xs text-slate-400 hover:text-white">
                Already registered? Sign In
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary text-xs px-8 py-3 shadow-lg cursor-pointer"
              >
                {loading ? "Registering..." : "Create Profile & Explore Schemes →"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
