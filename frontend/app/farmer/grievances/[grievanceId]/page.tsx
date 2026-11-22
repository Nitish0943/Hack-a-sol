"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquareWarning, CheckCircle2, Clock, ShieldCheck, UserCheck, AlertTriangle } from "lucide-react";
import { Card, PageHeading, StatusBadge, VoiceAssistButton } from "@/components/ui-kit";
import { getGrievance } from "@/lib/api";
import { useTranslation } from "@/lib/i18n/context";

export default function GrievanceDetailPage({ params }: { params: Promise<{ grievanceId: string }> }) {
  const resolvedParams = use(params);
  const { t, language } = useTranslation();
  const [grv, setGrv] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getGrievance(resolvedParams.grievanceId);
      setGrv(data);
      setLoading(false);
    }
    load();
  }, [resolvedParams.grievanceId]);

  if (loading || !grv) {
    return (
      <div className="py-12 text-center">
        <div className="inline-block size-8 animate-spin rounded-full border-4 border-[#166534] border-t-transparent" />
        <p className="mt-3 text-sm text-slate-500">{language === "hi" ? "शिकायत लोड हो रही है..." : "Loading grievance..."}</p>
      </div>
    );
  }

  const voiceText = `${language === "hi" ? "शिकायत विवरण" : "Grievance detail"}. ${language === "hi" ? "संदर्भ संख्या" : "Ticket"}: ${grv.reference_number}. ${language === "hi" ? "श्रेणी" : "Category"}: ${grv.category}. ${language === "hi" ? "स्थिति" : "Status"}: ${grv.status}. ${grv.officer_resolution ? (language === "hi" ? "अधिकारी समाधान: " : "Officer resolution: ") + grv.officer_resolution : ""}`;

  return (
    <div className="space-y-6">
      <Link
        href="/farmer/grievances"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="size-4" />
        {language === "hi" ? "सभी शिकायतों पर वापस जाएं" : "Back to grievances"}
      </Link>

      <PageHeading
        title={grv.category}
        description={`${language === "hi" ? "शिकायत टिकट सं." : "Ticket Reference"}: ${grv.reference_number} · ${language === "hi" ? "योजना" : "Scheme"}: ${grv.scheme_name}`}
        action={<VoiceAssistButton text={voiceText} label={language === "hi" ? "विवरण सुनें" : "Listen details"} />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Main Case Info */}
          <Card className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-medium text-slate-400">{language === "hi" ? "वर्तमान स्थिति" : "Case Status"}</span>
                <div className="mt-1">
                  <StatusBadge status={grv.status} />
                </div>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-400">{language === "hi" ? "दर्ज तिथि" : "Registered Date"}</span>
                <p className="mt-1 text-sm font-semibold text-slate-800">{grv.created_at}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-400">{language === "hi" ? "निस्तारण तिथि" : "Resolution Date"}</span>
                <p className="mt-1 text-sm font-semibold text-slate-800">{grv.resolution_date || "Under SLA"}</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {language === "hi" ? "शिकायतकर्ता का बयान" : "Farmer Statement & Dispute"}
              </h4>
              <p className="rounded-xl bg-slate-50 p-4 text-xs font-medium text-slate-800 leading-relaxed border border-slate-100">
                {grv.description}
              </p>
            </div>

            {/* Officer Resolution Box */}
            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/70 p-5 space-y-2">
              <div className="flex items-center gap-2">
                <UserCheck className="size-5 text-emerald-700" />
                <h4 className="text-sm font-bold text-emerald-950">
                  {language === "hi" ? "कृषि विस्तार अधिकारी जांच एवं समाधान" : "Agricultural Officer Inquiry & Action"}
                </h4>
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed">
                {grv.officer_resolution ||
                  (language === "hi"
                    ? "मामला वर्तमान में ग्रामीण कृषि विस्तार अधिकारी (RAEO) द्वारा जांचा जा रहा है। राजस्व तथा बैंक विवरणों की पुष्टि की जा रही है।"
                    : "Case dossier is currently undergoing field investigation by the Rural Agriculture Extension Officer. Bank and revenue records are being verified.")}
              </p>
            </div>
          </Card>

          {/* Audit trail */}
          <Card className="p-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <Clock className="size-4 text-[#166534]" />
              {language === "hi" ? "केस कार्यप्रणाली समयरेखा" : "Official Case Lifecycle"}
            </h4>

            <div className="space-y-4 pl-4 border-l-2 border-slate-200">
              <div className="relative">
                <div className="absolute -left-[21px] top-1 size-3 rounded-full bg-[#166534]" />
                <p className="text-xs font-bold text-slate-900">Grievance Registered</p>
                <p className="text-[11px] text-slate-500">{grv.created_at} — Ticket created and routed to district agricultural desk.</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[21px] top-1 size-3 rounded-full bg-amber-500" />
                <p className="text-xs font-bold text-slate-900">Document & Sanction Verification</p>
                <p className="text-[11px] text-slate-500">Cross-verified against Bhuiyan revenue database and PMFBY/KCC portal ledger.</p>
              </div>
              {grv.status === "Resolved" && (
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 size-3 rounded-full bg-emerald-500" />
                  <p className="text-xs font-bold text-emerald-900">Order Rectified / Grievance Resolved</p>
                  <p className="text-[11px] text-emerald-700">{grv.resolution_date} — Officer verified entitlement rectification completed.</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="p-5">
            <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <ShieldCheck className="size-4 text-[#166534]" />
              {language === "hi" ? "अधिकार संरक्षण" : "Protection & Rights"}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {language === "hi"
                ? "कृषि सेतु में दर्ज सभी शिकायतों का रिकॉर्ड सार्वजनिक जवाबदेही प्रणाली के तहत सुरक्षित रहता है। किसी भी असंतोष की स्थिति में अपील की जा सकती है।"
                : "All records are logged with immutable audit timestamps. If unresolved, cases are escalated to the District Collectorate Grievance Redressal Cell."}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
