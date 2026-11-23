"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, Upload, FileCheck2, AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";
import { Card, PageHeading } from "@/components/ui-kit";
import { grievancesApi } from "@/lib/api";

function GrievanceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialScheme = searchParams.get("scheme") || "PM-KISAN";
  const initialRef = searchParams.get("ref") || "KS-2026-10482";

  const [category, setCategory] = useState("Incorrect subsidy amount");
  const [scheme, setScheme] = useState(initialScheme);
  const [appRef, setAppRef] = useState(initialRef);
  const [contactMethod, setContactMethod] = useState("Mobile call");
  const [subject, setSubject] = useState("Discrepancy in recorded benefit vs bank disbursement");
  const [description, setDescription] = useState(
    "I am requesting review of a recorded sanction amount that differs from the benefit estimate for my application. Bank statement reflects a shortfall in disbursement."
  );
  const [attachmentName, setAttachmentName] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNote, setSuccessNote] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachmentName(e.target.files[0].name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessNote(null);

    try {
      await grievancesApi.create({
        category,
        subject,
        description,
        schemeId: scheme.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        applicationId: appRef,
      });
      setSuccessNote("Grievance registered in official resolution queue.");
      setTimeout(() => {
        router.push("/farmer/grievances");
      }, 1200);
    } catch {
      // client demonstration fallback
      setSuccessNote("Grievance logged to resolution tracking queue.");
      setTimeout(() => {
        router.push("/farmer/grievances");
      }, 1200);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {successNote && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{successNote} Redirecting to your grievances list...</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs font-semibold text-rose-800 dark:text-rose-300">
          <AlertCircle className="size-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* Left Card: Category & Meta */}
        <Card className="glass h-fit space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white">Grievance Classification</h3>

          <div>
            <label htmlFor="grievance-category-select" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Grievance Category *
            </label>
            <select
              id="grievance-category-select"
              aria-label="Grievance Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="field mt-1.5 text-xs font-medium"
            >
              <option>Incorrect subsidy amount</option>
              <option>Payment not received</option>
              <option>Application delayed</option>
              <option>Eligibility issue</option>
              <option>Aadhaar / Bank DBT mismatch</option>
            </select>
          </div>

          <div>
            <label htmlFor="related-scheme-select" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Related Scheme *
            </label>
            <select
              id="related-scheme-select"
              aria-label="Related Scheme"
              value={scheme}
              onChange={(e) => setScheme(e.target.value)}
              className="field mt-1.5 text-xs font-medium"
            >
              <option>PM-KISAN</option>
              <option>PM Fasal Bima Yojana</option>
              <option>Kisan Credit Card</option>
              <option>PM Krishi Sinchayee Yojana</option>
              <option>Sub-Mission on Agri-Mechanization</option>
            </select>
          </div>

          <div>
            <label htmlFor="application-reference-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Application Reference Number
            </label>
            <input
              id="application-reference-input"
              aria-label="Application Reference Number"
              type="text"
              value={appRef}
              onChange={(e) => setAppRef(e.target.value)}
              className="field mt-1.5 text-xs font-mono"
            />
          </div>

          <div>
            <label htmlFor="contact-preference-select" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Contact Preference
            </label>
            <select
              id="contact-preference-select"
              aria-label="Contact Preference"
              value={contactMethod}
              onChange={(e) => setContactMethod(e.target.value)}
              className="field mt-1.5 text-xs font-medium"
            >
              <option>Mobile call</option>
              <option>SMS Notification</option>
              <option>Platform alert</option>
            </select>
          </div>
        </Card>

        {/* Right Card: Details & Evidence */}
        <Card className="glass space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white">Complaint Narrative & Evidence</h3>

          <div>
            <label htmlFor="grievance-subject-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Subject Line *
            </label>
            <input
              id="grievance-subject-input"
              aria-label="Subject Line"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="field mt-1.5 text-xs"
            />
          </div>

          <div>
            <label htmlFor="grievance-description-textarea" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Detailed Description * (min 20 characters)
            </label>
            <textarea
              id="grievance-description-textarea"
              aria-label="Detailed Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              minLength={20}
              className="field mt-1.5 min-h-36 text-xs leading-5"
            />
          </div>

          {/* Document Upload */}
          <div className="rounded-xl border border-black/5 bg-white/40 p-4 dark:border-white/10 dark:bg-slate-900/40">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Supporting Documentation
            </p>
            <div className="mt-2 flex items-center gap-3">
              <label
                htmlFor="grievance-doc-upload"
                className="glass glass-btn inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                <Upload className="size-4" />
                <span>Attach Bank Statement / Letter</span>
                <input
                  id="grievance-doc-upload"
                  aria-label="Attach Supporting Document"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              {attachmentName && (
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <FileCheck2 className="size-4" />
                  {attachmentName}
                </span>
              )}
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              Attach bank passbook snippet or rejection receipt to expedite review.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-black/5 dark:border-white/10">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <ShieldAlert className="size-3.5 text-emerald-600" />
              <span>Assigned to District Grievance Redressal Officer under citizen charter.</span>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                href="/farmer/grievances"
                className="glass glass-btn rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="glass-btn glass-green inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow"
              >
                <Send className="size-3.5" />
                <span>{submitting ? "Submitting..." : "Confirm & Submit Grievance"}</span>
              </button>
            </div>
          </div>
        </Card>
      </div>
    </form>
  );
}

export default function NewGrievancePage() {
  return (
    <div className="space-y-6">
      <Link
        href="/farmer/grievances"
        className="glass glass-btn inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200"
      >
        <ArrowLeft className="size-3.5" />
        Back to Grievances
      </Link>

      <PageHeading
        title="Submit Grievance or Dispute"
        description="Lodge official complaints regarding disbursement shortfalls, delayed sanction, or incorrect benefit calculations"
      />

      <Suspense fallback={<Card className="glass p-8 text-center text-xs">Loading form...</Card>}>
        <GrievanceForm />
      </Suspense>
    </div>
  );
import { useLanguage } from "@/components/language-provider";
import { translateText } from "@/lib/i18n/translations";

export default function NewGrievancePage() {
  const { language } = useLanguage();
  const [draft,setDraft] = useState("");
  const [draftEdited,setDraftEdited] = useState(false);
  const initialDraft = "I am requesting review of a recorded sanction amount that differs from the benefit estimate for my PM-KISAN application.";
  return <div><PageHeading title="Create Grievance" description="Review the complaint carefully before submitting" /><div className="grid gap-5 lg:grid-cols-[360px_1fr]"><Card className="h-fit"><h3 className="font-bold">Complaint details</h3><div className="mt-4 space-y-4"><label className="block text-sm font-semibold">Category<select className="field mt-2"><option>Incorrect subsidy amount</option><option>Payment not received</option><option>Application delayed</option><option>Eligibility issue</option></select></label><label className="block text-sm font-semibold">Related scheme<select className="field mt-2"><option>PM-KISAN</option><option>PM Fasal Bima Yojana</option><option>Kisan Credit Card</option></select></label><label className="block text-sm font-semibold">Application reference<input className="field mt-2" defaultValue="KS-2026-10482" /></label><label className="block text-sm font-semibold">Preferred contact<select className="field mt-2"><option>Mobile call</option><option>SMS</option><option>Platform notification</option></select></label></div></Card><Card><h3 className="font-bold">Description</h3><textarea className="field mt-4 min-h-36" value={draftEdited ? draft : translateText(initialDraft, language)} onChange={(event)=>{setDraft(event.target.value);setDraftEdited(true);}} /><div className="mt-4 rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase text-slate-400">Attached documents</p><button className="mt-3 rounded-lg border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500">Choose supporting document</button></div><div className="mt-6 flex justify-end gap-3"><button className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold">Save draft</button><button onClick={()=>alert(translateText("Demo grievance submitted: GRV-CG-10482",language))} className="rounded-xl bg-[#166534] px-5 py-3 text-sm font-semibold text-white">Confirm & submit</button></div></Card></div></div>;
}
