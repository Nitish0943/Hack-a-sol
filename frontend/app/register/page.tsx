"use client";

import Link from "next/link";
import { ArrowLeft, Sprout } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authApi } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function submitRegistration(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    const form = new FormData(event.currentTarget);
    const mobileNumber = String(form.get("mobileNumber") || "");
    const otp = String(form.get("otp") || "");
    try {
      await authApi.sendOtp(mobileNumber);
      const registered = await authApi.register({
        mobileNumber,
        otp,
        fullName: String(form.get("fullName")),
        preferredLanguage: String(form.get("preferredLanguage")),
        state: String(form.get("state")),
        district: String(form.get("district")),
        block: String(form.get("block")),
        village: String(form.get("village")),
        pincode: String(form.get("pincode") || "") || undefined,
        farmerCategory: String(form.get("farmerCategory")),
        cultivatorStatus: String(form.get("cultivatorStatus")),
        landholdingArea: Number(form.get("landholdingArea")),
      });
      setSuccess(`Farmer registered: ${registered.farmer.farmer_id}`);
      router.push("/farmer/dashboard");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F8FAF5] px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#166534] text-white"><Sprout className="size-5" /></span><span className="font-bold">KrishiSetu</span></Link>
          <Link href="/login" className="inline-flex items-center gap-2 text-sm text-slate-500"><ArrowLeft className="size-4" /> Already registered</Link>
        </div>
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-7">
            <p className="text-xs font-bold uppercase tracking-wider text-[#166534]">Farmer registration</p>
            <h1 className="mt-2 text-3xl font-bold">Create your farmer profile</h1>
            <p className="mt-2 text-sm text-slate-500">Fields marked * are required. This demo does not collect real banking information.</p>
          </div>
          <form onSubmit={submitRegistration}>
            <div className="space-y-8">
              <fieldset>
                <legend className="mb-4 font-bold">Personal information</legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-semibold">Full name *<input name="fullName" className="field mt-2" required defaultValue="Ramesh Kumar" /></label>
                  <label className="text-sm font-semibold">Mobile number *<input name="mobileNumber" className="field mt-2" required type="tel" defaultValue="9876501234" /></label>
                  <label className="text-sm font-semibold">Demo OTP *<input name="otp" className="field mt-2" required inputMode="numeric" defaultValue="123456" /></label>
                  <label className="text-sm font-semibold">Preferred language *<select name="preferredLanguage" className="field mt-2"><option>Hindi</option><option>English</option></select></label>
                </div>
              </fieldset>
              <fieldset className="border-t border-slate-100 pt-6">
                <legend className="mb-4 font-bold">Location information</legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    ["State", "state", "Chhattisgarh"],
                    ["District", "district", "Raipur"],
                    ["Block", "block", "Arang"],
                    ["Village", "village", "Khamtarai"],
                    ["PIN code", "pincode", ""],
                  ].map(([label, name, value]) => (
                    <label key={name} className="text-sm font-semibold">
                      {label}{name !== "pincode" ? " *" : ""}
                      <input name={name} className="field mt-2" required={name !== "pincode"} defaultValue={value} placeholder={`Enter ${label.toLowerCase()}`} />
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset className="border-t border-slate-100 pt-6">
                <legend className="mb-4 font-bold">Farmer information</legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-semibold">Farmer category *<select name="farmerCategory" className="field mt-2" required><option>Small &amp; marginal farmer</option><option>Other farmer</option></select></label>
                  <label className="text-sm font-semibold">Cultivator status *<select name="cultivatorStatus" className="field mt-2" required><option>Landowner</option><option>Tenant farmer</option><option>Sharecropper</option><option>Joint landholder</option><option>Land mutation pending</option><option>Other</option></select></label>
                  <label className="text-sm font-semibold">KrishiSetu / existing Farmer ID<input className="field mt-2" placeholder="Optional" /></label>
                  <label className="text-sm font-semibold">Landholding area (acres) *<input name="landholdingArea" className="field mt-2" required type="number" step="0.1" defaultValue="2" /></label>
                </div>
              </fieldset>
            </div>
            {error && <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            {success && <p className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p>}
            <div className="mt-8 flex justify-end">
              <button disabled={loading} type="submit" className="w-full rounded-xl bg-[#166534] px-6 py-3 font-semibold text-white disabled:opacity-60 sm:w-auto">{loading ? "Creating profile..." : "Create farmer profile"}</button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
