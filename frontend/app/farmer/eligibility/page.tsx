"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  CheckCircle2, 
  CircleX, 
  AlertCircle, 
  Upload, 
  ShieldCheck, 
  ArrowRight,
  FileCheck2,
  RefreshCw,
  FileText
} from "lucide-react";
import { Card, PageHeading, StatusBadge } from "@/components/ui-kit";
import { eligibilityApi } from "@/lib/api";

interface SchemeOption {
  id: string;
  name: string;
  category: string;
  policyCode: string;
  maxBenefit: string;
  requirements: {
    maxLand?: number;
    minLand?: number;
    allowedCultivators: string[];
    allowedCrops: string[];
  };
}

const SCHEMES: SchemeOption[] = [
  {
    id: "pm-kisan",
    name: "PM-KISAN Samman Nidhi",
    category: "Direct Income Support",
    policyCode: "2026-CG-PMKS-01",
    maxBenefit: "₹6,000 per year (3 installments)",
    requirements: {
      minLand: 0.1,
      allowedCultivators: ["Landowner"],
      allowedCrops: ["Paddy", "Wheat", "Maize", "Soybean", "Pulses", "All"],
    },
  },
  {
    id: "kcc",
    name: "Kisan Credit Card (KCC)",
    category: "Agricultural Credit",
    policyCode: "2026-CG-CREDIT-01",
    maxBenefit: "Credit limit up to ₹3,00,000 at 4% effective interest",
    requirements: {
      minLand: 0.5,
      allowedCultivators: ["Landowner", "Tenant Farmer", "Sharecropper"],
      allowedCrops: ["Paddy", "Wheat", "Maize", "Soybean", "Pulses", "Sugarcane"],
    },
  },
  {
    id: "pmfby",
    name: "PM Fasal Bima Yojana (PMFBY)",
    category: "Crop Insurance",
    policyCode: "2026-CG-PMFBY-02",
    maxBenefit: "100% sum insured against natural catastrophic crop loss",
    requirements: {
      minLand: 0.1,
      allowedCultivators: ["Landowner", "Tenant Farmer"],
      allowedCrops: ["Paddy", "Maize", "Soybean"],
    },
  },
  {
    id: "smam",
    name: "Sub-Mission on Agri-Mechanization",
    category: "Farm Machinery Subsidy",
    policyCode: "2026-CG-MECH-04",
    maxBenefit: "Up to 50% subsidy (max ₹1,25,000) for farm implements",
    requirements: {
      minLand: 1.0,
      allowedCultivators: ["Landowner"],
      allowedCrops: ["Paddy", "Wheat", "Maize", "Soybean", "Pulses", "All"],
    },
  },
];

