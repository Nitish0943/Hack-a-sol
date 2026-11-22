"use client";

import { useState } from "react";
import { Volume2, Globe, ShieldCheck, Bell, Smartphone, Lock, Check } from "lucide-react";
import { Card, PageHeading } from "@/components/ui-kit";
import { useTranslation, Language } from "@/lib/i18n/context";

export default function SettingsPage() {
  const { language, setLanguage, t } = useTranslation();
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeading
        title={language === "hi" ? "प्राथमिकताएं एवं सेटिंग्स" : "Preferences & System Settings"}
        description={
          language === "hi"
            ? "भाषा, ध्वनि सहायता, अलर्ट माध्यम एवं डेटा गोपनीयता विकल्पों को प्रबंधित करें।"
            : "Manage interface language, voice readout preferences, notification channels, and privacy."
        }
      />

      {/* Language Section */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
          <Globe className="size-5 text-[#166534]" />
          <h3>{language === "hi" ? "भाषा प्राथमिकता" : "Language & Regional Dialect"}</h3>
        </div>
        <p className="text-xs text-slate-600">
          {language === "hi"
            ? "वह भाषा चुनें जिसमें आप पूरे पोर्टल और ऑडियो सहायता को सुनना व देखना चाहते हैं।"
            : "Choose your primary dialect for text display and regional voice synthesis."}
        </p>

        <div className="grid gap-3 sm:grid-cols-3 pt-2">
          {[
            { id: "hi", name: "हिन्दी (Hindi)", sub: "मानक देवनागरी" },
            { id: "cghi", name: "छत्तीसगढ़ी (Chhattisgarhi)", sub: "मातृभाषा बोली" },
            { id: "en", name: "English", sub: "Standard English" },
          ].map((l) => (
            <button
              key={l.id}
              onClick={() => setLanguage(l.id as Language)}
              className={`rounded-2xl border p-4 text-left transition ${
                language === l.id
                  ? "border-[#166534] bg-emerald-50/70 shadow-sm ring-2 ring-[#166534]/20"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <p className="text-sm font-bold text-slate-900">{l.name}</p>
              <p className="mt-1 text-xs text-slate-500">{l.sub}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* Voice Readout Section */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
          <Volume2 className="size-5 text-[#166534]" />
          <h3>{language === "hi" ? "ध्वनि एवं वाक् सहायता" : "Voice Assistance & Speech Output"}</h3>
        </div>
        <p className="text-xs text-slate-600">
          {language === "hi"
            ? "कृषि सेतु में सभी योजनाओं, पात्रता शर्तों और स्थिति का लाइव वाचन ब्राउज़र स्पीच तकनीक द्वारा समर्थित है।"
            : "All scheme conditions, benefit stages, and diagnostics support hands-free Web Speech API text-to-speech."}
        </p>
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-700">
          <p className="font-semibold text-slate-900">
            {language === "hi" ? "ध्वनि इंजन स्थिति:" : "Voice Synthesis Status:"}
          </p>
          <p className="mt-1">
            {typeof window !== "undefined" && "speechSynthesis" in window
              ? (language === "hi" ? "सक्रिय (ब्राउज़र स्पीच सक्षम)" : "Active (Browser Web Speech API Supported)")
              : "Not supported in this browser"}
          </p>
        </div>
      </Card>

      {/* Notification Preferences */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
          <Bell className="size-5 text-[#166534]" />
          <h3>{language === "hi" ? "अलर्ट एवं संदेश माध्यम" : "Direct Dispatch Channels"}</h3>
        </div>
        <div className="space-y-3 pt-1">
          <label className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-slate-50 cursor-pointer">
            <div className="flex items-center gap-3">
              <Smartphone className="size-5 text-slate-600" />
              <div>
                <p className="text-xs font-bold text-slate-800">
                  {language === "hi" ? "एसएमएस सूचनाएं (SMS Alerts)" : "Official SMS Notifications"}
                </p>
                <p className="text-[11px] text-slate-500">
                  {language === "hi" ? "डीबीटी क्रेडिट एवं पावती स्थिति के संदेश प्राप्त करें" : "Receive instant SMS upon DBT release or status update"}
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={smsAlerts}
              onChange={(e) => setSmsAlerts(e.target.checked)}
              className="size-4 accent-[#166534]"
            />
          </label>

          <label className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-slate-50 cursor-pointer">
            <div className="flex items-center gap-3">
              <Bell className="size-5 text-slate-600" />
              <div>
                <p className="text-xs font-bold text-slate-800">
                  {language === "hi" ? "व्हाट्सएप परामर्श (WhatsApp Advisories)" : "WhatsApp Agri Advisories"}
                </p>
                <p className="text-[11px] text-slate-500">
                  {language === "hi" ? "योजना में नीति परिवर्तन और समय सीमा की सूचनाएं" : "Receive policy revision radar and claim deadline notices"}
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={whatsappAlerts}
              onChange={(e) => setWhatsappAlerts(e.target.checked)}
              className="size-4 accent-[#166534]"
            />
          </label>
        </div>
      </Card>

      {/* Privacy and Security Architecture */}
      <Card className="p-6 space-y-3 border-l-4 border-l-[#166534] bg-emerald-50/20">
        <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
          <Lock className="size-4 text-[#166534]" />
          <h3>{language === "hi" ? "डेटा सुरक्षा एवं निजता प्रतिबद्धता" : "Data Privacy & Security Guarantee"}</h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          {language === "hi"
            ? "कृषि सेतु कभी भी आधार संख्या, बैंक पिन या संवेदनशील क्रेडेंशियल सादे पाठ (Plaintext) में एकत्र नहीं करता है। सभी रिकॉर्ड भारतीय कृषि डेटा मानकों (AgriStack) और राज्य राजस्व भुइयां सुरक्षा प्रोटोकॉल का अनुपालन करते हैं।"
            : "KrishiSetu strictly prohibits storage of unmasked Aadhaar numbers or financial PINs. Authentication adheres strictly to MeitY DigiLocker / AgriStack tokenized verification."}
        </p>
      </Card>

      <div className="flex justify-end gap-3 pt-2">
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-xl bg-[#166534] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#14532d]"
        >
          {saved ? <Check className="size-4" /> : null}
          {saved
            ? (language === "hi" ? "सफलतापूर्वक सहेजा गया!" : "Preferences Saved!")
            : (language === "hi" ? "प्राथमिकताएं सहेजें" : "Save Preferences")}
        </button>
      </div>
    </div>
  );
}
