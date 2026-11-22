import type { ReactNode } from "react";
import { AlertTriangle, ClipboardCheck, LayoutDashboard, MapPinned, Settings, UserRound, Users, WalletCards } from "lucide-react";
import { PortalLayout } from "@/components/portal-layout";

export default function OfficerLayout({ children }: { children: ReactNode }) {
  const links = [
    { href:"/officer/dashboard", label:"Overview", icon:<LayoutDashboard className="size-5" /> },
    { href:"/officer/farmers", label:"Farmers", icon:<Users className="size-5" /> },
    { href:"/officer/applications", label:"Applications", icon:<ClipboardCheck className="size-5" /> },
    { href:"/officer/discrepancies", label:"Discrepancy Alerts", icon:<AlertTriangle className="size-5" /> },
    { href:"/officer/grievances", label:"Grievances", icon:<UserRound className="size-5" /> },
    { href:"/officer/verifications", label:"Cultivator Verification", icon:<MapPinned className="size-5" /> },
    { href:"/officer/reports", label:"Reports", icon:<WalletCards className="size-5" /> },
    { href:"/officer/settings", label:"Settings", icon:<Settings className="size-5" /> },
  ];
  return <PortalLayout role="Officer" title="Government officer" links={links}>{children}</PortalLayout>;
}
