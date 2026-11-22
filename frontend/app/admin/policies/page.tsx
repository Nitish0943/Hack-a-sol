"use client";

import { useEffect, useState } from "react";
import { WalletCards, ArrowRight, AlertTriangle, ShieldCheck, FileDiff, Sparkles, Check } from "lucide-react";
import { Card, PageHeading, StatusBadge } from "@/components/ui-kit";
import { getRadarUpdates } from "@/lib/api";

export default function AdminPoliciesPage() {
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getRadarUpdates();
      setUpdates(data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeading
        title="Scheme Change Impact Radar"
        description="Versioned policy clause tracking, circular diff comparison, and beneficiary vulnerability impact analysis."
      />

      <div className="space-y-6">
        {updates.map((item, idx) => (
          <Card key={idx} className="p-6 space-y-5 border-l-4 border-l-[#166534]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="font-mono text-xs font-bold text-slate-500 uppercase">{item.scheme_id}</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Policy Revision: {item.previous_version} → {item.current_version}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">Effective: {item.effective_date}</span>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                  {item.status}
                </span>
              </div>
            </div>

            {/* Clause Diff Analysis */}
            <div className="space-y-4">
              {item.changed_clauses?.map((clause: any, cIdx: number) => (
                <div key={cIdx} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <FileDiff className="size-4 text-[#166534]" />
                      {clause.clause}
                    </h4>
                    <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-800">
                      {clause.impact}
                    </span>
                  </div>

                  {/* Before / After Diff comparison */}
                  <div className="grid gap-3 sm:grid-cols-2 text-xs">
                    <div className="rounded-xl border border-red-200 bg-red-50/40 p-3.5 space-y-1">
                      <span className="font-mono text-[10px] font-bold uppercase text-red-700">
                        Previous Guideline ({item.previous_version})
                      </span>
                      <p className="text-red-950 leading-relaxed">{clause.previous_text}</p>
                    </div>

                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3.5 space-y-1">
                      <span className="font-mono text-[10px] font-bold uppercase text-emerald-700">
                        Enforced Clause ({item.current_version})
                      </span>
                      <p className="text-emerald-950 leading-relaxed font-medium">{clause.current_text}</p>
                    </div>
                  </div>

                  {/* Impact and Action */}
                  <div className="rounded-xl bg-slate-50 p-3.5 text-xs space-y-2 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700">Jurisdiction Beneficiaries Affected:</span>
                      <span className="font-bold text-red-600">{clause.affected_farmers_count} Cultivators</span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      <span className="font-bold text-slate-800">Mandated Action:</span> {clause.action_required}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
