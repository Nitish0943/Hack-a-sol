import type { ReactNode } from "react";
import { BookOpen, FileClock, LayoutDashboard, Settings, ShieldCheck, Users, WalletCards } from "lucide-react";
import { PortalLayout } from "@/components/portal-layout";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const links=[
    {href:"/admin/dashboard",label:"Dashboard",icon:<LayoutDashboard className="size-5" />},
    {href:"/admin/schemes",label:"Scheme Management",icon:<BookOpen className="size-5" />},
    {href:"/admin/policies",label:"Policy Rules",icon:<WalletCards className="size-5" />},
    {href:"/admin/users",label:"Users & Roles",icon:<Users className="size-5" />},
    {href:"/admin/audit-logs",label:"Audit Logs",icon:<FileClock className="size-5" />},
    {href:"/admin/settings",label:"Platform Settings",icon:<Settings className="size-5" />},
  ];
  return <PortalLayout role="Administrator" title="Administration" links={links}>{children}</PortalLayout>;
}
