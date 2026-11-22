import Link from "next/link";
import { Card, PageHeading, StatusBadge } from "@/components/ui-kit";

export default function DiscrepanciesPage() {
  return <div><PageHeading title="Discrepancy Alerts" description="Policy-to-payment integrity review" /><Card><div className="table-wrap"><table><thead><tr><th>Alert</th><th>Farmer</th><th>Scheme</th><th>Difference</th><th>Severity</th><th>Status</th><th></th></tr></thead><tbody>{[["ALT-10482","Ramesh Kumar","PM-KISAN","₹4,000","High","Pending"],["ALT-10451","Savitri Bai","KCC","₹2,500","Medium","Under review"]].map(row=><tr key={row[0]}><td className="font-semibold">{row[0]}</td><td>{row[1]}</td><td>{row[2]}</td><td>{row[3]}</td><td>{row[4]}</td><td><StatusBadge status={row[5]} /></td><td><Link href="/officer/discrepancies/alt-10482" className="font-semibold text-[#166534]">Review</Link></td></tr>)}</tbody></table></div></Card></div>;
}
