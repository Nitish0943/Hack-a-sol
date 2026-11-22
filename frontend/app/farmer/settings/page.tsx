"use client";

import { Card, PageHeading } from "@/components/ui-kit";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function FarmerSettingsPage() {
  return <div><PageHeading title="Settings" description="Language, notifications and account preferences" /><div className="grid gap-5 lg:grid-cols-2"><Card><h3 className="font-bold">Language & notifications</h3><div className="mt-4 space-y-4"><label className="block text-sm font-semibold">Preferred language<LanguageSwitcher variant="select" /></label>{["Application updates","Payment updates","Scheme deadlines","Grievance updates"].map(item=><label key={item} className="flex items-center justify-between border-t border-slate-100 py-3 text-sm"><span>{item}</span><input type="checkbox" defaultChecked /></label>)}</div></Card><Card><h3 className="font-bold">Consent & privacy</h3><div className="mt-4 space-y-4 text-sm"><label className="flex gap-3"><input type="checkbox" defaultChecked /><span>Allow KrishiSetu to use my profile to recommend schemes.</span></label><label className="flex gap-3"><input type="checkbox" /><span>Allow SMS notifications for application updates.</span></label><div className="rounded-xl bg-slate-50 p-4 text-slate-500">KrishiSetu never requests banking passwords, UPI PINs or Aadhaar OTPs.</div><button className="w-full rounded-xl border border-red-200 py-3 font-semibold text-red-700">Log out</button></div></Card></div></div>;
}
