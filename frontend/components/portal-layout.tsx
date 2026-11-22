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
} from "lucide-react";
import React, { useState, type ReactNode } from "react";
import { LanguageSwitcher } from "./language-switcher";
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
    <div className="min-h-screen bg-[#F8FAF5] text-slate-800">
      {/* Mobile Backdrop */}
      {open && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Glass Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-emerald-950/10 bg-white/85 backdrop-blur-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          open ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-20 items-center justify-between border-b border-emerald-950/5 px-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-emerald-700 to-forest-900 text-white shadow-md shadow-emerald-900/25 border border-white/20">
              <Sprout className="size-6 text-emerald-100" />
            </span>
            <div>
              <p className="text-lg font-black tracking-tight text-slate-900 leading-none">
                KrishiSetu
              </p>
              <p className="text-xs font-semibold text-emerald-800 tracking-wide mt-1">
                कृषि सेतु · {role}
              </p>
            </div>
          </Link>
          <button
            className="lg:hidden p-1.5 rounded-xl text-slate-500 hover:bg-slate-100"
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
                    ? "bg-gradient-to-r from-emerald-800 to-emerald-700 text-white shadow-md shadow-emerald-900/15 border border-emerald-600/30"
                    : "text-slate-600 hover:bg-emerald-50/70 hover:text-emerald-900"
                }`}
              >
                <span className={active ? "text-white" : "text-slate-400 group-hover:text-emerald-700"}>
                  {link.icon}
                </span>
                <span className="truncate">{link.label}</span>
                {link.badge && (
                  <span
                    className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      active ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {link.badge}
                  </span>
                )}
                {active && !link.badge && <ChevronRight className="ml-auto size-4 text-emerald-200" />}
              </Link>
            );
          })}

          {/* Direct IVR Call Pill inside sidebar for farmers */}
          {role === "Farmer" && (
            <div className="pt-4 px-1">
              <div className="rounded-2xl border border-amber-300/60 bg-gradient-to-br from-amber-50 to-orange-50/60 p-4 shadow-xs">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wide">
                  <Phone className="size-3.5" /> IVR Helpline
                </div>
                <p className="mt-1 text-xs text-amber-800/80">Call anytime from basic phone:</p>
                <Link
                  href="/farmer/ivr"
                  className="mt-2 block w-full text-center py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-xs transition"
                >
                  Dial 1800-890-SETU
                </Link>
              </div>
            </div>
          )}
        </nav>

        {/* User Signout Footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-emerald-950/5 bg-white/90 p-3 backdrop-blur-md">
          <Link
            href="/login"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-700 transition"
          >
            <LogOut className="size-4 text-slate-400" />
            <span>{t("common.signOut")}</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-72">
        {/* Sticky Glass Top Header */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-emerald-950/8 bg-white/80 px-4 backdrop-blur-2xl sm:px-8 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              className="grid size-11 place-items-center rounded-xl border border-slate-200/80 bg-white/70 lg:hidden shadow-xs cursor-pointer hover:bg-white"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="size-5 text-slate-700" />
            </button>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                {role} Workspace
              </p>
              <h1 className="text-xl font-black text-slate-900 leading-tight">{title}</h1>
            </div>
          </div>

          {/* Action Bar with Language Switcher and Profile */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher showAudioPill={true} />

            <Link
              href={role === "Farmer" ? "/farmer/notifications" : "#"}
              aria-label="Notifications"
              className="relative grid size-10 place-items-center rounded-xl border border-slate-200/80 bg-white/70 text-slate-600 shadow-2xs hover:bg-white transition"
            >
              <Bell className="size-4.5" />
              <span className="absolute right-2 top-2 size-2.5 rounded-full border-2 border-white bg-amber-500 animate-pulse" />
            </Link>

            <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white/70 p-1.5 pr-3 shadow-2xs">
              <span className="grid size-9 place-items-center rounded-lg bg-emerald-100 text-emerald-800 font-bold text-sm">
                <CircleUserRound className="size-5 text-emerald-700" />
              </span>
              <div className="hidden text-left md:block">
                <p className="text-xs font-bold text-slate-900 leading-none">{roleName}</p>
                <p className="text-[10px] text-slate-500 font-medium mt-1 leading-none">{roleSubtitle}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-4 sm:p-8 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
