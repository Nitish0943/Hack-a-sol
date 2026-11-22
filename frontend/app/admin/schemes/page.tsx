import { Plus } from "lucide-react";
import { Card, PageHeading, StatusBadge } from "@/components/ui-kit";

export default function AdminSchemesPage() {
  return <div><PageHeading title="Scheme Management" description="Create, edit and archive platform schemes" action={<button className="inline-flex items-center gap-2 rounded-xl bg-[#166534] px-4 py-2.5 text-sm font-semibold text-white"><Plus className="size-4" /> Create scheme</button>} /><Card><div className="table-wrap"><table><thead><tr><th>Scheme</th><th>Department</th><th>Category</th><th>State</th><th>Status</th><th>Updated</th></tr></thead><tbody>{[["PM-KISAN","Agriculture","Income support","Central","Active","18 Nov"],["PMFBY","Insurance","Crop insurance","Central","Active","12 Nov"],["Mukhyamantri Krishi","CG Agriculture","Irrigation","Chhattisgarh","Active","10 Nov"]].map(row=><tr key={row[0]}><td className="font-semibold">{row[0]}</td><td>{row[1]}</td><td>{row[2]}</td><td>{row[3]}</td><td><StatusBadge status={row[4]} /></td><td>{row[5]}</td></tr>)}</tbody></table></div></Card></div>;
}
