import { Plus } from "lucide-react";
import { Card, PageHeading, StatusBadge } from "@/components/ui-kit";

export default function PoliciesPage() {
  return <div><PageHeading title="Policy Rule Management" description="Versioned eligibility and calculation rules" action={<button className="inline-flex items-center gap-2 rounded-xl bg-[#166534] px-4 py-2.5 text-sm font-semibold text-white"><Plus className="size-4" /> New policy version</button>} /><Card><div className="table-wrap"><table><thead><tr><th>Version</th><th>Scheme</th><th>Financial year</th><th>State</th><th>Status</th><th>Updated</th></tr></thead><tbody>{[["2026-CG-PMKS-01","PM-KISAN","2026–27","Chhattisgarh","Active","18 Nov"],["2026-CG-CREDIT-01","KCC","2026–27","Chhattisgarh","Active","15 Nov"],["2025-CG-PMKS-02","PM-KISAN","2025–26","Chhattisgarh","Archived","31 Mar"]].map(row=><tr key={row[0]}><td className="font-semibold">{row[0]}</td><td>{row[1]}</td><td>{row[2]}</td><td>{row[3]}</td><td><StatusBadge status={row[4]} /></td><td>{row[5]}</td></tr>)}</tbody></table></div></Card></div>;
}
