"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShieldCheck, Sprout, UserCheck, Wheat } from "lucide-react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useTranslation } from "@/lib/i18n/context";

export default function RegisterPage() {
  const router = useRouter();
  const { t, locale } = useTranslation();
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
  const [cultivatorStatus, setCultivatorStatus] = useState("Landowner");
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
    <main className="min-h-screen bg-[#F8FAF5] px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Top Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-emerald-800 to-forest-950 text-white shadow-md">
              <Sprout className="size-6 text-emerald-200" />
            </span>
            <div>
              <span className="text-xl font-black text-slate-900 leading-none">KrishiSetu</span>
              <span className="block text-xs font-bold text-emerald-800 mt-1">कृषि सेतु पंजीयन</span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher showAudioPill={false} />
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-800 transition"
            >
              <ArrowLeft className="size-3.5" /> Already registered? Log in
            </Link>
          </div>
        </div>

        {/* Liquid Glass Registration Container */}
        <section className="rounded-3xl border border-white/90 bg-white/80 p-6 sm:p-10 shadow-[0_20px_50px_-12px_rgba(20,83,45,0.08),0_0_0_1px_rgba(22,101,52,0.06)] backdrop-blur-3xl">
          <div className="mb-8 border-b border-slate-100 pb-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/60 bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-900 mb-2">
              <UserCheck className="size-3.5 text-emerald-700" /> Farmer Registration
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Create Your Agricultural Entitlement Profile
            </h1>
            <p className="mt-1 text-sm text-slate-600 font-medium">
              We collect only the essential information needed to match you with Central and Chhattisgarh schemes. No Aadhaar numbers, biometric details, or banking passwords required.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. Personal Information */}
            <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-5 backdrop-blur-md shadow-2xs">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2 mb-4">
                <span className="grid size-6 place-items-center rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
                  1
                </span>
                Personal Information (व्यक्तिगत विवरण)
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-slate-700">Full Name (पूरा नाम) *</label>
                  <input
                    className="field mt-1.5"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Mobile Number (मोबाइल नंबर) *</label>
                  <input
                    className="field mt-1.5"
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Preferred Language (पसंदीदा भाषा) *</label>
                  <select
                    className="field mt-1.5"
                    value={preferredLang}
                    onChange={(e) => setPreferredLang(e.target.value)}
                  >
                    <option value="hi">हिन्दी (Hindi)</option>
                    <option value="cghi">छत्तीसगढ़ी (Chhattisgarhi)</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Farmer Category (किसान श्रेणी) *</label>
                  <select
                    className="field mt-1.5"
                    value={farmerCat}
                    onChange={(e) => setFarmerCat(e.target.value)}
                  >
                    <option value="Small & Marginal">Small & Marginal (&lt; 5 acres / 2 hectares)</option>
                    <option value="Medium">Medium Farmer (5 – 10 acres)</option>
                    <option value="Large">Large Farmer (&gt; 10 acres)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Location Details */}
            <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-5 backdrop-blur-md shadow-2xs">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2 mb-4">
                <span className="grid size-6 place-items-center rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
                  2
                </span>
                Geographic Location (स्थान विवरण)
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">State (राज्य) *</label>
                  <input
                    className="field mt-1.5"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">District (ज़िला) *</label>
                  <input
                    className="field mt-1.5"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Block (विकासखंड) *</label>
                  <input
                    className="field mt-1.5"
                    required
                    value={block}
                    onChange={(e) => setBlock(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Village / Gram (ग्राम) *</label>
                  <input
                    className="field mt-1.5"
                    required
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">PIN Code</label>
                  <input className="field mt-1.5" defaultValue="492001" />
                </div>
              </div>
            </div>

            {/* 3. Cultivator Identity Bridge (Crucial USP) */}
            <div className="rounded-2xl border border-amber-300/80 bg-amber-50/50 p-5 backdrop-blur-md shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span className="grid size-6 place-items-center rounded-lg bg-amber-500 text-slate-950 text-xs font-black">
                    3
                  </span>
                  Cultivator Identity Bridge (काश्तकार पहचान सेतु)
                </h2>
                <span className="rounded-full bg-amber-200/80 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-900">
                  Land Ownership ≠ Cultivation
                </span>
              </div>
              <p className="text-xs text-amber-900/80 font-medium mb-4">
                Are you cultivating your own titled land, or are you a tenant farmer / sharecropper (बटाईदार)? We ensure tenant cultivators receive legitimate state input entitlements.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-slate-800">Cultivator Status (खेती का अधिकार) *</label>
                  <select
                    className="field mt-1.5 bg-white"
                    value={cultivatorStatus}
                    onChange={(e) => setCultivatorStatus(e.target.value)}
                  >
                    <option value="Landowner">Landowner (भूमि स्वामी / पट्टेदार)</option>
                    <option value="Tenant Farmer">Tenant Farmer (किराएदार काश्तकार)</option>
                    <option value="Sharecropper">Sharecropper (बटाईदार / अधिया किसान)</option>
                    <option value="Joint Landholder">Joint Family Landholder (संयुक्त खातादार)</option>
                    <option value="Mutation Pending">Land Mutation Pending (नामांतरण लंबित)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-800">Cultivated Area in Acres (रकबा) *</label>
                  <input
                    className="field mt-1.5 bg-white"
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={landAcres}
                    onChange={(e) => setLandAcres(Number(e.target.value))}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-800">Cultivated Crops (बोई गई फसलें) *</label>
                  <input
                    className="field mt-1.5 bg-white"
                    value={crops}
                    onChange={(e) => setCrops(e.target.value)}
                    placeholder="e.g. Paddy, Kodo-Kutki, Ragi, Maize"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-5">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <ShieldCheck className="size-4 text-emerald-700" /> Safe demonstration profile
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary px-8 py-3.5 text-base shadow-lg cursor-pointer"
              >
                {loading ? "Generating Profile..." : "Create Farmer Profile →"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
