import Link from "next/link";
import { Card, PageHeading, StatusBadge } from "@/components/ui-kit";

export default function OfficerGrievancesPage() {
  return <div><PageHeading title="Grievance Management" description="Review and resolve farmer complaints" /><Card><div className="table-wrap"><table><thead><tr><th>Reference</th><th>Farmer</th><th>Category</th><th>Scheme</th><th>Submitted</th><th>Status</th><th></th></tr></thead><tbody>{[["GRV-CG-10482","Ramesh Kumar","Incorrect amount","PM-KISAN","20 Nov","Under review"],["GRV-CG-10445","Savitri Bai","Payment delay","PMFBY","14 Nov","Submitted"]].map(row=><tr key={row[0]}><td className="font-semibold">{row[0]}</td><td>{row[1]}</td><td>{row[2]}</td><td>{row[3]}</td><td>{row[4]}</td><td><StatusBadge status={row[5]} /></td><td><Link href="/officer/grievances/grv-1" className="font-semibold text-[#166534]">Review</Link></td></tr>)}</tbody></table></div></Card></div>;
}
