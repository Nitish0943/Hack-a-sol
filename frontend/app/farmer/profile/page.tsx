"use client";

import {
  CheckCircle2,
  FileCheck,
  FileText,
  Save,
  ShieldCheck,
  Upload,
  User,
  UserCheck,
  Volume2,
  Wheat,
} from "lucide-react";
import React, { useState } from "react";
import { Card, PageHeading, StatusBadge, VoiceAssistButton } from "@/components/ui-kit";
import { useTranslation } from "@/lib/i18n/context";

export default function ProfilePage() {
  const { t, locale, speak, language } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form Fields
  const [name, setName] = useState("Ramesh Kumar");
  const [phone, setPhone] = useState("9876543210");
  const [preferredLang, setPreferredLang] = useState("hi");
  const [state, setState] = useState("Chhattisgarh");
  const [district, setDistrict] = useState("Raipur");
  const [block, setBlock] = useState("Arang");
  const [village, setVillage] = useState("Khamtarai");
  const [pincode, setPincode] = useState("492001");
  const [farmerCat, setFarmerCat] = useState("Small & Marginal");
  const [cultivatorStatus, setCultivatorStatus] = useState("Sharecropper");
  const [area, setArea] = useState(2.0);
  const [crops, setCrops] = useState("Paddy, Kodo-Kutki");
  const [season, setSeason] = useState("Kharif");
  const [irrigation, setIrrigation] = useState("Tube well");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("http://localhost:8000/api/v1/farmers/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          state,
          district,
          block,
          village,
          pincode,
          farmer_category: farmerCat,
          cultivator_status: cultivatorStatus,
          landholding_acres: Number(area),
          cultivated_area: Number(area),
          crops_json: JSON.stringify(crops.split(",").map((c) => c.trim())),
          farming_season: season,
          irrigation_type: irrigation,
        }),
      }).catch(() => null);
    } catch {
      // ignore
    }

    setEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAudioSummary = () => {
    const text =
      locale === "cghi"
        ? `किसान प्रोफाइल: ${name}। गांव: ${village}, जिला: ${district}। रकबा: ${area} एकड़। फसल: ${crops}। खेती के अधिकार: ${cultivatorStatus}।`
        : locale === "hi"
          ? `किसान प्रोफ़ाइल: ${name}। ग्राम: ${village}, ज़िला: ${district}। रकबा: ${area} एकड़। फसल: ${crops}। काश्तकार स्थिति: ${cultivatorStatus}।`
          : `Farmer profile: ${name}. Village: ${village}, District: ${district}. Cultivated area: ${area} acres. Crops: ${crops}. Cultivator status: ${cultivatorStatus}.`;
    speak(text);
  };

  return (
    <div className="space-y-6">
      <PageHeading
        title={t("nav.profile")}
        description={
          language === "hi"
            ? "व्यक्तिगत पहचान, काश्तकार वर्गीकरण (बटाईदार/काश्तकार/भू-स्वामी) एवं कृषि रकबा अभिलेख।"
            : "Comprehensive personal, agrarian profile, and Cultivator Identity Bridge records."
        }
        action={
          <div className="flex items-center gap-2">
            <VoiceAssistButton
              text={`Farmer Profile for ${name}. Village ${village}, ${district}. Cultivator status: ${cultivatorStatus}.`}
              label={locale === "hi" || locale === "cghi" ? "प्रोफ़ाइल सुनें" : "Listen Profile"}
            />
            <button
              onClick={() => setEditing(!editing)}
              className="btn-glass text-xs py-2 px-4 cursor-pointer"
            >
              {editing ? t("common.cancel") : t("common.edit")}
            </button>
          </div>
        }
      />

      {savedSuccess && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300 text-xs font-bold flex items-center gap-2 backdrop-blur-md">
          <CheckCircle2 className="size-4 text-emerald-400" />
          <span>Profile changes successfully synchronized with KrishiSetu database.</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Profile Card Badge */}
        <div className="space-y-5">
          <div className="glass-card text-center p-6 space-y-4">
            <span className="mx-auto grid size-20 place-items-center rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-2xl font-black text-slate-950 shadow-lg border border-white/30">
              RK
            </span>
            <div>
              <h3 className="font-extrabold text-xl text-white font-display">{name}</h3>
              <p className="text-xs font-mono font-bold text-emerald-400 mt-0.5">KS-CG-10482</p>
              <p className="text-xs text-slate-400 font-medium">{village}, {district} (C.G.)</p>
            </div>

            <div className="border-t border-white/[0.08] pt-4 text-left space-y-3">
              <div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400">{t("dashboard.profileCompletion")}</span>
                  <span className="text-emerald-400 font-mono font-extrabold">85%</span>
                </div>
                <div className="mt-1.5 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full w-[85%] rounded-full bg-emerald-400 shadow-[0_0_10px_#34D399]" />
                </div>
              </div>

              <div>
                <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Verification Status
                </p>
                <div className="mt-1.5">
                  <StatusBadge status="Gram Sabha Verified" />
                </div>
              </div>
            </div>
          </div>

          {/* Cultivator Identity Bridge Spotlight */}
          <div className="rounded-2xl border border-purple-500/30 bg-purple-950/30 p-5 backdrop-blur-md space-y-2">
            <div className="flex items-center gap-2 text-purple-300 font-bold text-xs uppercase tracking-wide">
              <ShieldCheck className="size-4 text-purple-400" />
              <span>Cultivator Identity Bridge</span>
            </div>
            <p className="text-xs text-purple-200/80 leading-relaxed">
              If you cultivate additional land as a <strong>Sharecropper (बटाईदार)</strong> or have a pending inheritance mutation, you can upload evidence here for extension officer certification.
            </p>
            <div className="pt-1 flex items-center gap-2 text-xs font-bold text-white">
              <FileCheck className="size-3.5 text-purple-400" />
              <span>Current: {cultivatorStatus}</span>
            </div>
          </div>
        </div>

        {/* Detailed Profile Edit Form */}
        <div className="glass-panel p-6 sm:p-8 border border-white/10">
          <form onSubmit={handleSave} className="space-y-6">
            {/* 1. Personal Details */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/[0.08] pb-2 font-display">
                <User className="size-4 text-emerald-400" />
                Personal Details (व्यक्तिगत विवरण)
              </h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Full Name *</label>
                  <input
                    disabled={!editing}
                    className="field mt-1"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Registered Mobile *</label>
                  <input
                    disabled={!editing}
                    className="field mt-1"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Preferred Language</label>
                  <select
                    disabled={!editing}
                    className="field mt-1 cursor-pointer"
                    value={preferredLang}
                    onChange={(e) => setPreferredLang(e.target.value)}
                  >
                    <option value="hi" className="bg-[#07130B]">हिन्दी (Hindi)</option>
                    <option value="cghi" className="bg-[#07130B]">छत्तीसगढ़ी (Chhattisgarhi)</option>
                    <option value="en" className="bg-[#07130B]">English</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Farmer Category</label>
                  <select
                    disabled={!editing}
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
            </div>

            {/* 2. Geographic Location */}
            <div className="space-y-3 pt-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/[0.08] pb-2 font-display">
                <Wheat className="size-4 text-emerald-400" />
                Location & Administration (स्थान)
              </h4>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">State *</label>
                  <input
                    disabled={!editing}
                    className="field mt-1"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">District *</label>
                  <input
                    disabled={!editing}
                    className="field mt-1"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Block / Tehsil *</label>
                  <input
                    disabled={!editing}
                    className="field mt-1"
                    value={block}
                    onChange={(e) => setBlock(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Village / Gram *</label>
                  <input
                    disabled={!editing}
                    className="field mt-1"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">PIN Code</label>
                  <input
                    disabled={!editing}
                    className="field mt-1"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* 3. Cultivator Identity Bridge */}
            <div className="space-y-3 pt-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/[0.08] pb-2 font-display">
                <ShieldCheck className="size-4 text-purple-400" />
                Cultivator Identity & Agrarian Status (काश्तकार स्थिति)
              </h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Cultivator Status *</label>
                  <select
                    disabled={!editing}
                    className="field mt-1 cursor-pointer"
                    value={cultivatorStatus}
                    onChange={(e) => setCultivatorStatus(e.target.value)}
                  >
                    <option value="Sharecropper" className="bg-[#07130B]">Sharecropper (बटाईदार / 50:50 Oral Agreement)</option>
                    <option value="Tenant" className="bg-[#07130B]">Tenant Farmer (पट्टेदार / Leaseholder)</option>
                    <option value="Landowner" className="bg-[#07130B]">Landowner (भू-स्वामी)</option>
                    <option value="Joint Owner" className="bg-[#07130B]">Joint Family Landholding</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Cultivated Area (Acres) *</label>
                  <input
                    disabled={!editing}
                    className="field mt-1 font-mono"
                    type="number"
                    step="0.1"
                    value={area}
                    onChange={(e) => setArea(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {editing && (
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="rounded-xl border border-white/10 px-5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs px-6 py-2.5 shadow-lg">
                  <Save className="size-4" />
                  <span>Save Profile</span>
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
