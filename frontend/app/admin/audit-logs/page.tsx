import { Card, PageHeading } from "@/components/ui-kit";

export default function AuditLogsPage() {
  return <div><PageHeading title="Audit Logs" description="Immutable administrative activity records" /><Card><div className="table-wrap"><table><thead><tr><th>User</th><th>Action</th><th>Entity</th><th>Timestamp</th><th>Change</th></tr></thead><tbody>{[["Anita Verma","Updated status","Application KCC-77421","22 Nov 11:42","Under review → Documents required"],["Platform Admin","Activated policy","2026-CG-PMKS-01","21 Nov 15:12","Status: Draft → Active"],["Anita Verma","Recorded review","Discrepancy ALT-10482","21 Nov 09:18","Remark added"]].map(row=><tr key={row[0]+row[1]}>{row.map((cell,i)=><td key={i} className={i===0?"font-semibold":""}>{cell}</td>)}</tr>)}</tbody></table></div></Card></div>;
}
