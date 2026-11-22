"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, MessageSquareWarning, ArrowRight, Clock, CheckCircle2, AlertTriangle, ShieldAlert } from "lucide-react";
import { Card, PageHeading, StatusBadge, VoiceAssistButton } from "@/components/ui-kit";
import { getGrievances } from "@/lib/api";
import { useTranslation } from "@/lib/i18n/context";

export default function GrievancesPage() {
  const { t, language } = useTranslation();
  const [grievances, setGrievances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getGrievances();
      setGrievances(data);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = grievances.filter((g) => {
    const matchesFilter = filter === "All" || g.status === filter;
    const matchesSearch =
      g.scheme_name.toLowerCase().includes(search.toLowerCase()) ||
      g.reference_number.toLowerCase().includes(search.toLowerCase()) ||
      g.category.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const counts = {
    total: grievances.length,
    underReview: grievances.filter((g) => g.status === "Under review").length,
    resolved: grievances.filter((g) => g.status === "Resolved").length,
  };

  const audioSummary = `${language === "hi" ? "शिकायत निवारण प्रणाली" : "Grievance Assistance"}. ${language === "hi" ? "कुल दर्ज शिकायतें" : "Total complaints"}: ${counts.total}. ${language === "hi" ? "जांच जारी" : "Under review"}: ${counts.underReview}. ${language === "hi" ? "समाधान हो चुका" : "Resolved"}: ${counts.resolved}.`;

  return (
    <div className="space-y-6">
      <PageHeading
        title={language === "hi" ? "शिकायत एवं समस्या निवारण" : "Grievance & Issue Assistance"}
        description={
          language === "hi"
            ? "स्वीकृति में अंतर, भुगतान में देरी या बैंक डीबीटी समस्याओं के निवारण हेतु आधिकारिक शिकायत दर्ज करें।"
            : "Resolve sanction variances, delayed disbursements, DBT account rejections, and revenue mismatch issues."
        }
        action={
          <div className="flex items-center gap-3">
            <VoiceAssistButton text={audioSummary} label={language === "hi" ? "स्थिति सुनें" : "Listen summary"} />
            <Link
              href="/farmer/grievances/new"
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
            >
              <Plus className="size-4" />
              {language === "hi" ? "नई शिकायत दर्ज करें" : "File New Grievance"}
            </Link>
          </div>
        }
      />

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs font-medium text-slate-500">{language === "hi" ? "कुल शिकायतें" : "Total Grievances"}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{counts.total}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-amber-500">
          <p className="text-xs font-medium text-slate-500">{language === "hi" ? "अधिकारी समीक्षाधीन" : "Under Investigation"}</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">{counts.underReview}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-emerald-500">
          <p className="text-xs font-medium text-slate-500">{language === "hi" ? "निराकृत / समाधान" : "Resolved within SLA"}</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{counts.resolved}</p>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {["All", "Under review", "Resolved"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  filter === s
                    ? "bg-slate-900 text-white shadow-sm"
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
              placeholder={language === "hi" ? "शिकायत या संदर्भ खोजें..." : "Search grievance or ticket..."}
              className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs outline-none focus:border-[#166534]"
            />
          </div>
        </div>
      </Card>

      {/* Grievance Ledger List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <Card className="py-12 text-center text-slate-500">
            {language === "hi" ? "कोई शिकायत रिकॉर्ड नहीं मिला।" : "No grievances on record."}
          </Card>
        ) : (
          filtered.map((grv) => (
            <Card key={grv.id} className="p-5 transition hover:shadow-md">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-red-600">{grv.reference_number}</span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                      {grv.scheme_name}
                    </span>
                    <StatusBadge status={grv.status} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{grv.category}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{grv.description}</p>
                  
                  {grv.officer_resolution && (
                    <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-950">
                      <span className="font-bold flex items-center gap-1.5 text-emerald-900 mb-1">
                        <CheckCircle2 className="size-4 text-emerald-600" />
                        {language === "hi" ? "अधिकारी द्वारा समाधान / कार्रवाई टिप्पणी:" : "Officer Action & Resolution:"}
                      </span>
                      {grv.officer_resolution}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-3 shrink-0">
                  <span className="text-[11px] text-slate-400">{grv.created_at}</span>
                  <Link
                    href={`/farmer/grievances/${grv.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {language === "hi" ? "पूर्ण विवरण" : "View Case"}
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
