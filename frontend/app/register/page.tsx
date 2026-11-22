"use client";

import Link from "next/link";
import { ArrowLeft, Sprout } from "lucide-react";
import { useRouter } from "next/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function RegisterPage() {
  const router = useRouter();
  return (
    <main className="min-h-screen bg-[#F8FAF5] px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#166534] text-white"><Sprout className="size-5" /></span><span className="font-bold">KrishiSetu</span></Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link href="/login" className="inline-flex items-center gap-2 text-sm text-slate-500"><ArrowLeft className="size-4" /> Already registered</Link>
          </div>
        </div>
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-7"><p className="text-xs font-bold uppercase tracking-wider text-[#166534]">Farmer registration</p><h1 className="mt-2 text-3xl font-bold">Create your farmer profile</h1><p className="mt-2 text-sm text-slate-500">Fields marked * are required. This demo does not collect real banking information.</p></div>
          <form onSubmit={(event) => { event.preventDefault(); router.push("/farmer/dashboard"); }}>
            <div className="space-y-8">
              <fieldset><legend className="mb-4 font-bold">Personal information</legend><div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold">Full name *<input className="field mt-2" required defaultValue="Ramesh Kumar" /></label>
                <label className="text-sm font-semibold">Mobile number *<input className="field mt-2" required type="tel" defaultValue="9876543210" /></label>
                <label className="text-sm font-semibold">Date of birth<input className="field mt-2" type="date" /></label>
                <label className="text-sm font-semibold">Gender<select className="field mt-2"><option>Male</option><option>Female</option><option>Other</option></select></label>
                <label className="text-sm font-semibold sm:col-span-2">Preferred language *<select className="field mt-2"><option>Hindi</option><option>English</option><option>छत्तीसगढ़ी</option></select></label>
              </div></fieldset>
              <fieldset className="border-t border-slate-100 pt-6"><legend className="mb-4 font-bold">Location information</legend><div className="grid gap-4 sm:grid-cols-2">
                {["State","District","Block","Village","PIN code"].map((label) => <label key={label} className="text-sm font-semibold">{label}{label === "State" ? " *" : ""}{label === "Village" ? " *" : ""}<input className="field mt-2" required={label === "State" || label === "District" || label === "Block" || label === "Village"} defaultValue={label === "State" ? "Chhattisgarh" : label === "District" ? "Raipur" : label === "Block" ? "Arang" : label === "Village" ? "Khamtarai" : ""} placeholder={`Enter ${label.toLowerCase()}`} /></label>)}
              </div></fieldset>
              <fieldset className="border-t border-slate-100 pt-6"><legend className="mb-4 font-bold">Farmer information</legend><div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold">Farmer category *<select className="field mt-2" required><option>Small & marginal farmer</option><option>Other farmer</option></select></label>
                <label className="text-sm font-semibold">Cultivator status *<select className="field mt-2" required><option>Landowner</option><option>Tenant farmer</option><option>Sharecropper</option><option>Joint landholder</option><option>Land mutation pending</option><option>Other</option></select></label>
                <label className="text-sm font-semibold">KrishiSetu / existing Farmer ID<input className="field mt-2" placeholder="Optional" /></label>
                <label className="text-sm font-semibold">Landholding area (acres) *<input className="field mt-2" required type="number" step="0.1" defaultValue="2" /></label>
              </div></fieldset>
            </div>
            <div className="mt-8 flex justify-end"><button type="submit" className="w-full rounded-xl bg-[#166534] px-6 py-3 font-semibold text-white sm:w-auto">Create farmer profile</button></div>
          </form>
        </section>
      </div>
    </main>
  );
}
