import Link from "next/link";
import { Card, PageHeading, StatusBadge } from "@/components/ui-kit";

export default function OfficerApplicationsPage() {
  return <div><PageHeading title="Application Management" description="Review permitted applications" /><Card><div className="table-wrap"><table><thead><tr><th>Reference</th><th>Farmer</th><th>Scheme</th><th>Submitted</th><th>Pending</th><th>Status</th><th></th></tr></thead><tbody>{[["KS-2026-10482","Ramesh Kumar","PM-KISAN","12 Nov","10 days","Under review"],["CG-PMFBY-8821","Savitri Bai","PMFBY","08 Nov","14 days","Documents required"]].map(row=><tr key={row[0]}><td className="font-semibold">{row[0]}</td><td>{row[1]}</td><td>{row[2]}</td><td>{row[3]}</td><td>{row[4]}</td><td><StatusBadge status={row[5]} /></td><td><Link href="/officer/applications/app-1" className="font-semibold text-[#166534]">Review</Link></td></tr>)}</tbody></table></div></Card></div>;
}
