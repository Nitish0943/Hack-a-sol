import { Card, PageHeading } from "@/components/ui-kit";

export default function OfficerSettingsPage() {
  return <div><PageHeading title="Officer Settings" description="Workspace preferences" /><Card className="max-w-xl"><h3 className="font-bold">Review preferences</h3><div className="mt-4 space-y-3">{["Notify on discrepancy assignment","Notify on grievance assignment","Show only permitted district records"].map(item=><label key={item} className="flex justify-between border-b border-slate-100 py-3 text-sm"><span>{item}</span><input type="checkbox" defaultChecked /></label>)}</div></Card></div>;
}
