"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageSquareWarning, ShieldAlert, CheckCircle2, UploadCloud, AlertCircle } from "lucide-react";
import { Card, PageHeading, VoiceAssistButton } from "@/components/ui-kit";
import { createGrievance, getSchemes } from "@/lib/api";
import { useTranslation } from "@/lib/i18n/context";

function NewGrievanceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, language } = useTranslation();

  const preScheme = searchParams.get("scheme") || "pmfby";
  const preRef = searchParams.get("ref") || "";

  const [schemes, setSchemes] = useState<any[]>([]);
  const [selectedScheme, setSelectedScheme] = useState(preScheme);
  const [category, setCategory] = useState("Sanction amount mismatch");
  const [referenceNumber, setReferenceNumber] = useState(preRef);
  const [description, setDescription] = useState("");
  const [fileName, setFileName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ticketCreated, setTicketCreated] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const data = await getSchemes();
      setSchemes(data);
    }
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    setSubmitting(true);
    const res = await createGrievance({
      scheme_id: selectedScheme,
      category,
      reference_number: referenceNumber || undefined,
      description: `${referenceNumber ? `[Ref: ${referenceNumber}] ` : ""}${description}`,
    });
    setTicketCreated(res);
    setSubmitting(false);
  };

  if (ticketCreated) {
    return (
      <div className="mx-auto max-w-xl py-12">
        <Card className="p-8 text-center space-y-4 border-2 border-emerald-500/20 bg-emerald-50/20">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="size-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {language === "hi" ? "शिकायत सफलतापूर्वक दर्ज की गई!" : "Grievance Ticket Successfully Registered!"}
          </h2>
          <div className="inline-block rounded-xl border border-emerald-200 bg-white px-4 py-2 font-mono text-sm font-bold text-emerald-800 shadow-sm">
            {ticketCreated.reference_number}
          </div>
          <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
            {language === "hi"
              ? "आपकी शिकायत संबंधित जिला कृषि अधिकारी (RAEO) को अग्रेषित कर दी गई है। सरकारी नागरिक अधिकार पत्र के अनुसार 15 दिनों के भीतर समाधान अनिवार्य है।"
              : "Your complaint has been submitted to the District Agriculture Review Officer. Resolution is SLA-monitored under the Citizen Charter."}
          </p>

          <div className="pt-4 flex justify-center gap-3">
            <Link
              href="/farmer/grievances"
              className="rounded-xl bg-[#166534] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#14532d]"
            >
              {language === "hi" ? "मेरी शिकायतें देखें" : "View Grievance Ledger"}
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const voicePrompt = language === "hi"
    ? "नई शिकायत दर्ज करने के लिए योजना और समस्या का प्रकार चुनें। यदि स्वीकृति में अंतर है तो स्वीकृत और देय राशि लिखें।"
    : "To file a grievance, select your scheme and category. Detail any sanction mismatch or disbursement delay clearly.";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/farmer/grievances"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="size-4" />
        {language === "hi" ? "शिकायत सूची पर वापस जाएं" : "Back to grievances"}
      </Link>

      <PageHeading
        title={language === "hi" ? "नई आधिकारिक शिकायत दर्ज करें" : "File Official Grievance"}
        description={
          language === "hi"
            ? "स्वीकृति विसंगति, भुगतान में देरी या अपात्रता आपत्ति की निष्पक्ष जांच हेतु शिकायत दर्ज करें।"
            : "Direct escalation to Agricultural Extension Officers for sanction mismatches, delayed DBT, or document disputes."
        }
        action={<VoiceAssistButton text={voicePrompt} label={language === "hi" ? "सहायता सुनें" : "Voice guide"} />}
      />

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-slate-700">
                {language === "hi" ? "संबंधित योजना" : "Concerned Agricultural Scheme"}
              </label>
              <select
                value={selectedScheme}
                onChange={(e) => setSelectedScheme(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-medium outline-none focus:border-[#166534]"
              >
                {schemes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">
                {language === "hi" ? "समस्या की श्रेणी" : "Grievance Category"}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-medium outline-none focus:border-[#166534]"
              >
                <option value="Sanction amount mismatch">Sanction amount mismatch (स्वीकृति राशि में अंतर)</option>
                <option value="Approved but uncredited DBT">Approved but uncredited DBT (स्वीकृत पर खाते में अप्राप्त)</option>
                <option value="Disbursement delayed past statutory SLA">Disbursement delayed past statutory SLA (भुगतान में अत्यधिक देरी)</option>
                <option value="Aadhaar-NPCI mapper rejection">Aadhaar-NPCI mapper rejection (आधार डीबीटी अस्वीकृत)</option>
                <option value="Tenant cultivator verification delayed">Tenant cultivator verification delayed (काश्तकार सत्यापन लंबित)</option>
                <option value="Wrong rejection by revenue authority">Wrong rejection by revenue authority (गलत अपात्रता निरस्तीकरण)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">
              {language === "hi" ? "आवेदन या पावती संदर्भ सं. (वैकल्पिक)" : "Official Application / Reference No. (Optional)"}
            </label>
            <input
              type="text"
              placeholder="e.g. KS-2026-10482 or CG-PMFBY-8821"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs outline-none focus:border-[#166534]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">
              {language === "hi" ? "समस्या का विस्तृत विवरण" : "Detailed Grievance Description"}
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                language === "hi"
                  ? "कृपया समस्या का विवरण दें, जैसे: नीति अनुसार ₹12,000 मिलना था परंतु आदेश में केवल ₹8,000 स्वीकृत हुआ..."
                  : "Detail the exact issue: e.g., Entitled to ₹12,000 under 60% crop yield loss guideline, but received sanction order of only ₹8,000..."
              }
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-xs outline-none focus:border-[#166534] leading-relaxed"
            />
          </div>

          {/* Evidence Upload */}
          <div>
            <label className="text-xs font-semibold text-slate-700">
              {language === "hi" ? "साक्ष्य दस्तावेज़ संलग्न करें (वैकल्पिक)" : "Attach Evidence / Sanction Copy (Optional)"}
            </label>
            <div className="mt-1 flex items-center justify-center rounded-xl border-2 border-dashed border-slate-200 p-4 text-center hover:bg-slate-50 transition cursor-pointer">
              <div className="space-y-1">
                <UploadCloud className="mx-auto size-6 text-slate-400" />
                <p className="text-xs text-slate-600">
                  {fileName ? (
                    <span className="font-semibold text-[#166534]">{fileName}</span>
                  ) : (
                    <>
                      <span className="font-semibold text-[#166534]">Click to upload</span> PDF, JPG (Sanction letter, passbook, or survey copy)
                    </>
                  )}
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) setFileName(e.target.files[0].name);
                }}
              />
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertCircle className="size-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <span className="font-bold">{language === "hi" ? "नागरिक अधिकार पत्र गारंटी:" : "Citizen Charter SLA Guarantee:"}</span>{" "}
              {language === "hi"
                ? "सभी पंजीकृत शिकायतों को अनुविभागीय कृषि अधिकारी एवं अग्रणी जिला बैंक प्रबंधक के समक्ष प्रस्तुत किया जाता है।"
                : "All grievance tickets generate an immutable audit record and are assigned to the Sub-Divisional Agriculture Extension Officer."}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Link
              href="/farmer/grievances"
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              {language === "hi" ? "रद्द करें" : "Cancel"}
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
            >
              {submitting
                ? language === "hi"
                  ? "दर्ज कर रहे हैं..."
                  : "Registering Ticket..."
                : language === "hi"
                ? "शिकायत दर्ज करें"
                : "Submit Grievance Ticket"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default function NewGrievancePage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-sm text-slate-500">Loading form...</div>}>
      <NewGrievanceForm />
    </Suspense>
  );
}
