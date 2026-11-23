import Link from "next/link";
import { Search } from "lucide-react";
import { Card, PageHeading, StatusBadge } from "@/components/ui-kit";

export default function OfficerFarmersPage() {
  const rows=[["KS-CG-10482","Ramesh Kumar","Khamtarai","Raipur","Landowner","Verified"],["KS-CG-10483","Savitri Bai","Tilda","Raipur","Sharecropper","Review"],["KS-CG-10484","Mohit Sahu","Dhamtari","Dhamtari","Tenant farmer","Pending"]];
  return <div><PageHeading title="Farmer Management" description="Authorized farmer records" /><Card className="mb-5"><div className="flex gap-3"><label className="relative flex-1"><Search className="absolute left-3 top-3 size-4 text-slate-400" /><input className="field pl-10" placeholder="Search farmer or ID" /></label><select className="field w-44"><option>All districts</option><option>Raipur</option><option>Durg</option></select></div></Card><Card><div className="table-wrap"><table><thead><tr><th>Farmer ID</th><th>Name</th><th>Village</th><th>District</th><th>Cultivator</th><th>Verification</th><th></th></tr></thead><tbody>{rows.map(row=><tr key={row[0]}><td className="font-semibold">{row[0]}</td><td>{row[1]}</td><td>{row[2]}</td><td>{row[3]}</td><td>{row[4]}</td><td><StatusBadge status={row[5]} /></td><td><Link href="/officer/farmers/ks-10482" className="font-semibold text-[#166534]">View</Link></td></tr>)}</tbody></table></div></Card></div>;
}
