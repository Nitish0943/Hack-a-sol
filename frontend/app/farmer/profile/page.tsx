"use client";

import { useState } from "react";
import { Card, PageHeading, StatusBadge } from "@/components/ui-kit";

export default function ProfilePage() {
  const [editing, setEditing] = useState(false);
  return (
    <div>
      <PageHeading title="My Profile" description="Manage personal, location and agricultural information" action={<button onClick={() => setEditing(!editing)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold">{editing ? "Cancel" : "Edit profile"}</button>} />
      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        <Card className="h-fit text-center">
          <span className="mx-auto grid size-20 place-items-center rounded-full bg-[#EAF4EC] text-2xl font-bold text-[#166534]">RK</span>
          <h3 className="mt-3 font-bold">Ramesh Kumar</h3><p className="text-xs text-slate-500">KS-CG-10482</p>
          <div className="mt-5 text-left"><div className="flex justify-between text-xs"><span>Profile completion</span><b>85%</b></div><div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-2 w-[85%] rounded-full bg-[#166534]" /></div></div>
          <div className="mt-4 border-t border-slate-100 pt-4 text-left"><p className="text-xs text-slate-500">Verification status</p><div className="mt-2"><StatusBadge status="Additional verification required" /></div></div>
        </Card>
        <Card>
          <form onSubmit={(event) => { event.preventDefault(); setEditing(false); }}>
            <div className="grid gap-6">
              <fieldset><legend className="mb-4 font-bold">Personal details</legend><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">Full name<input disabled={!editing} className="field mt-2" defaultValue="Ramesh Kumar" /></label><label className="text-sm font-semibold">Mobile number<input disabled={!editing} className="field mt-2" defaultValue="9876543210" /></label></div></fieldset>
              <fieldset className="border-t border-slate-100 pt-5"><legend className="mb-4 font-bold">Location</legend><div className="grid gap-4 sm:grid-cols-3">{[["State","Chhattisgarh"],["District","Raipur"],["Village","Khamtarai"]].map(([label,value]) => <label key={label} className="text-sm font-semibold">{label}<input disabled={!editing} className="field mt-2" defaultValue={value} /></label>)}</div></fieldset>
              <fieldset className="border-t border-slate-100 pt-5"><legend className="mb-4 font-bold">Agricultural details</legend><div className="grid gap-4 sm:grid-cols-2">{[["Cultivated area","2 acres"],["Crops","Paddy"],["Farming season","Kharif"],["Irrigation","Tube well"]].map(([label,value]) => <label key={label} className="text-sm font-semibold">{label}<input disabled={!editing} className="field mt-2" defaultValue={value} /></label>)}</div></fieldset>
              {editing && <button className="justify-self-end rounded-xl bg-[#166534] px-5 py-3 text-sm font-semibold text-white">Save changes</button>}
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
