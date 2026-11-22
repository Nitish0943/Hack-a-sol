import type { ReactNode } from "react";
import {
  Bell, Calculator, ClipboardCheck, LayoutDashboard, MapPinned,
  PhoneCall, Settings, UserRound, WalletCards, Wheat,
} from "lucide-react";
import { PortalLayout } from "@/components/portal-layout";

export default function FarmerLayout({ children }: { children: ReactNode }) {
  const links = [
    { href: "/farmer/dashboard", label: "Dashboard", icon: <LayoutDashboard className="size-5" /> },
    { href: "/farmer/profile", label: "My Profile", icon: <UserRound className="size-5" /> },
    { href: "/farmer/schemes", label: "AI Scheme Search", icon: <Wheat className="size-5" /> },
    { href: "/farmer/eligibility", label: "Eligibility Checker", icon: <ClipboardCheck className="size-5" /> },
    { href: "/farmer/calculator", label: "Loan & Subsidy", icon: <Calculator className="size-5" /> },
    { href: "/farmer/benefits", label: "My Benefits", icon: <WalletCards className="size-5" /> },
    { href: "/farmer/applications", label: "Applications", icon: <MapPinned className="size-5" /> },
    { href: "/farmer/grievances", label: "Grievances", icon: <Bell className="size-5" /> },
    { href: "/farmer/notifications", label: "Notifications", icon: <Bell className="size-5" /> },
    { href: "/farmer/ivr", label: "IVR Support", icon: <PhoneCall className="size-5" /> },
    { href: "/farmer/settings", label: "Settings", icon: <Settings className="size-5" /> },
  ];
  return <PortalLayout role="Farmer" title="Farmer portal" links={links}>{children}</PortalLayout>;
}
