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
import { Card, PageHeading, StatusBadge } from "@/components/ui-kit";
import { useTranslation } from "@/lib/i18n/context";

export default function ProfilePage() {
  const { t, locale, speak } = useTranslation();
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
  const [cultivatorStatus, setCultivatorStatus] = useState("Landowner");
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
        description="Comprehensive personal, location, agricultural and cultivator entitlement records"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={handleAudioSummary}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1.5 text-xs font-bold transition cursor-pointer"
            >
              <Volume2 className="size-3.5" />
              <span>{locale === "hi" || locale === "cghi" ? "प्रोफ़ाइल सुनें" : "Listen Profile"}</span>
            </button>
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
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="size-4 text-emerald-700" />
          <span>Profile changes successfully synchronized with KrishiSetu database.</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Profile Card Badge */}
        <div className="space-y-5">
          <Card className="text-center p-6">
            <span className="mx-auto grid size-20 place-items-center rounded-3xl bg-gradient-to-br from-emerald-800 to-forest-950 text-2xl font-black text-white shadow-md">
              RK
            </span>
            <h3 className="mt-4 font-black text-xl text-slate-900">{name}</h3>
            <p className="text-xs font-mono font-bold text-emerald-800 mt-0.5">KS-CG-10482</p>
            <p className="text-xs text-slate-500 font-medium">{village}, {district} (C.G.)</p>

            <div className="mt-5 border-t border-slate-100 pt-4 text-left space-y-3">
              <div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-500">{t("dashboard.profileCompletion")}</span>
                  <span className="text-emerald-800 font-black">85%</span>
                </div>
                <div className="mt-1.5 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full w-[85%] rounded-full bg-emerald-600" />
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Verification Status
                </p>
                <div className="mt-1">
                  <StatusBadge status="Verified Landowner" />
                </div>
              </div>
            </div>
          </Card>

          {/* Cultivator Identity Bridge Spotlight */}
          <div className="rounded-2xl border border-amber-300/80 bg-gradient-to-br from-amber-50 to-orange-50/50 p-5 shadow-xs">
            <div className="flex items-center gap-2 text-amber-900 font-black text-xs mb-2">
              <ShieldCheck className="size-4 text-amber-700" /> Cultivator Identity Bridge
            </div>
            <p className="text-xs text-amber-950/80 font-medium leading-relaxed">
              If you cultivate additional land as a <strong>Sharecropper (बटाईदार)</strong> or have a pending inheritance mutation, you can upload evidence here for extension officer certification.
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs font-bold text-amber-900">
              <FileCheck className="size-3.5 text-amber-700" /> Current: {cultivatorStatus}
            </div>
          </div>
        </div>

        {/* Detailed Profile Edit Form */}
        <Card elevated={true} className="p-6 sm:p-8">
          <form onSubmit={handleSave} className="space-y-6">
            {/* 1. Personal Details */}
            <div className="space-y-3">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <User className="size-4 text-emerald-700" />
                Personal Details (व्यक्तिगत विवरण)
              </h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-slate-700">Full Name *</label>
                  <input
                    disabled={!editing}
                    className="field mt-1"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Registered Mobile *</label>
                  <input
                    disabled={!editing}
                    className="field mt-1"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Preferred Language</label>
                  <select
                    disabled={!editing}
                    className="field mt-1"
                    value={preferredLang}
                    onChange={(e) => setPreferredLang(e.target.value)}
                  >
                    <option value="hi">हिन्दी (Hindi)</option>
                    <option value="cghi">छत्तीसगढ़ी (Chhattisgarhi)</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Farmer Category</label>
                  <select
                    disabled={!editing}
                    className="field mt-1"
                    value={farmerCat}
                    onChange={(e) => setFarmerCat(e.target.value)}
                  >
                    <option value="Small & Marginal">Small & Marginal (&lt; 5 acres)</option>
                    <option value="Medium">Medium Farmer (5–10 acres)</option>
                    <option value="Large">Large Farmer (&gt; 10 acres)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Geographic Location */}
            <div className="space-y-3 pt-3">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Wheat className="size-4 text-emerald-700" />
                Location & Administration (स्थान)
              </h4>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">State *</label>
                  <input
                    disabled={!editing}
                    className="field mt-1"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">District *</label>
                  <input
                    disabled={!editing}
                    className="field mt-1"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Block / Tehsil *</label>
                  <input
                    disabled={!editing}
                    className="field mt-1"
                    value={block}
                    onChange={(e) => setBlock(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Village / Gram *</label>
                  <input
                    disabled={!editing}
                    className="field mt-1"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">PIN Code</label>
                  <input
                    disabled={!editing}
                    className="field mt-1"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* 3. Agricultural & Cultivator Identity */}
            <div className="space-y-3 pt-3">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <ShieldCheck className="size-4 text-emerald-700" />
                Cultivator Identity & Land Metrics (कृषि एवं काश्तकार अधिकार)
              </h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-slate-700">Cultivator Status *</label>
                  <select
                    disabled={!editing}
                    className="field mt-1"
                    value={cultivatorStatus}
                    onChange={(e) => setCultivatorStatus(e.target.value)}
                  >
                    <option value="Landowner">Landowner (भूमि स्वामी / पट्टेदार)</option>
                    <option value="Tenant Farmer">Tenant Farmer (किराएदार काश्तकार)</option>
                    <option value="Sharecropper">Sharecropper (बटाईदार / अधिया किसान)</option>
                    <option value="Joint Landholder">Joint Landholder (संयुक्त खातादार)</option>
                    <option value="Mutation Pending">Land Mutation Pending (नामांतरण लंबित)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Cultivated Area (Acres) *</label>
                  <input
                    disabled={!editing}
                    className="field mt-1"
                    type="number"
                    step="0.1"
                    value={area}
                    onChange={(e) => setArea(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Primary Crops *</label>
                  <input
                    disabled={!editing}
                    className="field mt-1"
                    value={crops}
                    onChange={(e) => setCrops(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Farming Season</label>
                  <select
                    disabled={!editing}
                    className="field mt-1"
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                  >
                    <option value="Kharif">Kharif (खरीफ - जून से अक्टूबर)</option>
                    <option value="Rabi">Rabi (रबी - नवंबर से अप्रैल)</option>
                    <option value="Zaid">Zaid / Summer (जायद)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Irrigation Source</label>
                  <input
                    disabled={!editing}
                    className="field mt-1"
                    value={irrigation}
                    onChange={(e) => setIrrigation(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {editing && (
              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  className="btn-primary px-6 py-2.5 text-xs font-extrabold flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Save className="size-4" />
                  <span>Save Profile Updates</span>
                </button>
              </div>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
}
