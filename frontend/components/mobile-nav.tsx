"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, ShieldCheck, WalletCards, MessageSquareWarning, PhoneCall } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";

export function MobileNavBar() {
  const pathname = usePathname();
  const { language } = useTranslation();

  // Determine current portal
  const isOfficer = pathname.startsWith("/officer");
  const isAdmin = pathname.startsWith("/admin");
  const isFarmer = pathname.startsWith("/farmer") || (!isOfficer && !isAdmin);

  if (pathname === "/" || pathname === "/login" || pathname === "/register") {
    return null; // Keep public landing clean
  }

  const farmerLinks = [
    { href: "/farmer/dashboard", label: language === "hi" ? "डैशबोर्ड" : "Home", icon: LayoutDashboard },
    { href: "/farmer/schemes", label: language === "hi" ? "योजनाएं" : "Schemes", icon: BookOpen },
    { href: "/farmer/eligibility", label: language === "hi" ? "पात्रता" : "Check", icon: ShieldCheck },
    { href: "/farmer/benefits", label: language === "hi" ? "वित्तीय खाता" : "Benefits", icon: WalletCards },
    { href: "/farmer/ivr", label: language === "hi" ? "फोन IVR" : "Phone", icon: PhoneCall },
  ];

  const officerLinks = [
    { href: "/officer/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/officer/farmers", label: "Farmers", icon: BookOpen },
    { href: "/officer/discrepancies", label: "Audits", icon: ShieldCheck },
    { href: "/officer/verifications", label: "Verify", icon: WalletCards },
    { href: "/officer/grievances", label: "Resolve", icon: MessageSquareWarning },
  ];

  const adminLinks = [
    { href: "/admin/dashboard", label: "Admin", icon: LayoutDashboard },
    { href: "/admin/schemes", label: "Schemes", icon: BookOpen },
    { href: "/admin/policies", label: "Radar", icon: ShieldCheck },
    { href: "/admin/users", label: "Users", icon: WalletCards },
  ];

  const links = isOfficer ? officerLinks : isAdmin ? adminLinks : farmerLinks;

  return (
    <nav
      aria-label="Mobile navigation dock"
      className="md:hidden fixed bottom-4 inset-x-4 z-50 rounded-2xl border border-white/20 bg-[#091A10]/85 backdrop-blur-3xl shadow-[0_16px_40px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.1)] px-2 py-1.5"
    >
      <div className="flex items-center justify-around">
        {links.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive
                  ? "bg-emerald-500/20 text-emerald-400 font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className="size-4" />
              <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
