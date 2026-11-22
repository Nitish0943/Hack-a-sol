import Link from "next/link";
import { Card, PageHeading, StatusBadge } from "@/components/ui-kit";

export default function VerificationsPage() {
  return <div><PageHeading title="Cultivator Verification" description="Evidence-based cultivator checks" /><Card><div className="table-wrap"><table><thead><tr><th>Farmer ID</th><th>Name</th><th>Cultivator type</th><th>Village</th><th>Evidence</th><th>Status</th><th></th></tr></thead><tbody>{[["KS-CG-10483","Savitri Bai","Sharecropper","Tilda","Cultivation declaration","Under review"],["KS-CG-10484","Mohit Sahu","Tenant farmer","Dhamtari","Lease record","Submitted"]].map(row=><tr key={row[0]}><td className="font-semibold">{row[0]}</td><td>{row[1]}</td><td>{row[2]}</td><td>{row[3]}</td><td>{row[4]}</td><td><StatusBadge status={row[5]} /></td><td><Link href="/officer/verifications/ver-1" className="font-semibold text-[#166534]">Review</Link></td></tr>)}</tbody></table></div></Card></div>;
}
