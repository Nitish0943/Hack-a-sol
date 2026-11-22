"use client";

import type { ReactNode } from "react";
import {
  AlertCircle,
  Bell,
  Calculator,
  ClipboardCheck,
  Compass,
  FileText,
  HelpCircle,
  LayoutDashboard,
  MapPinned,
  PhoneCall,
  Radar,
  Settings,
  UserRound,
  WalletCards,
  Wheat,
} from "lucide-react";
import { PortalLayout } from "@/components/portal-layout";
import { useTranslation } from "@/lib/i18n/context";

export default function FarmerLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();

  const links = [
    { href: "/farmer/dashboard", label: t("nav.dashboard", "Dashboard"), icon: <LayoutDashboard className="size-4.5" /> },
    { href: "/farmer/profile", label: t("nav.profile", "My Profile"), icon: <UserRound className="size-4.5" /> },
    { href: "/farmer/schemes", label: t("nav.schemes", "Find Schemes"), icon: <Wheat className="size-4.5" /> },
    { href: "/farmer/eligibility", label: t("nav.eligibility", "Eligibility Checker"), icon: <ClipboardCheck className="size-4.5" />, badge: "Zero-AI" },
    { href: "/farmer/calculator", label: t("nav.calculator", "Loan & Subsidy"), icon: <Calculator className="size-4.5" /> },
    { href: "/farmer/benefits", label: t("nav.benefits", "My Benefits"), icon: <WalletCards className="size-4.5" />, badge: "Ledger" },
    { href: "/farmer/applications", label: t("nav.applications", "Applications"), icon: <MapPinned className="size-4.5" /> },
    { href: "/farmer/grievances", label: t("nav.grievances", "Grievances"), icon: <FileText className="size-4.5" /> },
    { href: "/farmer/ivr", label: t("nav.ivr", "IVR Phone (1800)"), icon: <PhoneCall className="size-4.5" />, badge: "Toll-Free" },
    { href: "/farmer/notifications", label: t("nav.notifications", "Notifications"), icon: <Bell className="size-4.5" /> },
    { href: "/farmer/settings", label: t("nav.settings", "Settings"), icon: <Settings className="size-4.5" /> },
  ];

  return (
    <PortalLayout role="Farmer" title="Farmer Entitlement Portal (किसान पोर्टल)" links={links}>
      {children}
    </PortalLayout>
  );
}
