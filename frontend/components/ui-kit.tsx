import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("glass min-w-0 rounded-3xl p-5 border border-slate-200/80 transition duration-300 hover:-translate-y-0.5 shadow-sm", className)}>{children}</section>;
}

export function StatCard({
  label,
  value,
  detail,
  icon,
  tone = "green",
}: {
  label: string;
  value: string;
  detail: string;
  icon?: ReactNode;
  tone?: "green" | "yellow" | "blue" | "slate";
}) {
  const tones = {
    green: "bg-[#EAF4EC] text-[#166534]",
    yellow: "bg-amber-50 text-amber-800",
    blue: "bg-blue-50 text-blue-800",
    slate: "bg-slate-100 text-slate-700",
  };
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-600">{label}</p>
          <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">{value}</p>
          <p className="mt-1 text-xs font-medium text-slate-600">{detail}</p>
        </div>
        <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", tones[tone])}>{icon}</span>
      </div>
    </Card>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const tone = normalized.includes("eligible") || normalized.includes("approved") || normalized.includes("verified") || normalized.includes("resolved") || normalized.includes("received") || normalized.includes("completed")
    ? "bg-emerald-50 text-emerald-800 ring-emerald-600/30"
    : normalized.includes("review") || normalized.includes("pending") || normalized.includes("submitted") || normalized.includes("applied")
      ? "bg-amber-50 text-amber-800 ring-amber-600/30"
      : normalized.includes("rejected") || normalized.includes("dismissed") || normalized.includes("closed")
        ? "bg-red-50 text-red-800 ring-red-600/30"
        : "bg-blue-50 text-blue-800 ring-blue-600/30";
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset shadow-2xs", tone)}>{status}</span>;
}

export function PageHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
        {description && <p className="mt-1 text-sm font-semibold text-slate-600">{description}</p>}
      </div>
      {action}
    </div>
  );
}
