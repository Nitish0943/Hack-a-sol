"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Filter, ClipboardCheck, ArrowRight, Clock, CheckCircle2, AlertCircle, FileText, X } from "lucide-react";
import { Card, PageHeading, StatusBadge, VoiceAssistButton } from "@/components/ui-kit";
import { getApplications, createApplication, getSchemes } from "@/lib/api";
import { useTranslation } from "@/lib/i18n/context";

export default function ApplicationsPage() {
  const { t, language } = useTranslation();
  const [applications, setApplications] = useState<any[]>([]);
  const [schemes, setSchemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  // New application form state
  const [selectedScheme, setSelectedScheme] = useState("pm-kisan");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [channel, setChannel] = useState("Common Service Centre (CSC)");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [apps, schs] = await Promise.all([getApplications(), getSchemes()]);
      setApplications(apps);
      setSchemes(schs);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referenceNumber.trim()) return;
    setSubmitting(true);
    const newApp = await createApplication({
      scheme_id: selectedScheme,
      reference_number: referenceNumber,
      channel,
      remarks,
    });
    setApplications([newApp, ...applications]);
    setSubmitting(false);
    setShowModal(false);
    setReferenceNumber("");
    setRemarks("");
  };

  const filtered = applications.filter((app) => {
    const matchesFilter = filter === "All" || app.status === filter;
    const matchesSearch =
      app.scheme_name.toLowerCase().includes(search.toLowerCase()) ||
      app.reference_number.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const counts = {
    total: applications.length,
    underReview: applications.filter((a) => a.status === "Under review").length,
    approved: applications.filter((a) => a.status === "Approved").length,
    pendingAction: applications.filter((a) => a.status === "Documents required").length,
  };

  const audioSummary = `${t("application_tracking")}. ${language === "hi" ? "कुल आवेदन" : "Total applications"}: ${counts.total}. ${language === "hi" ? "समीक्षाधीन" : "Under review"}: ${counts.underReview}. ${language === "hi" ? "स्वीकृत" : "Approved"}: ${counts.approved}.`;

  return (
    <div className="space-y-6">
      <PageHeading
        title={t("application_tracking")}
        description={
          language === "hi"
            ? "सरकारी योजनाओं के अपने सभी आवेदनों की स्थिति और प्रगति देखें।"
            : "Monitor official application dossiers, field verification steps, and issuance progress."
        }
        action={
          <div className="flex items-center gap-3">
            <VoiceAssistButton text={audioSummary} label={language === "hi" ? "आवेदन सुनें" : "Listen summary"} />
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#166534] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#14532d]"
            >
              <Plus className="size-4" />
              {language === "hi" ? "नया आवेदन जोड़ें" : "Record Application"}
            </button>
          </div>
        }
      />

      {/* Metrics */}
      <div className="grid gap-3 sm:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs font-medium text-slate-500">{language === "hi" ? "कुल आवेदन" : "Total Applications"}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{counts.total}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-amber-500">
          <p className="text-xs font-medium text-slate-500">{language === "hi" ? "समीक्षाधीन" : "Under Review"}</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">{counts.underReview}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-emerald-500">
          <p className="text-xs font-medium text-slate-500">{language === "hi" ? "स्वीकृत" : "Approved"}</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{counts.approved}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-blue-500">
          <p className="text-xs font-medium text-slate-500">{language === "hi" ? "दस्तावेज़ अपेक्षित" : "Action Required"}</p>
          <p className="mt-1 text-2xl font-bold text-blue-700">{counts.pendingAction}</p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {["All", "Under review", "Approved", "Documents required"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  filter === s
                    ? "bg-[#166534] text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {s === "All" ? (language === "hi" ? "सभी" : "All") : s}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={language === "hi" ? "योजना या संदर्भ सं. खोजें..." : "Search scheme or ref..."}
              className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs outline-none focus:border-[#166534]"
            />
          </div>
        </div>
      </Card>

      {/* Applications Table */}
      <Card>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{language === "hi" ? "योजना का नाम" : "Scheme"}</th>
                <th>{language === "hi" ? "आवेदन संदर्भ" : "Reference No."}</th>
                <th>{language === "hi" ? "प्रस्तुत तिथि" : "Submission Date"}</th>
                <th>{language === "hi" ? "माध्यम" : "Channel"}</th>
                <th>{language === "hi" ? "स्थिति" : "Status"}</th>
                <th>{language === "hi" ? "कार्रवाई" : "Action"}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    {language === "hi" ? "कोई आवेदन नहीं मिला।" : "No applications found."}
                  </td>
                </tr>
              ) : (
                filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/50">
                    <td className="font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <FileText className="size-4 text-[#166534]" />
                        <span>{app.scheme_name}</span>
                      </div>
                    </td>
                    <td className="font-mono text-xs font-medium text-slate-700">{app.reference_number}</td>
                    <td className="text-slate-600">{app.submission_date}</td>
                    <td className="text-slate-600">{app.channel}</td>
                    <td>
                      <StatusBadge status={app.status} />
                    </td>
                    <td>
                      <Link
                        href={`/farmer/applications/${app.id}`}
                        className="inline-flex items-center gap-1 font-semibold text-[#166534] hover:underline text-xs"
                      >
                        {language === "hi" ? "विवरण देखें" : "View Dossier"}
                        <ArrowRight className="size-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Application Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {language === "hi" ? "नया आवेदन दर्ज करें" : "Record Government Application"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">
                  {language === "hi" ? "योजना चुनें" : "Select Scheme"}
                </label>
                <select
                  value={selectedScheme}
                  onChange={(e) => setSelectedScheme(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm outline-none focus:border-[#166534]"
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
                  {language === "hi" ? "आधिकारिक पावती / संदर्भ संख्या" : "Official Reference / Acknowledgement Number"}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KS-2026-98124 or CG-PMFBY-4412"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm outline-none focus:border-[#166534]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  {language === "hi" ? "आवेदन का माध्यम" : "Submission Channel"}
                </label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm outline-none focus:border-[#166534]"
                >
                  <option value="Common Service Centre (CSC)">Common Service Centre (CSC / Lok Seva Kendra)</option>
                  <option value="Direct Online Portal">Direct Online Portal (pmkisan.gov.in / pmfby.gov.in)</option>
                  <option value="Primary Agricultural Cooperative (PACS)">Primary Agricultural Cooperative (PACS / Samiti)</option>
                  <option value="Bank Branch">Commercial / Regional Gramin Bank Branch</option>
                  <option value="Tehsil / Agriculture Office">Tehsil Office / RAEO Desk</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  {language === "hi" ? "अतिरिक्त विवरण / टिप्पणी" : "Additional Remarks"}
                </label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder={language === "hi" ? "दस्तावेज़ जमा करने की जानकारी लिखें..." : "e.g. Physical B1 and Aadhaar passbook copy handed to operator."}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm outline-none focus:border-[#166534]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  {language === "hi" ? "रद्द करें" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-[#166534] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#14532d] disabled:opacity-50"
                >
                  {submitting ? (language === "hi" ? "सहेज रहे हैं..." : "Saving...") : (language === "hi" ? "दर्ज करें" : "Save Record")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