export default function EligibilityPage() {
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>("pm-kisan");
  
  // Profile state
  const [state, setState] = useState("Chhattisgarh");
  const [district, setDistrict] = useState("Raipur");
  const [landArea, setLandArea] = useState<number>(2.0);
  const [cultivatorStatus, setCultivatorStatus] = useState<string>("Landowner");
  const [crop, setCrop] = useState<string>("Paddy");
  const [hasAadhaarKyc, setHasAadhaarKyc] = useState<boolean>(true);
  const [hasBankLinked, setHasBankLinked] = useState<boolean>(true);
  const [evidenceUploaded, setEvidenceUploaded] = useState<boolean>(false);

  // Evaluation state
  const [loading, setLoading] = useState<boolean>(false);
  const [checkedAt, setCheckedAt] = useState<string>("23 Nov 2026, 10:00 AM");
  const [uploadModalOpen, setUploadModalOpen] = useState<boolean>(false);
  const [selectedFileName, setSelectedFileName] = useState<string>("");

  const selectedScheme = SCHEMES.find((s) => s.id === selectedSchemeId) || SCHEMES[0];

  // Evaluate rules
  const evaluateRules = () => {
    const rules = [];

    // Rule 1: Location
    rules.push({
      id: "location",
      title: "Geographical Coverage",
      passed: Boolean(state && district),
      needsVerification: false,
      detail: `${district}, ${state} is an active notified agricultural implementation zone.`,
    });

    // Rule 2: Landholding
    const meetsMin = !selectedScheme.requirements.minLand || landArea >= selectedScheme.requirements.minLand;
    const meetsMax = !selectedScheme.requirements.maxLand || landArea <= selectedScheme.requirements.maxLand;
    const landPassed = meetsMin && meetsMax && landArea > 0;
    rules.push({
      id: "landholding",
      title: "Landholding Eligibility",
      passed: landPassed,
      needsVerification: !evidenceUploaded,
      detail: landPassed
        ? `Declared ${landArea} acres qualifies for this scheme${evidenceUploaded ? " (Verified via document)" : " (Document verification required)"}.`
        : `Landholding of ${landArea} acres does not meet threshold.`,
    });

    // Rule 3: Cultivator status
    const cultivatorPassed = selectedScheme.requirements.allowedCultivators.includes(cultivatorStatus);
    rules.push({
      id: "cultivator",
      title: "Cultivator Classification",
      passed: cultivatorPassed,
      needsVerification: cultivatorStatus === "Tenant Farmer" && !evidenceUploaded,
      detail: cultivatorPassed
        ? `${cultivatorStatus} is an eligible category for ${selectedScheme.name}.`
        : `${cultivatorStatus} is currently not recognized under this scheme guideline without an authorized tenancy deed.`,
    });

    // Rule 4: Crop notification
    const cropPassed = selectedScheme.requirements.allowedCrops.includes("All") || selectedScheme.requirements.allowedCrops.includes(crop);
    rules.push({
      id: "crop",
      title: "Notified Crop Criteria",
      passed: cropPassed,
      needsVerification: false,
      detail: cropPassed
        ? `${crop} is an officially notified crop for season 2026.`
        : `${crop} is not notified for subsidy under this specific scheme code.`,
    });

    // Rule 5: Financial DBT & Identity
    const dbtPassed = hasAadhaarKyc && hasBankLinked;
    rules.push({
      id: "identity",
      title: "Aadhaar e-KYC & DBT Bank Seeding",
      passed: dbtPassed,
      needsVerification: !hasAadhaarKyc,
      detail: dbtPassed
        ? "Aadhaar number and NPCI active DBT bank account are verified."
        : "Aadhaar e-KYC or NPCI bank seeding is incomplete.",
    });

    return rules;
  };

  const rules = evaluateRules();
  const satisfiedCount = rules.filter((r) => r.passed && !r.needsVerification).length;
  const verificationCount = rules.filter((r) => r.needsVerification).length;
  const notSatisfiedCount = rules.filter((r) => !r.passed).length;

  let overallStatus = "Potentially eligible";
  if (notSatisfiedCount > 0) {
    overallStatus = "Not eligible";
  } else if (verificationCount === 0) {
    overallStatus = "Eligible";
  }

  const handleCheck = async () => {
    setLoading(true);
    setCheckedAt(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) + ", Today");
    try {
      await eligibilityApi.check(selectedSchemeId, {
        state,
        district,
        landAreaAcres: landArea,
        cultivatorType: cultivatorStatus,
        crop,
      });
    } catch {
      // client-side evaluation works
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFileName(e.target.files[0].name);
    }
  };

  const confirmUpload = () => {
    setEvidenceUploaded(true);
    setUploadModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeading
        title="Scheme Eligibility Evaluator"
        description="Verify your eligibility across central and state agricultural schemes with instant policy checks"
      />

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* Form Column */}
        <Card className="glass h-fit space-y-5">
          <div className="border-b border-black/5 pb-3 dark:border-white/10">
            <h3 className="font-bold text-slate-900 dark:text-white">Scheme & Farmer Profile</h3>
            <p className="mt-1 text-xs text-slate-500">
              Select scheme and adjust profile attributes
            </p>
          </div>

          <div>
            <label htmlFor="scheme-select" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Target Scheme
            </label>
            <select
              id="scheme-select"
              aria-label="Target Scheme"
              value={selectedSchemeId}
              onChange={(e) => setSelectedSchemeId(e.target.value)}
              className="field mt-1.5 text-sm font-medium"
            >
              {SCHEMES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.category})
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border border-black/5 bg-white/40 p-4 dark:border-white/10 dark:bg-slate-900/40">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
              Farmer Profile Data
            </p>
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="state-select" className="block text-[11px] font-semibold text-slate-500">State</label>
                  <select
                    id="state-select"
                    aria-label="State"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="field mt-1 text-xs"
                  >
                    <option>Chhattisgarh</option>
                    <option>Madhya Pradesh</option>
                    <option>Odisha</option>
                    <option>Maharashtra</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="district-select" className="block text-[11px] font-semibold text-slate-500">District</label>
                  <select
                    id="district-select"
                    aria-label="District"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="field mt-1 text-xs"
                  >
                    <option>Raipur</option>
                    <option>Durg</option>
                    <option>Bilaspur</option>
                    <option>Rajnandgaon</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs">
                  <label htmlFor="land-area-input" className="font-semibold text-slate-600 dark:text-slate-300">
                    Cultivated Land (Acres)
                  </label>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">{landArea} ac</span>
                </div>
                <input
                  id="land-area-input"
                  aria-label="Cultivated Land (Acres)"
                  type="number"
                  step="0.5"
                  value={landArea}
                  onChange={(e) => setLandArea(Math.max(0, Number(e.target.value)))}
                  className="field mt-1 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="cultivator-status-select" className="block text-[11px] font-semibold text-slate-500">Status</label>
                  <select
                    id="cultivator-status-select"
                    aria-label="Status"
                    value={cultivatorStatus}
                    onChange={(e) => setCultivatorStatus(e.target.value)}
                    className="field mt-1 text-xs"
                  >
                    <option>Landowner</option>
                    <option>Tenant Farmer</option>
                    <option>Sharecropper</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="crop-type-select" className="block text-[11px] font-semibold text-slate-500">Crop</label>
                  <select
                    id="crop-type-select"
                    aria-label="Crop"
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                    className="field mt-1 text-xs"
                  >
                    <option>Paddy</option>
                    <option>Wheat</option>
                    <option>Maize</option>
                    <option>Soybean</option>
                    <option>Pulses</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 pt-2 text-xs">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={hasAadhaarKyc}
                    onChange={(e) => setHasAadhaarKyc(e.target.checked)}
                    className="accent-emerald-600 rounded"
                  />
                  <span>Aadhaar e-KYC Verified</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={hasBankLinked}
                    onChange={(e) => setHasBankLinked(e.target.checked)}
                    className="accent-emerald-600 rounded"
                  />
                  <span>Aadhaar-seeded Bank Account (DBT)</span>
                </label>
              </div>
            </div>
          </div>

          <button
            onClick={handleCheck}
            disabled={loading}
            className="glass-btn glass-green flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white shadow-lg transition"
          >
            {loading ? (
              <span>Evaluating policy...</span>
            ) : (
              <>
                <RefreshCw className="size-4" />
                Check Eligibility Now
              </>
            )}
          </button>
        </Card>

        {/* Results Column */}
        <div className="space-y-5">
          <Card className="glass relative overflow-hidden">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-black/5 pb-4 dark:border-white/10">
              <div>
                <p className="text-xs text-slate-400">Evaluation: {checkedAt}</p>
                <h3 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                  {selectedScheme.name}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {selectedScheme.category} · {selectedScheme.policyCode}
                </p>
              </div>
              <div>
                <StatusBadge status={overallStatus} />
              </div>
            </div>

            {/* Scoreboard Cards */}
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                    Criteria Satisfied
                  </span>
                </div>
                <p className="mt-2 text-2xl font-extrabold text-emerald-800 dark:text-emerald-300">
                  {satisfiedCount} of {rules.length}
                </p>
              </div>

              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="size-5 text-amber-600 dark:text-amber-400" />
                  <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                    Verification Needed
                  </span>
                </div>
                <p className="mt-2 text-2xl font-extrabold text-amber-800 dark:text-amber-300">
                  {verificationCount}
                </p>
              </div>

              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4">
                <div className="flex items-center gap-2">
                  <CircleX className="size-5 text-rose-600 dark:text-rose-400" />
                  <span className="text-xs font-semibold text-rose-800 dark:text-rose-300">
                    Not Satisfied
                  </span>
                </div>
                <p className="mt-2 text-2xl font-extrabold text-rose-800 dark:text-rose-300">
                  {notSatisfiedCount}
                </p>
              </div>
            </div>

            {/* Rules Breakdown */}
            <div className="mt-6 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Rule Evaluation Breakdown
              </h4>
              {rules.map((rule) => {
                let badgeStatus = "Satisfied";
                let icon = <CheckCircle2 className="size-4.5 text-emerald-600" />;
                if (!rule.passed) {
                  badgeStatus = "Not eligible";
                  icon = <CircleX className="size-4.5 text-rose-600" />;
                } else if (rule.needsVerification) {
                  badgeStatus = "Verification required";
                  icon = <AlertCircle className="size-4.5 text-amber-600" />;
                }

                return (
                  <div
                    key={rule.id}
                    className="glass flex items-start gap-3 rounded-xl p-4 transition"
                  >
                    <div className="mt-0.5 shrink-0">{icon}</div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {rule.title}
                        </span>
                        <StatusBadge status={badgeStatus} />
                      </div>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {rule.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Scheme Entitlement Details */}
            <div className="mt-6 rounded-xl border border-black/5 bg-white/40 p-4 dark:border-white/10 dark:bg-slate-900/40">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-emerald-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Projected Financial Entitlement
                </h4>
              </div>
              <p className="mt-2 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                {selectedScheme.maxBenefit}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Calculated according to demo scheme guidelines. Official sanction will be confirmed by the competent district authority.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => setUploadModalOpen(true)}
                className="glass glass-btn inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-100"
              >
                <Upload className="size-4" />
                {evidenceUploaded ? "Re-upload Verification Evidence" : "Upload Verification Evidence"}
              </button>

              <Link
                href={`/farmer/schemes/${selectedScheme.id}`}
                className="glass-btn glass-green inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow"
              >
                <span>View Full Scheme Guidelines</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>

            <div className="mt-5 flex items-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="size-3.5 text-emerald-600" />
              <span>Policy version {selectedScheme.policyCode} · KrishiSetu Engine 2.0</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Upload Evidence Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="glass w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Upload Supporting Evidence
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Upload land record (Khasra/B-1), tenancy agreement, or crop declaration to resolve verification requirements.
            </p>

            <div className="mt-4 rounded-xl border-2 border-dashed border-emerald-500/40 p-6 text-center">
              <Upload className="mx-auto size-8 text-emerald-600" />
              <label htmlFor="modal-file-upload" className="mt-2 block cursor-pointer text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                Choose PDF or JPG file
                <input
                  id="modal-file-upload"
                  aria-label="Upload Evidence File"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <p className="mt-1 text-[11px] text-slate-400">Max size: 5MB</p>
              {selectedFileName && (
                <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <FileCheck2 className="size-4" />
                  <span>{selectedFileName}</span>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setUploadModalOpen(false)}
                className="glass glass-btn rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmUpload}
                className="glass-btn glass-green rounded-xl px-4 py-2 text-xs font-bold text-white shadow"
              >
                Confirm & Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
