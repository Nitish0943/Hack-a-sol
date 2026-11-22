"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronRight,
  CircleUserRound,
  LogOut,
  Menu,
  Phone,
  Sprout,
  X,
  Volume2,
} from "lucide-react";
import React, { useState, type ReactNode } from "react";
import { LanguageSwitcher } from "./language-switcher";
import { MobileNavBar } from "./mobile-nav";
import { useTranslation } from "@/lib/i18n/context";

export type PortalLink = {
  href: string;
  label: string;
  icon: ReactNode;
  badge?: string;
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
  const { t } = useTranslation();

  const roleName =
    role === "Farmer"
      ? "Ramesh Kumar (रमेश कुमार)"
      : role === "Officer"
        ? "Anita Verma (कृषि अधिकारी)"
        : "Platform Admin";

  const roleSubtitle =
    role === "Farmer"
      ? "KS-CG-10482 · Raipur, CG"
      : role === "Officer"
        ? "Raipur District Extension"
        : "System Administrator";

  return (
    <div className="min-h-screen text-slate-100 relative">
      {/* Mobile Drawer Backdrop */}
      {open && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md lg:hidden transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Floating Spatial Glass Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-white/10 bg-[#08180E]/80 backdrop-blur-3xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          open ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Specular Rim Light */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

        {/* Brand Header */}
        <div className="flex h-20 items-center justify-between border-b border-white/[0.08] px-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-slate-950 font-black shadow-lg shadow-emerald-500/25 border border-white/30">
              <Sprout className="size-6 text-slate-950" />
            </span>
            <div>
              <p className="text-lg font-black tracking-tight text-white leading-none font-display">
                KrishiSetu
              </p>
              <p className="text-xs font-bold text-emerald-400 tracking-wide mt-1">
                कृषि सेतु · {role}
              </p>
            </div>
          </Link>
          <button
            className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:bg-white/10"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="h-[calc(100vh-170px)] overflow-y-auto space-y-1.5 px-4 py-5 scrollbar-thin">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 font-bold shadow-[0_0_20px_rgba(16,185,129,0.35)] border border-white/30"
                    : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <span className={active ? "text-slate-950" : "text-slate-400 group-hover:text-emerald-400"}>
                  {link.icon}
                </span>
                <span className="truncate">{link.label}</span>
                {link.badge && (
                  <span
                    className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      active ? "bg-slate-950/30 text-slate-950" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    }`}
                  >
                    {link.badge}
                  </span>
                )}
                {active && !link.badge && <ChevronRight className="ml-auto size-4 text-slate-950" />}
              </Link>
            );
          })}

          {/* Direct IVR Call Pill inside sidebar for farmers */}
          {role === "Farmer" && (
            <div className="pt-4 px-1">
              <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-amber-900/15 to-transparent p-4 backdrop-blur-md">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wide">
                  <Phone className="size-3.5 text-amber-400" /> IVR Helpline
                </div>
                <p className="mt-1 text-xs text-amber-200/80">Basic keypad phone audio support:</p>
                <Link
                  href="/farmer/ivr"
                  className="mt-2.5 block w-full text-center py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-sm transition"
                >
                  Dial 1800-890-SETU
                </Link>
              </div>
            </div>
          )}
        </nav>

        {/* User Signout Footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/[0.08] bg-[#07150C]/90 p-3 backdrop-blur-md">
          <Link
            href="/login"
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-400 hover:bg-rose-500/15 hover:text-rose-300 transition"
          >
            <LogOut className="size-4" />
            <span>{t("common.signOut")}</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        {/* Sticky Glass Top Header */}
        <header className="sticky top-0 z-30 flex h-16 sm:h-20 items-center justify-between border-b border-white/[0.08] bg-[#07130B]/80 px-3 sm:px-8 backdrop-blur-3xl shadow-sm gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              className="shrink-0 grid size-9 sm:size-11 place-items-center rounded-xl border border-white/10 bg-white/5 lg:hidden cursor-pointer hover:bg-white/10 text-slate-200"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="size-4 sm:size-5" />
            </button>
            <div className="min-w-0">
              <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono truncate">
                {role} Workspace
              </p>
              <h1 className="text-sm sm:text-xl font-black text-white leading-tight font-display truncate">{title}</h1>
            </div>
          </div>

          {/* Action Bar with Language Switcher and Profile */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <LanguageSwitcher showAudioPill={true} />

            <Link
              href={role === "Farmer" ? "/farmer/notifications" : "#"}
              aria-label="Notifications"
              className="relative grid size-8 sm:size-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition"
            >
              <Bell className="size-4 sm:size-4.5" />
              <span className="absolute right-1.5 top-1.5 sm:right-2 sm:top-2 size-2 rounded-full bg-amber-400 animate-pulse" />
            </Link>

            <div className="hidden xs:flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-1 sm:p-1.5 sm:pr-3">
              <span className="grid size-7 sm:size-9 place-items-center rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs sm:text-sm border border-emerald-500/30">
                <CircleUserRound className="size-4 sm:size-5" />
              </span>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-100 leading-none">{roleName}</p>
                <p className="text-[10px] text-slate-400 font-mono mt-1 leading-none">{roleSubtitle}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-4 sm:p-8 max-w-7xl mx-auto w-full flex-1 pb-24 md:pb-8">
          {children}
        </main>

        {/* Floating Mobile Bottom Navigation Dock */}
        <MobileNavBar />
      </div>
    </div>
  );
}
