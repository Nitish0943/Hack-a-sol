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
import { Card, PageHeading } from "@/components/ui-kit";
import { useTranslation } from "@/lib/i18n/context";
import { calculateBenefit } from "@/lib/api";

export default function CalculatorPage() {
  const { t, locale, speak } = useTranslation();

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
        description={t("calculator.sub")}
        action={
          <button
            onClick={handleAudioRead}
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3.5 py-1.5 text-xs font-bold transition cursor-pointer"
          >
            <Volume2 className="size-3.5" />
            <span>{locale === "hi" || locale === "cghi" ? "हिसाब सुनें" : "Listen Breakdown"}</span>
          </button>
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
                ? "bg-emerald-800 text-white shadow-md shadow-emerald-900/15 border border-emerald-600"
                : "border border-slate-200/80 bg-white/70 text-slate-700 hover:bg-emerald-50/50"
            }`}
          >
            <tab.icon className="size-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* Left Column: Configurable Parameters Form */}
        <Card className="p-5 sm:p-6 space-y-4 h-fit">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Calculator className="size-4.5 text-emerald-700" />
            Calculation Inputs (मापदंड)
          </h3>

          <div>
            <label className="text-xs font-bold text-slate-700">{t("calculator.areaLabel")} *</label>
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
            <label className="text-xs font-bold text-slate-700">Crop Category (फसल)</label>
            <select className="field mt-1.5" value={crop} onChange={(e) => setCrop(e.target.value)}>
              <option value="Paddy">Paddy (धान)</option>
              <option value="Kodo-Kutki">Kodo-Kutki / Ragi (लघु धान्य)</option>
              <option value="Maize">Maize (मक्का)</option>
              <option value="Pulses">Pulses / Arhar (दलहन)</option>
              <option value="Vegetables">Horticulture & Vegetables (सब्जियां)</option>
            </select>
          </div>

          {calcType === "kcc" && (
            <div>
              <label className="text-xs font-bold text-slate-700">{t("calculator.loanLabel")} *</label>
              <input
                className="field mt-1.5"
                type="number"
                step="10000"
                min="10000"
                max="300000"
                value={loan}
                onChange={(e) => setLoan(Number(e.target.value))}
              />
              <p className="mt-1 text-[11px] text-slate-400 font-medium">Standard subsidized cap: ₹3,00,000</p>
            </div>
          )}

          {calcType === "equipment" && (
            <div>
              <label className="text-xs font-bold text-slate-700">{t("calculator.equipmentLabel")} *</label>
              <select
                className="field mt-1.5"
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
              >
                <option value="Tractor (35-40 HP)">Tractor 35-40 HP (मानक ₹6,00,000)</option>
                <option value="Rotavator">Rotavator (मानक ₹1,10,000)</option>
                <option value="Power Tiller">Power Tiller (मानक ₹1,80,000)</option>
                <option value="Paddy Transplanter">Paddy Transplanter (मानक ₹2,50,000)</option>
                <option value="Solar Water Pump (5 HP)">Solar Pump 5 HP (मानक ₹2,20,000)</option>
              </select>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700">Farmer Category (किसान वर्ग)</label>
            <select
              className="field mt-1.5"
              value={farmerCat}
              onChange={(e) => setFarmerCat(e.target.value)}
            >
              <option value="Small & Marginal">Small & Marginal Farmer (लघु एवं सीमांत)</option>
              <option value="General">General / Large Farmer (सामान्य)</option>
            </select>
          </div>

          <button
            onClick={runCalculation}
            disabled={loading}
            className="w-full btn-primary py-3 text-sm mt-3 font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "Computing..." : t("calculator.calculateBtn")}</span>
          </button>
        </Card>

        {/* Right Column: Mathematical Breakdown Dossier */}
        <div>
          {result && (
            <Card elevated={true} className="p-6 sm:p-7 space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="rounded-full bg-emerald-100 text-emerald-800 px-3 py-0.5 text-xs font-bold">
                  {result.financial_year} State Allocation Policy
                </span>
                <h3 className="mt-2 text-xl sm:text-2xl font-black text-slate-900">
                  {locale === "hi" || locale === "cghi" ? result.calculator_type_hi : result.calculator_type}
                </h3>
              </div>

              {/* Main Benefit Result Callout */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-gradient-to-br from-emerald-800 to-forest-950 p-5 text-white shadow-lg shadow-emerald-950/20 border border-white/10">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                    {locale === "hi" || locale === "cghi" ? result.benefit_label_hi : result.benefit_label}
                  </p>
                  <p className="mt-2 text-3xl sm:text-4xl font-black">
                    ₹{result.estimated_benefit.toLocaleString("en-IN")}
                  </p>
                  <p className="mt-1 text-xs text-emerald-200/80 font-medium">Direct Government DBT / Subvention</p>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-xs">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {locale === "hi" || locale === "cghi" ? result.farmer_share_label_hi : result.farmer_share_label}
                  </p>
                  <p className="mt-2 text-3xl sm:text-4xl font-black text-slate-900">
                    ₹{result.farmer_share.toLocaleString("en-IN")}
                  </p>
                  <p className="mt-1 text-xs text-slate-400 font-medium">Farmer Contribution / Interest</p>
                </div>
              </div>

              {/* Formula & Rule Card */}
              <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-4">
                <p className="text-xs font-black uppercase tracking-wider text-emerald-900">
                  {t("calculator.formulaUsed")}
                </p>
                <p className="mt-1 font-mono text-xs sm:text-sm font-bold text-emerald-950">
                  {locale === "hi" || locale === "cghi" ? result.formula_hi : result.formula}
                </p>
              </div>

              {/* Detailed Breakdown List */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Step-by-Step Itemized Valuation
                </h4>
                <div className="rounded-2xl border border-slate-200/80 bg-white/70 overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs font-medium">
                    <tbody>
                      {result.breakdown?.map((item: any, idx: number) => (
                        <tr key={idx} className="border-b border-slate-100 last:border-none">
                          <td className="p-3.5 text-slate-600 font-semibold">{item.label}</td>
                          <td className="p-3.5 text-right font-black text-slate-900 font-mono">
                            {item.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Policy Authority Reference */}
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs space-y-1.5">
                <p className="font-bold text-slate-800">
                  Policy Authority: <span className="font-medium text-slate-600">{result.policy_reference}</span>
                </p>
                <p className="text-slate-500 leading-relaxed">
                  <strong>Important Limitation:</strong> {result.disclaimer}
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
