"use client";

import {
  Calculator,
  CheckCircle2,
  HelpCircle,
  IndianRupee,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Volume2,
  Wheat,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Card, PageHeading, VoiceAssistButton } from "@/components/ui-kit";
import { useTranslation } from "@/lib/i18n/context";
import { calculateBenefit } from "@/lib/api";

export default function CalculatorPage() {
  const { t, locale, speak, language } = useTranslation();

  // Inputs
  const [calcType, setCalcType] = useState("kcc");
  const [area, setArea] = useState(2.0);
  const [loan, setLoan] = useState(100000);
  const [crop, setCrop] = useState("Paddy");
  const [equipment, setEquipment] = useState("Tractor (35-40 HP)");
  const [farmerCat, setFarmerCat] = useState("Small & Marginal");

  // Output
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    runCalculation();
  }, [calcType]);

  const runCalculation = async () => {
    setLoading(true);
    try {
      const res = await calculateBenefit({
        calculator_type: calcType,
        area_acres: Number(area),
        crop,
        loan_amount: Number(loan),
        equipment_type: equipment,
        farmer_category: farmerCat,
        state: "Chhattisgarh",
        financial_year: "2026-27",
      });
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAudioRead = () => {
    if (!result) return;
    const text =
      locale === "cghi"
        ? `अनुमानित सरकारी फायदा: ₹${result.estimated_benefit.toLocaleString("en-IN")}। किसान के हिस्सा: ₹${result.farmer_share.toLocaleString("en-IN")}।`
        : locale === "hi"
          ? `अनुमानित सरकारी लाभ: ₹${result.estimated_benefit.toLocaleString("en-IN")}। किसान का अंशदान: ₹${result.farmer_share.toLocaleString("en-IN")}।`
          : `Estimated financial entitlement: ₹${result.estimated_benefit.toLocaleString("en-IN")}. Farmer out-of-pocket share: ₹${result.farmer_share.toLocaleString("en-IN")}.`;
    speak(text);
  };

  return (
    <div className="space-y-6">
      <PageHeading
        title={t("calculator.title")}
        description={
          language === "hi"
            ? "केसीसी 4% शुद्ध ब्याज दर, कृषि यंत्र 50% छूट, ड्रिप सिंचाई 70% अनुदान एवं राजीव गांधी किसान न्याय योजना की सटीक गणितीय गणना।"
            : "Transparent mathematical modeling of KCC 4% net interest, SMAM 50% machinery subsidies, micro-irrigation 70% grants, and RGKNY input assistance."
        }
        action={
          <VoiceAssistButton
            text="Government Loan & Subsidy Calculator. Select loan or equipment type to compute exact subvention."
            label={locale === "hi" || locale === "cghi" ? "हिसाब सुनें" : "Listen Breakdown"}
          />
        }
      />

      {/* Calculator Type Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: "kcc", label: "Kisan Credit Card (4% Net)", icon: IndianRupee },
          { id: "equipment", label: "Farm Equipment Subsidy (SMAM)", icon: Wheat },
          { id: "irrigation", label: "Drip / Sprinkler Irrigation (70%)", icon: Sparkles },
          { id: "rgkny", label: "RGKNY Input Support (₹9,000/acre)", icon: ShieldCheck },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCalcType(tab.id)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              calcType === tab.id
                ? "bg-emerald-500 text-slate-950 font-extrabold shadow-[0_0_15px_rgba(16,185,129,0.35)]"
                : "border border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/10"
            }`}
          >
            <tab.icon className="size-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* Left Column: Configurable Parameters Form */}
        <div className="glass-panel p-6 space-y-4 h-fit border border-white/10">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/[0.08] pb-3 font-display">
            <Calculator className="size-4 text-emerald-400" />
            Calculation Inputs (मापदंड)
          </h3>

          <div>
            <label className="text-xs font-semibold text-slate-300">{t("calculator.areaLabel")} *</label>
            <input
              className="field mt-1.5"
              type="number"
              step="0.5"
              min="0.5"
              value={area}
              onChange={(e) => setArea(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">Crop Category (फसल)</label>
            <select className="field mt-1.5 cursor-pointer" value={crop} onChange={(e) => setCrop(e.target.value)}>
              <option value="Paddy" className="bg-[#07130B]">Paddy (धान)</option>
              <option value="Kodo-Kutki" className="bg-[#07130B]">Kodo-Kutki / Ragi (लघु धान्य)</option>
              <option value="Maize" className="bg-[#07130B]">Maize (मक्का)</option>
              <option value="Pulses" className="bg-[#07130B]">Pulses / Arhar (दलहन)</option>
              <option value="Vegetables" className="bg-[#07130B]">Horticulture & Vegetables (सब्जियां)</option>
            </select>
          </div>

          {calcType === "kcc" && (
            <div>
              <label className="text-xs font-semibold text-slate-300">{t("calculator.loanLabel")} *</label>
              <input
                className="field mt-1.5"
                type="number"
                step="10000"
                min="10000"
                max="300000"
                value={loan}
                onChange={(e) => setLoan(Number(e.target.value))}
              />
              <p className="mt-1 text-[11px] text-slate-400 font-mono">Standard subsidized cap: ₹3,00,000</p>
            </div>
          )}

          {calcType === "equipment" && (
            <div>
              <label className="text-xs font-semibold text-slate-300">{t("calculator.equipmentLabel")} *</label>
              <select
                className="field mt-1.5 cursor-pointer"
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
              >
                <option value="Tractor (35-40 HP)" className="bg-[#07130B]">Tractor (35-40 HP) — Max ₹1,25,000</option>
                <option value="Power Tiller" className="bg-[#07130B]">Power Tiller — Max ₹65,000</option>
                <option value="Rotavator / Cultivator" className="bg-[#07130B]">Rotavator / Cultivator — Max ₹45,000</option>
                <option value="Multi-crop Thresher" className="bg-[#07130B]">Multi-crop Thresher — Max ₹50,000</option>
              </select>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-300">Farmer Category</label>
            <select
              className="field mt-1.5 cursor-pointer"
              value={farmerCat}
              onChange={(e) => setFarmerCat(e.target.value)}
            >
              <option value="Small & Marginal" className="bg-[#07130B]">Small & Marginal (&lt; 5 Acres) — Higher Tier</option>
              <option value="Medium & Large" className="bg-[#07130B]">Medium & Large (&gt; 5 Acres)</option>
              <option value="Women / SC / ST" className="bg-[#07130B]">Women / SC / ST Cultivator (Priority 10% Extra)</option>
            </select>
          </div>

          <button
            onClick={runCalculation}
            disabled={loading}
            className="w-full btn-primary text-xs font-bold py-3 mt-2 shadow-lg"
          >
            {loading ? <RefreshCw className="size-4 animate-spin" /> : <Calculator className="size-4" />}
            <span>{loading ? t("common.calculating") : t("common.recalculate")}</span>
          </button>
        </div>

        {/* Right Column: Mathematical Breakdown Results */}
        <div className="space-y-6">
          {result && (
            <>
              {/* Highlight Output Cards */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="glass-card p-6 border border-emerald-500/30 bg-emerald-500/10 space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                    {result.benefit_label}
                  </span>
                  <p className="text-3xl sm:text-4xl font-extrabold text-white font-mono tabular-nums">
                    ₹{result.estimated_benefit.toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-emerald-300/80 font-mono">Government Subsidized Entitlement</p>
                </div>

                <div className="glass-card p-6 border border-white/10 bg-white/[0.02] space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    {result.farmer_share_label}
                  </span>
                  <p className="text-3xl sm:text-4xl font-extrabold text-slate-100 font-mono tabular-nums">
                    ₹{result.farmer_share.toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-slate-400 font-mono">Net Farmer Out-of-Pocket Share</p>
                </div>
              </div>

              {/* Exact Formula & Circular Citation */}
              <div className="glass-panel p-6 space-y-4 border border-white/10">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/[0.08] pb-3 font-display">
                  <ShieldCheck className="size-4 text-emerald-400" />
                  Statutory Rule & Formula Citation
                </h3>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs font-mono text-emerald-300">
                  {result.formula}
                </div>

                <div className="space-y-2 text-xs">
                  <p className="text-slate-400">
                    Authority: <strong className="text-slate-200">{result.policy_reference}</strong>
                  </p>
                  <p className="text-slate-400">
                    Enforced Version: <span className="text-emerald-400 font-semibold">{result.financial_year}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 italic mt-2">{result.disclaimer}</p>
                </div>
              </div>

              {/* Step-by-Step Breakdown Table */}
              <div className="glass-panel p-6 space-y-4 border border-white/10">
                <h3 className="text-sm font-bold text-white font-display">Detailed Computation Components</h3>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Calculation Metric</th>
                        <th>Computed Valuation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.breakdown?.map((b: any, idx: number) => (
                        <tr key={idx}>
                          <td className="font-semibold text-slate-200">{b.label}</td>
                          <td className="font-mono font-bold text-emerald-400">{b.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
