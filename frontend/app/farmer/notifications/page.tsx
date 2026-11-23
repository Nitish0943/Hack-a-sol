"use client";

import { useState } from "react";
import { Bell, Check } from "lucide-react";
import { Card, PageHeading } from "@/components/ui-kit";

export default function NotificationsPage() {
  const [read,setRead]=useState<string[]>([]);
  const items=[
    ["n1","Discrepancy requires review","Your PM-KISAN sanction record differs from the estimate.","20 min ago"],
    ["n2","Document reminder","Upload cultivation evidence for your KCC application.","2 hours ago"],
    ["n3","Grievance update","Officer assigned to GRV-CG-10482.","Yesterday"],
  ];
  return <div><PageHeading title="Notifications" description="Account and benefit updates" action={<button onClick={()=>setRead(items.map(i=>i[0]))} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold"><Check className="size-4" /> Mark all read</button>} /><Card><div className="divide-y divide-slate-100">{items.map(([id,title,text,time])=><button key={id} onClick={()=>setRead(v=>[...v,id])} className="flex w-full gap-4 py-4 text-left"><span className={`mt-1 grid size-9 shrink-0 place-items-center rounded-xl ${read.includes(id)? "bg-slate-100 text-slate-400":"bg-green-50 text-[#166534]"}`}><Bell className="size-4" /></span><div><p className="font-semibold">{title}</p><p className="mt-1 text-sm text-slate-500">{text}</p></div><span className="ml-auto shrink-0 text-xs text-slate-400">{time}</span></button>)}</div></Card></div>;
}
