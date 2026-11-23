"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, FileCheck, CheckCircle2, Clock, AlertCircle, ShieldCheck } from "lucide-react";
import { Card, PageHeading, StatusBadge } from "@/components/ui-kit";

interface ApplicationDetailData {
  id: string;
  schemeName: string;
  referenceNumber: string;
  category: string;
  submittedAt: string;
  status: string;
  timeline: Array<{ stage: string; date: string; completed: boolean }>;
  requiredDocumentName: string;
}

const APPS_DETAIL_MAP: Record<string, ApplicationDetailData> = {
  "app-101": {
    id: "app-101",
    schemeName: "PM-KISAN Samman Nidhi",
    referenceNumber: "KS-2026-10482",
    category: "Direct Income Support",
    submittedAt: "12 Nov 2026",
    status: "Approved",
    requiredDocumentName: "Khasra Land Title Copy",
    timeline: [
      { stage: "Application submitted", date: "12 Nov 2026", completed: true },
      { stage: "Aadhaar e-KYC linked", date: "13 Nov 2026", completed: true },
      { stage: "Revenue Inspector (Patwari) verification", date: "16 Nov 2026", completed: true },
      { stage: "District Agriculture Office Approval", date: "20 Nov 2026", completed: true },
      { stage: "R-FTO Generated for DBT", date: "22 Nov 2026", completed: true },
    ],
  },
  "app-102": {
    id: "app-102",
    schemeName: "PM Fasal Bima Yojana",
    referenceNumber: "CG-PMFBY-8821",
    category: "Crop Insurance",
    submittedAt: "08 Nov 2026",
    status: "Under review",
    requiredDocumentName: "Crop Sowing Certificate",
    timeline: [
      { stage: "Claim application registered", date: "08 Nov 2026", completed: true },
      { stage: "Insurance surveyor assigned", date: "11 Nov 2026", completed: true },
      { stage: "Satellite yield loss index processing", date: "In progress", completed: false },
      { stage: "Sanction order approval", date: "Pending", completed: false },
    ],
  },
  "app-103": {
    id: "app-103",
    schemeName: "Kisan Credit Card Crop Loan",
    referenceNumber: "KCC-77421",
    category: "Agricultural Credit",
    submittedAt: "29 Oct 2026",
    status: "Documents required",
    requiredDocumentName: "Cultivation Evidence & Cropping Declaration",
    timeline: [
      { stage: "Credit application filed", date: "29 Oct 2026", completed: true },
      { stage: "Bank preliminary KYC review", date: "30 Oct 2026", completed: true },
      { stage: "Additional cultivation evidence requested", date: "16 Nov 2026", completed: true },
      { stage: "Credit limit approval & card dispatch", date: "Awaiting documents", completed: false },
    ],
  },
};

export default function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ applicationId: string }>;
}) {
  const { applicationId } = use(params);
  const [uploaded, setUploaded] = useState(false);
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);

  const app = APPS_DETAIL_MAP[applicationId] || {
    id: applicationId,
    schemeName: "Agricultural Scheme Application",
    referenceNumber: applicationId.toUpperCase(),
    category: "Government Support",
    submittedAt: "November 2026",
    status: "Under review",
    requiredDocumentName: "Supporting Evidence Document",
    timeline: [
      { stage: "Application registered", date: "Recently", completed: true },
      { stage: "Administrative scrutiny", date: "In progress", completed: false },
      { stage: "Sanction order", date: "Pending", completed: false },
    ],
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      const name = e.target.files[0].name;
      setTimeout(() => {
        setFileName(name);
        setUploaded(true);
        setUploading(false);
      }, 500);
    }
  };

  return (
    <div className="space-y-6">
      <Link
        href="/farmer/applications"
        className="glass glass-btn inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200"
      >
        <ArrowLeft className="size-3.5" />
        Back to Applications
      </Link>

      <PageHeading
        title={app.schemeName}
        description={`Reference ID: ${app.referenceNumber} · ${app.category}`}
        action={<StatusBadge status={uploaded ? "Under review" : app.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Left Column: Timeline & Record Details */}
        <div className="space-y-6">
          <Card className="glass">
            <h3 className="font-bold text-slate-900 dark:text-white">
              Application Lifecycle Milestones
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Audit trail recorded via KrishiSetu operational engine
            </p>

            <div className="mt-5 space-y-4">
              {app.timeline.map((item) => (
                <div key={item.stage} className="flex items-start gap-3">
                  <div className="mt-0.5 grid size-6 place-items-center rounded-full text-xs font-bold shrink-0">
                    {item.completed ? (
                      <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Clock className="size-5 text-amber-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${item.completed ? "text-slate-900 dark:text-white" : "text-amber-700 dark:text-amber-400"}`}>
                      {item.stage}
                    </p>
                    <p className="text-xs text-slate-400">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Pending Action Card */}
        <div className="space-y-5">
          <Card className="glass">
            <div className="flex items-center gap-2">
              <Upload className="size-4 text-emerald-600" />
              <h3 className="font-bold text-slate-900 dark:text-white">
                Supporting Documents
              </h3>
            </div>

            <p className="mt-2 text-xs text-slate-500">
              Required: <strong className="text-slate-700 dark:text-slate-200">{app.requiredDocumentName}</strong>
            </p>

            {uploaded ? (
              <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="size-5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold">Document Uploaded Successfully</p>
                    <p className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400">{fileName}</p>
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400">
                  Forwarded to scrutiny officer. Status updated to Under review.
                </p>
              </div>
            ) : (
              <div className="mt-4">
                <label
                  htmlFor="file-upload"
                  className="glass-btn glass-green flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold text-white shadow transition"
                >
                  <Upload className="size-4" />
                  <span>{uploading ? "Uploading..." : "Choose & Upload Document"}</span>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <p className="mt-2 text-center text-[11px] text-slate-400">
                  Accepted: PDF, JPG, PNG (Max 5MB)
                </p>
              </div>
            )}
          </Card>

          <Card className="glass space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Application Metadata
            </h4>
            <dl className="space-y-2 text-xs">
              <div className="flex justify-between">
                <dt className="text-slate-400">Submission Date</dt>
                <dd className="font-semibold text-slate-700 dark:text-slate-200">{app.submittedAt}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Verified System</dt>
                <dd className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="size-3.5" /> KrishiSetu Engine
                </dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}
