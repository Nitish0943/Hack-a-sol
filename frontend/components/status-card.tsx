"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getStatus } from "@/lib/api";
import type { ApiStatus } from "@/types/api";

type ConnectionState = "loading" | "connected" | "error";

export function StatusCard() {
  const [status, setStatus] = useState<ApiStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>("loading");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    getStatus(controller.signal)
      .then((response) => {
        setStatus(response);
        setConnectionState("connected");
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setError(cause instanceof Error ? cause.message : "Unable to reach the API.");
        setConnectionState("error");
      });

    return () => controller.abort();
  }, [refreshKey]);

  function refreshStatus() {
    setConnectionState("loading");
    setError(null);
    setRefreshKey((key) => key + 1);
  }

  const isConnected = connectionState === "connected";
  const label = {
    loading: "Connecting",
    connected: "Connected",
    error: "Unavailable",
  }[connectionState];

  return (
    <section
      aria-live="polite"
      className="w-full max-w-md border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_36px_rgba(24,35,30,0.06)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
            Backend connection
          </p>
          <div className="mt-3 flex items-center gap-2.5">
            <span
              className={`size-2.5 rounded-full ${
                isConnected
                  ? "bg-emerald-600"
                  : connectionState === "error"
                    ? "bg-rose-600"
                    : "animate-pulse bg-amber-500"
              }`}
            />
            <h2 className="text-xl font-semibold">{label}</h2>
          </div>
        </div>
        <Button
          aria-label="Refresh backend status"
          disabled={connectionState === "loading"}
          onClick={refreshStatus}
          title="Refresh backend status"
        >
          <RefreshCw aria-hidden="true" className="size-4" />
        </Button>
      </div>

      {connectionState === "loading" ? (
        <p className="mt-6 text-sm text-[var(--muted)]">Checking the API...</p>
      ) : isConnected && status ? (
        <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-[var(--line)] pt-5 text-sm">
          <div>
            <dt className="text-[var(--muted)]">Application</dt>
            <dd className="mt-1 font-medium">{status.application}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Version</dt>
            <dd className="mt-1 font-medium">{status.version}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Environment</dt>
            <dd className="mt-1 font-medium capitalize">{status.environment}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">API status</dt>
            <dd className="mt-1 font-medium capitalize">{status.status}</dd>
          </div>
        </dl>
      ) : (
        <p className="mt-6 border-t border-[var(--line)] pt-5 text-sm leading-6 text-rose-700">
          {error}
        </p>
      )}
    </section>
  );
}