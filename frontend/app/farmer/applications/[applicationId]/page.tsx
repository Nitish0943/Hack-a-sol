"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, AlertTriangle, FileText, Building2, Calendar, ShieldCheck, ChevronRight, MessageSquareWarning } from "lucide-react";
import { Card, PageHeading, StatusBadge, VoiceAssistButton } from "@/components/ui-kit";
import { getApplication } from "@/lib/api";
import { useTranslation } from "@/lib/i18n/context";

export default function ApplicationDetailPage({ params }: { params: Promise<{ applicationId: string }> }) {
  const resolvedParams = use(params);
  const { t, language } = useTranslation();
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getApplication(resolvedParams.applicationId);
      setApp(data);
      setLoading(false);
    }
    load();
  }, [resolvedParams.applicationId]);

  if (loading || !app) {
    return (
      <div className="py-12 text-center">
        <div className="inline-block size-8 animate-spin rounded-full border-4 border-[#166534] border-t-transparent" />
        <p className="mt-3 text-sm text-slate-500">{language === "hi" ? "आवेदन लोड हो रहा है..." : "Loading dossier..."}</p>
      </div>
    );
  }

  let timeline: any[] = [];
  try {
    timeline = typeof app.timeline_json === "string" ? JSON.parse(app.timeline_json) : (app.timeline_json || []);
  } catch (e) {
    timeline = [];
  }

  const voiceText = `${app.scheme_name}. ${language === "hi" ? "संदर्भ संख्या" : "Reference"}: ${app.reference_number}. ${language === "hi" ? "वर्तमान स्थिति" : "Current status"}: ${app.status}. ${app.pending_action ? (language === "hi" ? "लंबित कार्रवाई: " : "Pending action: ") + app.pending_action : ""}`;

  return (
    <div className="space-y-6">
      <Link
        href="/farmer/applications"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="size-4" />
        {language === "hi" ? "सभी आवेदनों पर वापस जाएं" : "Back to applications"}
      </Link>

      <PageHeading
        title={app.scheme_name}
        description={`${language === "hi" ? "संदर्भ सं." : "Reference No."}: ${app.reference_number} · ${language === "hi" ? "दर्ज तिथि" : "Registered on"}: ${app.submission_date}`}
        action={
          <div className="flex items-center gap-3">
            <VoiceAssistButton text={voiceText} label={language === "hi" ? "स्थिति सुनें" : "Listen status"} />
            <Link
              href={`/farmer/grievances/new?scheme=${encodeURIComponent(app.scheme_id)}&ref=${encodeURIComponent(app.reference_number)}`}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
            >
              <MessageSquareWarning className="size-4" />
              {language === "hi" ? "शिकायत दर्ज करें" : "Report Issue"}
            </Link>
          </div>
        }
      />

      {/* Main Status Banner */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Key Details Card */}
          <Card className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-medium text-slate-400">{language === "hi" ? "स्वीकृति स्थिति" : "Current Status"}</span>
                <div className="mt-1">
                  <StatusBadge status={app.status} />
                </div>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-400">{language === "hi" ? "प्रस्तुत माध्यम" : "Submission Channel"}</span>
                <p className="mt-1 text-sm font-semibold text-slate-800">{app.channel}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-400">{language === "hi" ? "अंतिम अद्यतन" : "Last Verification"}</span>
                <p className="mt-1 text-sm font-semibold text-slate-800">{app.submission_date}</p>
              </div>
            </div>

            {app.pending_action && (
              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50/80 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="size-5 shrink-0 text-amber-600" />
                  <div>
                    <h4 className="text-sm font-bold text-amber-900">
                      {language === "hi" ? "कार्रवाई आवश्यक (अवरोधक)" : "Pending Action Required"}
                    </h4>
                    <p className="mt-1 text-xs text-amber-800 leading-relaxed">{app.pending_action}</p>
                  </div>
                </div>
              </div>
            )}

            {app.remarks && (
              <div className="mt-4 rounded-xl bg-slate-50 p-4 text-xs text-slate-700">
                <span className="font-semibold text-slate-900">{language === "hi" ? "टिप्पणी / विवरण:" : "Remarks / Notes:"}</span>{" "}
                {app.remarks}
              </div>
            )}
          </Card>

          {/* Verification Timeline */}
          <Card className="p-6">
            <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Clock className="size-5 text-[#166534]" />
              {language === "hi" ? "सत्यापन एवं स्वीकृति समयरेखा" : "Verification & Sanction Timeline"}
            </h3>

            <div className="space-y-6 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {timeline.length > 0 ? (
                timeline.map((step: any, idx: number) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-6 top-1 size-4 rounded-full border-2 border-white bg-[#166534] shadow" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{step.title}</span>
                        <span className="text-[10px] rounded bg-slate-100 px-1.5 py-0.5 text-slate-500">{step.date}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600 leading-relaxed">{step.detail}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="relative">
                  <div className="absolute -left-6 top-1 size-4 rounded-full border-2 border-white bg-[#166534] shadow" />
                  <div>
                    <span className="text-xs font-bold text-slate-900">Application Submitted</span>
                    <p className="mt-1 text-xs text-slate-600">{app.submission_date}: Dossier queued for administrative verification.</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Sidebar - Supporting Evidence & Checklist */}
        <div className="space-y-6">
          <Card className="p-5">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="size-4 text-[#166534]" />
              {language === "hi" ? "संलग्न सत्यापन दस्तावेज़" : "Attached Verification Documents"}
            </h4>
            <div className="mt-4 space-y-3">
              {[
                { name: "Aadhaar Card (e-KYC verified)", status: "Verified", date: "10 Oct 2026" },
                { name: "Bhuiyan Land Record (Khasra 142/2)", status: "Verified", date: "12 Nov 2026" },
                { name: "Bank Passbook (NPCI Seeded)", status: "Active", date: "12 Nov 2026" },
                { name: "Panchayat Cultivator Declaration", status: "Under Review", date: "15 Nov 2026" },
              ].map((doc, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs">
                  <div>
                    <p className="font-semibold text-slate-800">{doc.name}</p>
                    <p className="text-[10px] text-slate-400">{doc.date}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      doc.status === "Verified"
                        ? "bg-emerald-100 text-emerald-800"
                        : doc.status === "Active"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 border-l-4 border-l-[#166534] bg-emerald-50/30">
            <h4 className="text-sm font-bold text-emerald-950">
              {language === "hi" ? "मदद चाहिए या देरी हो रही है?" : "Need Assistance with Delay?"}
            </h4>
            <p className="mt-1 text-xs text-emerald-800 leading-relaxed">
              {language === "hi"
                ? "यदि आपकी पावती संख्या 30 दिनों से अधिक समय से लंबित है, तो आप सीधे हमारे ग्रीवांस पोर्टल या टोल-फ्री 1800-890-SETU पर संपर्क कर सकते हैं।"
                : "If this application is pending past statutory citizen charter SLA (30 days), file an escalated grievance or dial toll-free 1800-890-SETU."}
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <Link
                href="/farmer/ivr"
                className="rounded-xl border border-emerald-300 bg-white p-2 text-center text-xs font-semibold text-emerald-800 shadow-sm hover:bg-emerald-50"
              >
                {language === "hi" ? "आईवीआर फोन पर जांचें" : "Call Phone Hotline"}
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
