"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronRight,
  CircleUserRound,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Sprout,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/language-switcher";
import { GlobalVoiceAssistant } from "@/components/assistant/voice-assistant";

export type PortalLink = {
  href: string;
  label: string;
  icon: ReactNode;
};

export function PortalLayout({
  role,
  title,
  links,
  children,
}: {
  role: "Farmer" | "Officer" | "Administrator";
  title: string;
  links: PortalLink[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {open && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        style={{ position: "fixed" }}
        className={cn(
          "inset-y-0 left-0 z-50 flex h-screen w-72 flex-col glass rounded-none border-y-0 border-l-0 border-r border-slate-200/90 shadow-[2px_0_12px_rgba(0,0,0,0.03)] transition-transform duration-200",
          open ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-slate-200/90 px-5">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[#166534] text-white">
              <Sprout className="size-5" />
            </span>
            <div>
              <p className="font-bold tracking-tight text-slate-900 dark:text-white">KrishiSetu</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{role} Portal</p>
            </div>
          </Link>
          <button className="lg:hidden text-slate-700" onClick={() => setOpen(false)} aria-label="Close menu">
            <X className="size-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                  active
                    ? "bg-white/90 text-[#166534] shadow-[0_4px_16px_rgba(22,101,52,.15),inset_0_1px_0_#fff] border border-emerald-200/60"
                    : "text-slate-700 hover:translate-x-1 hover:bg-white/60 hover:text-slate-950"
                }`}
              >
                <span className={active ? "text-[#166534]" : "text-slate-500"}>{link.icon}</span>
                <span>{link.label}</span>
                {active && <ChevronRight className="ml-auto size-4" />}
              </Link>
            );
          })}
        </nav>
        <div className="shrink-0 border-t border-slate-200/90 p-3 bg-white/50">
          <Link href="/login" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100/80 transition">
            <LogOut className="size-5 text-slate-500" />
            Sign out
          </Link>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header
          style={{ position: "sticky" }}
          className="top-0 z-30 flex h-[76px] items-center justify-between glass rounded-none border-x-0 border-t-0 border-b border-slate-200/90 shadow-[0_1px_4px_rgba(0,0,0,0.04)] px-4 sm:px-7"
        >
          <div className="flex items-center gap-3">
            <button className="grid size-10 place-items-center glass rounded-xl border border-slate-200/90 lg:hidden text-slate-800" onClick={() => setOpen(true)} aria-label="Open menu">
              <Menu className="size-5" />
            </button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{role} workspace</p>
              <h1 className="text-lg font-bold text-slate-900">{title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <button aria-label="Search" className="hidden size-10 place-items-center rounded-xl border border-slate-200/90 bg-white/70 text-slate-700 hover:text-slate-950 sm:grid shadow-xs transition">
              <Search className="size-4" />
            </button>
            <Link href={role === "Farmer" ? "/farmer/notifications" : "#"} aria-label="Notifications" className="relative grid size-10 place-items-center glass rounded-xl border border-slate-200/90 text-slate-700 hover:text-slate-950 shadow-xs transition">
              <Bell className="size-4" />
              <span className="absolute right-2 top-2 size-2 rounded-full border-2 border-white bg-red-500" />
            </Link>
            <button className="flex items-center gap-2 glass rounded-xl border border-slate-200/90 p-1.5 pr-2.5 shadow-xs hover:bg-white/80 transition" aria-label="Profile menu">
              <span className="grid size-8 place-items-center rounded-lg bg-emerald-50 text-[#166534] border border-emerald-200/60">
                <CircleUserRound className="size-5" />
              </span>
              <span className="hidden text-left sm:block">
                <span className="block text-xs font-bold text-slate-900">{role === "Farmer" ? "Ramesh Kumar" : role === "Officer" ? "Anita Verma" : "Admin User"}</span>
                <span className="block text-[10px] font-semibold text-slate-500">{role}</span>
              </span>
            </button>
          </div>
        </header>
        <main className="p-4 pb-28 sm:p-7 lg:pb-7">{children}</main>
      </div>
      <nav aria-label="Primary" className="glass fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-full p-1.5 lg:hidden">
        {links.slice(0, 4).map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link key={link.href} href={link.href} className={`flex min-w-[60px] flex-col items-center gap-0.5 rounded-full px-3 py-2 text-[10px] font-semibold transition ${active ? "glass-green" : "text-slate-600"}`}>
              {link.icon}<span className="max-w-[64px] truncate">{link.label.split(" ")[0]}</span>
            </Link>
          );
        })}
        <button onClick={() => setOpen(true)} className="flex min-w-[60px] flex-col items-center gap-0.5 rounded-full px-3 py-2 text-[10px] font-semibold text-slate-600"><MoreHorizontal className="size-5" /><span>More</span></button>
      </nav>

      {/* Global AI Voice Command Assistant */}
      <GlobalVoiceAssistant />
    </div>
  );
}
