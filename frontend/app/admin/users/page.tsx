import { Plus } from "lucide-react";
import { Card, PageHeading, StatusBadge } from "@/components/ui-kit";

export default function AdminUsersPage() {
  return <div><PageHeading title="User & Role Management" description="Manage authorized accounts" action={<button className="inline-flex items-center gap-2 rounded-xl bg-[#166534] px-4 py-2.5 text-sm font-semibold text-white"><Plus className="size-4" /> Add user</button>} /><Card><div className="table-wrap"><table><thead><tr><th>User ID</th><th>Name</th><th>Role</th><th>District</th><th>Status</th><th>Created</th></tr></thead><tbody>{[["USR-001","Ramesh Kumar","Farmer","Raipur","Active","10 Oct"],["USR-101","Anita Verma","Officer","Raipur","Active","4 Nov"],["USR-901","Platform Admin","Administrator","All","Active","1 Sep"]].map(row=><tr key={row[0]}><td className="font-semibold">{row[0]}</td><td>{row[1]}</td><td>{row[2]}</td><td>{row[3]}</td><td><StatusBadge status={row[4]} /></td><td>{row[5]}</td></tr>)}</tbody></table></div></Card></div>;
}
