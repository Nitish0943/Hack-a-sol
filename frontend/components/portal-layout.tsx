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
    <div className="min-h-screen bg-[#F8FAF5]">
      {open && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200 bg-white transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[76px] items-center justify-between border-b border-slate-100 px-5">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[#166534] text-white">
              <Sprout className="size-5" />
            </span>
            <div>
              <p className="font-bold tracking-tight text-[#1F2937]">KrishiSetu</p>
              <p className="text-xs text-slate-500">{role} Portal</p>
            </div>
          </Link>
          <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
            <X className="size-5" />
          </button>
        </div>
        <nav className="space-y-1 px-3 py-5">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-[#EAF4EC] text-[#166534]"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                }`}
              >
                <span className={active ? "text-[#166534]" : "text-slate-400"}>{link.icon}</span>
                <span>{link.label}</span>
                {active && <ChevronRight className="ml-auto size-4" />}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-100 p-3">
          <Link href="/login" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50">
            <LogOut className="size-5 text-slate-400" />
            Sign out
          </Link>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-7">
          <div className="flex items-center gap-3">
            <button className="grid size-10 place-items-center rounded-xl border border-slate-200 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
              <Menu className="size-5" />
            </button>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{role} workspace</p>
              <h1 className="text-lg font-bold text-slate-900">{title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button aria-label="Search" className="hidden size-10 place-items-center rounded-xl border border-slate-200 text-slate-500 sm:grid">
              <Search className="size-4" />
            </button>
            <Link href={role === "Farmer" ? "/farmer/notifications" : "#"} aria-label="Notifications" className="relative grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-500">
              <Bell className="size-4" />
              <span className="absolute right-2 top-2 size-2 rounded-full border-2 border-white bg-red-500" />
            </Link>
            <button className="flex items-center gap-2 rounded-xl border border-slate-200 p-1.5 pr-2.5" aria-label="Profile menu">
              <span className="grid size-8 place-items-center rounded-lg bg-[#EAF4EC] text-[#166534]">
                <CircleUserRound className="size-5" />
              </span>
              <span className="hidden text-left sm:block">
                <span className="block text-xs font-semibold text-slate-800">{role === "Farmer" ? "Ramesh Kumar" : role === "Officer" ? "Anita Verma" : "Admin User"}</span>
                <span className="block text-[10px] text-slate-400">{role}</span>
              </span>
            </button>
          </div>
        </header>
        <main className="p-4 sm:p-7">{children}</main>
      </div>
    </div>
  );
}
