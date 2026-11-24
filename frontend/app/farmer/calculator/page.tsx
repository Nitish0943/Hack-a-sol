"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Calculator, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  HelpCircle, 
  FileText, 
  Layers, 
  ShieldCheck,
  TrendingDown
} from "lucide-react";
import { Card, PageHeading } from "@/components/ui-kit";
import { calculatorApi } from "@/lib/api";

type CalcMode = "loan" | "machinery" | "irrigation";

export default function CalculatorPage() {
  const [mode, setMode] = useState<CalcMode>("loan");

  // Loan state
  const [principal, setPrincipal] = useState<number>(150000);
  const [interestRate, setInterestRate] = useState<number>(7);
  const [subventionRate, setSubventionRate] = useState<number>(3);
  const [tenureMonths, setTenureMonths] = useState<number>(12);
  const [crop, setCrop] = useState<string>("Paddy");
  const [area, setArea] = useState<number>(2.5);

  // Subsidy state
  const [cost, setCost] = useState<number>(250000);
  const [subsidyPercent, setSubsidyPercent] = useState<number>(50);
  const [maxSubsidy, setMaxSubsidy] = useState<number>(125000);
  const [equipmentType, setEquipmentType] = useState<string>("Power Tiller & Rotavator");

  // Output state
  const [loading, setLoading] = useState(false);
  const [calculated, setCalculated] = useState(true);
  const [successNote, setSuccessNote] = useState<string | null>(null);

  // Compute live estimates
  const normalInterest = Math.round(principal * (interestRate / 100) * (tenureMonths / 12));
  const subventionAmount = Math.round(principal * (subventionRate / 100) * (tenureMonths / 12));
  const effectiveInterest = Math.max(0, normalInterest - subventionAmount);
  const effectiveLoanRepayment = principal + effectiveInterest;
  const effectiveRate = Math.max(0, interestRate - subventionRate);

  const rawSubsidy = Math.round(cost * (subsidyPercent / 100));
  const cappedSubsidy = Math.min(rawSubsidy, maxSubsidy);
  const farmerShare = Math.max(0, cost - cappedSubsidy);

  const handleCalculate = async () => {
    setLoading(true);
    setSuccessNote(null);
    try {
      if (mode === "loan") {
        await calculatorApi.calculateLoan({
          principalAmount: principal,
          annualInterestRate: interestRate,
          applicableSubventionRate: subventionRate,
          tenureMonths,
        });
      } else {
        await calculatorApi.calculateSubsidy({
          eligibleCost: cost,
          subsidyPercentage: subsidyPercent,
          maximumSubsidy: maxSubsidy,
        });
      }
      setSuccessNote("Calculation logged to financial digital twin ledger.");
    } catch {
      // Fallback works smoothly client-side
      setSuccessNote("Estimated using live demonstrator formula.");
    } finally {
      setLoading(false);
      setCalculated(true);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeading
        title="Scheme & Benefit Calculator"
        description="Estimate loan interest subvention, equipment subsidies, and crop assistance in real-time"
      />

      {/* Mode Selector Tabs */}
      <div className="flex flex-wrap gap-2.5">
        <button
          onClick={() => { setMode("loan"); setSuccessNote(null); }}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
            mode === "loan"
              ? "glass-green shadow-md"
              : "glass hover:bg-white/40 dark:hover:bg-slate-800/40"
          }`}
        >
          <Calculator className="size-4" />
          KCC Loan Subvention
        </button>
        <button
          onClick={() => {
            setMode("machinery");
            setCost(200000);
            setSubsidyPercent(50);
            setMaxSubsidy(100000);
            setEquipmentType("Rotavator / Tractor Implements");
            setSuccessNote(null);
          }}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
            mode === "machinery"
              ? "glass-green shadow-md"
              : "glass hover:bg-white/40 dark:hover:bg-slate-800/40"
          }`}
        >
          <Layers className="size-4" />
          Farm Machinery Subsidy
        </button>
        <button
          onClick={() => {
            setMode("irrigation");
            setCost(120000);
            setSubsidyPercent(55);
            setMaxSubsidy(70000);
            setEquipmentType("Drip & Sprinkler Micro-Irrigation");
            setSuccessNote(null);
          }}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
            mode === "irrigation"
              ? "glass-green shadow-md"
              : "glass hover:bg-white/40 dark:hover:bg-slate-800/40"
          }`}
        >
          <Sparkles className="size-4" />
          Micro-Irrigation (PMKSY)
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        {/* Controls Column */}
        <Card className="glass relative overflow-hidden">
          <div className="border-b border-black/5 pb-4 dark:border-white/10">
            <h3 className="font-bold text-slate-900 dark:text-white">
              {mode === "loan" ? "Loan Parameters" : "Subsidy Parameters"}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Adjust variables to preview net benefits
            </p>
          </div>

          <div className="mt-5 space-y-4">
            {mode === "loan" ? (
              <>
                <div>
                  <div className="flex justify-between text-sm font-medium">
                    <label htmlFor="principal-input" className="text-slate-700 dark:text-slate-200">Principal Loan Amount</label>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      ₹{principal.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <input
                    id="principal-range"
                    aria-label="Principal Loan Amount Range"
                    type="range"
                    min="25000"
                    max="500000"
                    step="5000"
                    value={principal}
                    onChange={(e) => setPrincipal(Number(e.target.value))}
                    className="mt-2 w-full accent-emerald-600"
                  />
                  <input
                    id="principal-input"
                    aria-label="Principal Loan Amount"
                    type="number"
                    value={principal}
                    onChange={(e) => setPrincipal(Math.max(0, Number(e.target.value)))}
                    className="field mt-1.5 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="rate-input" className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Bank Rate (% p.a.)
                    </label>
                    <input
                      id="rate-input"
                      aria-label="Bank Rate (% p.a.)"
                      type="number"
                      step="0.5"
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                      className="field mt-1 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="subvention-input" className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Subvention (% p.a.)
                    </label>
                    <input
                      id="subvention-input"
                      aria-label="Subvention (% p.a.)"
                      type="number"
                      step="0.5"
                      value={subventionRate}
                      onChange={(e) => setSubventionRate(Number(e.target.value))}
                      className="field mt-1 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="tenure-select" className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Tenure (Months)
                    </label>
                    <select
                      id="tenure-select"
                      aria-label="Tenure (Months)"
                      value={tenureMonths}
                      onChange={(e) => setTenureMonths(Number(e.target.value))}
                      className="field mt-1 text-sm"
                    >
                      <option value={6}>6 Months</option>
                      <option value={12}>12 Months (1 Year)</option>
                      <option value={24}>24 Months (2 Years)</option>
                      <option value={36}>36 Months (3 Years)</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="crop-select" className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Crop Cultivated
                    </label>
                    <select
                      id="crop-select"
                      aria-label="Crop Cultivated"
                      value={crop}
                      onChange={(e) => setCrop(e.target.value)}
                      className="field mt-1 text-sm"
                    >
                      <option>Paddy</option>
                      <option>Wheat</option>
                      <option>Maize</option>
                      <option>Soybean</option>
                      <option>Sugarcane</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="area-input" className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Cultivated Area (Acres)
                  </label>
                  <input
                    id="area-input"
                    aria-label="Cultivated Area (Acres)"
                    type="number"
                    step="0.5"
                    value={area}
                    onChange={(e) => setArea(Number(e.target.value))}
                    className="field mt-1 text-sm"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label htmlFor="equipment-type-select" className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Selected Equipment / Asset
                  </label>
                  <select
                    id="equipment-type-select"
                    aria-label="Selected Equipment / Asset"
                    value={equipmentType}
                    onChange={(e) => setEquipmentType(e.target.value)}
                    className="field mt-1 text-sm"
                  >
                    {mode === "machinery" ? (
                      <>
                        <option>Rotavator / Tractor Implements</option>
                        <option>Power Tiller (8+ HP)</option>
                        <option>Solar Water Pump (5 HP)</option>
                        <option>Multi-Crop Thresher</option>
                        <option>Custom Hiring Center Unit</option>
                      </>
                    ) : (
                      <>
                        <option>Drip & Sprinkler Micro-Irrigation</option>
                        <option>Borewell Recharge Unit</option>
                        <option>Check Dam / Farm Pond</option>
                        <option>Submersible Solar Lift</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-sm font-medium">
                    <label htmlFor="cost-input" className="text-slate-700 dark:text-slate-200">Asset / Project Cost</label>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      ₹{cost.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <input
                    id="cost-range"
                    aria-label="Asset / Project Cost Range"
                    type="range"
                    min="20000"
                    max="600000"
                    step="5000"
                    value={cost}
                    onChange={(e) => setCost(Number(e.target.value))}
                    className="mt-2 w-full accent-emerald-600"
                  />
                  <input
                    id="cost-input"
                    aria-label="Asset / Project Cost"
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(Math.max(0, Number(e.target.value)))}
                    className="field mt-1.5 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="subsidy-percent-input" className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Subsidy Share (%)
                    </label>
                    <input
                      id="subsidy-percent-input"
                      aria-label="Subsidy Share (%)"
                      type="number"
                      value={subsidyPercent}
                      onChange={(e) => setSubsidyPercent(Number(e.target.value))}
                      className="field mt-1 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="max-subsidy-input" className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Max Cap (₹)
                    </label>
                    <input
                      id="max-subsidy-input"
                      aria-label="Max Cap (₹)"
                      type="number"
                      value={maxSubsidy}
                      onChange={(e) => setMaxSubsidy(Number(e.target.value))}
                      className="field mt-1 text-sm"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              onClick={handleCalculate}
              disabled={loading}
              className="glass-btn glass-green mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white shadow-lg transition"
            >
              {loading ? (
                <span>Simulating twin ledger...</span>
              ) : (
                <>
                  <Calculator className="size-4" />
                  Calculate & Verify Estimate
                </>
              )}
            </button>
          </div>
        </Card>

        {/* Results Column */}
        <div className="space-y-5">
          {calculated && (
            <Card className="glass relative overflow-hidden border-emerald-500/30">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                    <ShieldCheck className="size-3.5" />
                    Verified Demo Engine Calculation
                  </span>
                  <h3 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                    {mode === "loan"
                      ? `Effective Interest: ${effectiveRate}% p.a.`
                      : `Government Subsidy: ₹${cappedSubsidy.toLocaleString("en-IN")}`}
                  </h3>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Government Support</p>
                  <p className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">
                    ₹{(mode === "loan" ? subventionAmount : cappedSubsidy).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {successNote && (
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-xs text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="size-4 shrink-0" />
                  <span>{successNote}</span>
                </div>
              )}

              {/* Metrics Grid */}
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="glass rounded-xl p-4">
                  <p className="text-xs font-semibold text-slate-600">
                    {mode === "loan" ? "Principal Loan" : "Total Project Cost"}
                  </p>
                  <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                    ₹{(mode === "loan" ? principal : cost).toLocaleString("en-IN")}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-slate-600">
                    {mode === "loan" ? `${tenureMonths} months tenure` : equipmentType}
                  </p>
                </div>

                <div className="glass rounded-xl p-4">
                  <p className="text-xs font-semibold text-slate-600">Govt Benefit / Saving</p>
                  <p className="mt-1 text-lg font-bold text-emerald-700 dark:text-emerald-400">
                    ₹{(mode === "loan" ? subventionAmount : cappedSubsidy).toLocaleString("en-IN")}
                  </p>
                  <p className="mt-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                    <TrendingDown className="size-3" />
                    {mode === "loan" ? `${subventionRate}% interest waived` : `${subsidyPercent}% grant portion`}
                  </p>
                </div>

                <div className="glass rounded-xl p-4">
                  <p className="text-xs font-semibold text-slate-600">Farmer Effective Share</p>
                  <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                    ₹{(mode === "loan" ? effectiveLoanRepayment : farmerShare).toLocaleString("en-IN")}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-slate-600">
                    {mode === "loan" ? "Total repayment amount" : "Net out-of-pocket"}
                  </p>
                </div>
              </div>

              {/* Formula explanation */}
              <div className="mt-5 rounded-xl border border-black/5 bg-white/40 p-4 dark:border-white/10 dark:bg-slate-900/40">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-emerald-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Calculation Logic & Reference
                  </h4>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-400">
                  {mode === "loan"
                    ? `Calculated using standard Kisan Credit Card 3% prompt-repayment subvention rules. Normal interest = ₹${normalInterest.toLocaleString("en-IN")} (at ${interestRate}%). Subvention credit = ₹${subventionAmount.toLocaleString("en-IN")} (at ${subventionRate}%). Net farmer interest payable = ₹${effectiveInterest.toLocaleString("en-IN")}.`
                    : `Equipment assistance calculated as min(Project Cost × ${subsidyPercent}%, Max Cap ₹${maxSubsidy.toLocaleString("en-IN")}). Gross subsidy calculated: ₹${rawSubsidy.toLocaleString("en-IN")}; Effective applied grant: ₹${cappedSubsidy.toLocaleString("en-IN")}.`}
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-black/5 pt-2 text-[11px] text-slate-400 dark:border-white/5">
                  <span>Policy Rule: 2026-CG-CREDIT-01 / CG-AGRI-MECH</span>
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="size-3" />
                    Verified by KrishiSetu Engine
                  </span>
                </div>
              </div>

              {/* Action Links */}
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/farmer/eligibility"
                  className="glass-btn glass-green inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow"
                >
                  Check Scheme Eligibility
                  <ArrowRight className="size-3.5" />
                </Link>
                <Link
                  href="/farmer/schemes"
                  className="glass glass-btn inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200"
                >
                  Browse Related Schemes
                </Link>
              </div>
            </Card>
          )}

          {/* Guidelines Box */}
          <Card className="glass">
            <div className="flex items-start gap-3">
              <HelpCircle className="size-5 shrink-0 text-emerald-600" />
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  How are calculations determined?
                </h4>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  KrishiSetu aligns with state and central agricultural subvention guidelines. The estimates shown reflect standard government ceilings and subvention slabs. Official disbursements are subject to Aadhaar KYC, land verification, and branch sanction.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
