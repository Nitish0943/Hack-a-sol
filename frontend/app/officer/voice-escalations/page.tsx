"use client";

import { useEffect, useState } from "react";
import { PhoneCall, UserRound } from "lucide-react";
import { Card, PageHeading, StatusBadge } from "@/components/ui-kit";
import { voiceApi } from "@/lib/api";
import type { VoiceEscalation } from "@/types/api";

function nextAction(status: string): { status: "assigned" | "contacted" | "closed"; label: string } | null {
  if (status === "pending") return { status: "assigned", label: "Assign to me" };
  if (status === "assigned") return { status: "contacted", label: "Mark contacted" };
  if (status === "contacted") return { status: "closed", label: "Close request" };
  return null;
}

export default function OfficerVoiceEscalationsPage() {
  const [items, setItems] = useState<VoiceEscalation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    voiceApi.officerEscalations().then((result) => {
      if (active) setItems(result);
    }).catch((cause: unknown) => {
      if (active) {
        setError(cause instanceof Error ? cause.message : "Could not load voice escalations.");
      }
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  async function advance(item: VoiceEscalation) {
    const action = nextAction(item.status);
    if (!action) return;
    setBusyId(item.id);
    setError(null);
    try {
      await voiceApi.updateEscalation(item.id, action.status);
      setItems((current) => current.map((entry) =>
        entry.id === item.id ? { ...entry, status: action.status } : entry,
      ));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update this escalation.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <PageHeading
        title="Voice Escalations"
        description="Review callback requests from verified farmers and track officer follow-up."
      />
      {error && (
        <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {loading ? (
        <Card><p className="text-sm text-slate-500">Loading voice escalations…</p></Card>
      ) : items.length === 0 ? (
        <Card><p className="text-sm text-slate-500">There are no voice escalation requests.</p></Card>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const action = nextAction(item.status);
            return (
              <Card key={item.id}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold capitalize text-slate-900">
                        {item.reason.replaceAll("_", " ")}
                      </h3>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{item.summary}</p>
                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1"><UserRound className="size-3.5" /> Farmer: {item.farmer_id ?? "Not available"}</span>
                      <span>Language: {item.preferred_language.toUpperCase()}</span>
                      <span>Received: {new Date(item.created_at).toLocaleString()}</span>
                      {item.assigned_officer && <span>Assigned officer: {item.assigned_officer}</span>}
                    </div>
                  </div>
                  {action && (
                    <button
                      type="button"
                      onClick={() => void advance(item)}
                      disabled={busyId === item.id}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#166534] px-4 py-2 text-sm font-semibold text-white hover:bg-[#14532d] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <PhoneCall className="size-4" />
                      {busyId === item.id ? "Updating…" : action.label}
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
