"use client";

import {
  CheckCircle2,
  Phone,
  PhoneCall,
  PhoneOff,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import React, { useState } from "react";
import { Card, PageHeading } from "@/components/ui-kit";
import { useTranslation } from "@/lib/i18n/context";
import { processIvrKey } from "@/lib/api";

export default function IvrPage() {
  const { t, locale, speak, stopSpeaking, isSpeaking } = useTranslation();

  const [callActive, setCallActive] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<string>(
    "कृषि सेतु टेलीफोन सेवा में आपका स्वागत है। कॉल शुरू करने के लिए नीचे 'Start Demo Call' बटन दबाएं।"
  );
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Play audio beep for DTMF keypress
  const playBeep = () => {
    try {
      if (typeof window !== "undefined" && "AudioContext" in window) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = 697; // DTMF low frequency
        gain.gain.value = 0.1;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        setTimeout(() => {
          osc.stop();
          ctx.close();
        }, 120);
      }
    } catch {
      // ignore
    }
  };

  const handleStartCall = async () => {
    setCallActive(true);
    setLoading(true);
    const initialText =
      locale === "cghi"
        ? "कृषि सेतु फोन सेवा म आप सबो के स्वागत हे। सरकारी योजना जाने बर 1 दबाओ। कर्जा अऊ सब्सिडी बर 2 दबाओ। अर्जी के हाल बर 3 दबाओ। पईसा के हाल बर 4 दबाओ। शिकायत करे बर 5 दबाओ। फेर सुने बर 9 दबाओ।"
        : locale === "hi"
          ? "कृषि सेतु टेलीफोन सहायता में आपका स्वागत है। सरकारी योजनाओं की जानकारी के लिए 1 दबाएं। ऋण और सब्सिडी के लिए 2 दबाएं। आवेदन की स्थिति के लिए 3 दबाएं। भुगतान जानकारी के लिए 4 दबाएं। शिकायत दर्ज करने के लिए 5 दबाएं। मेनू दोहराने के लिए 9 दबाएं।"
          : "Welcome to KrishiSetu telephone assistance. Press 1 for Scheme Info, 2 for Loan & Subsidy, 3 for Application Status, 4 for Payment Records, 5 to Register Grievance, 9 to Repeat Menu.";

    setCurrentPrompt(initialText);
    setLoading(false);
    speak(initialText);
  };

  const handleHangup = () => {
    setCallActive(false);
    setSelectedKey(null);
    stopSpeaking();
    setCurrentPrompt("कॉल समाप्त हो गई है। दोबारा शुरू करने के लिए 'Start Demo Call' दबाएं।");
  };

  const handleKeyPress = async (key: string) => {
    playBeep();
    setSelectedKey(key);
    if (!callActive) {
      setCallActive(true);
    }
    setLoading(true);

    try {
      const res = await processIvrKey(key, locale, "9876543210");
      setCurrentPrompt(res.text);
      speak(res.text);
      if (res.action === "HANGUP") {
        setTimeout(() => setCallActive(false), 5000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const menuRows = [
    { key: "1", service: "Government Scheme Information", service_hi: "सरकारी योजनाओं की जानकारी", detail: "PM-KISAN, RGKNY, KCC, PMFBY eligibility" },
    { key: "2", service: "Loan & Subsidy Calculation", service_hi: "ऋण और सब्सिडी गणना", detail: "KCC scale of finance, equipment subsidy rate" },
    { key: "3", service: "Application Status Tracking", service_hi: "आवेदन की वर्तमान स्थिति", detail: "Real-time status of recorded applications" },
    { key: "4", service: "Payment & Disbursement Status", service_hi: "भुगतान और बैंक जमा स्थिति", detail: "Latest PFMS installment credits & alerts" },
    { key: "5", service: "Register Grievance via Voice", service_hi: "शिकायत दर्ज करें / कॉल बैक", detail: "Logs ticket and schedules officer call-back" },
    { key: "9", service: "Repeat Main Voice Menu", service_hi: "मुख्य मेनू दोबारा सुनें", detail: "Replays current options in selected language" },
  ];

  return (
    <div className="space-y-6">
      <PageHeading
        title={t("ivr.title")}
        description={t("ivr.sub")}
        action={
          <span className="rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-3.5 py-1 text-xs font-black flex items-center gap-1.5 shadow-2xs">
            <PhoneCall className="size-3.5 text-amber-700" /> Toll-Free Simulator: 1800-890-SETU
          </span>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Left Column: Menu Guide and Accessibility Specifications */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Phone className="size-5 text-emerald-700" />
                  DTMF Interactive Keypad Menu Structure
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Queries the exact same backend and database records as the farmer web portal.
                </p>
              </div>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th className="w-16 text-center">Key</th>
                    <th>Service (सेवा)</th>
                    <th>System Capability</th>
                  </tr>
                </thead>
                <tbody>
                  {menuRows.map((row) => (
                    <tr
                      key={row.key}
                      onClick={() => handleKeyPress(row.key)}
                      className="cursor-pointer hover:bg-emerald-50/50 transition"
                    >
                      <td className="text-center font-mono font-black text-base text-emerald-800">
                        <span className="inline-grid size-8 place-items-center rounded-xl bg-emerald-100/80 border border-emerald-300/80">
                          {row.key}
                        </span>
                      </td>
                      <td>
                        <p className="font-bold text-slate-900">
                          {locale === "hi" || locale === "cghi" ? row.service_hi : row.service}
                        </p>
                        <p className="text-[11px] text-slate-500">{row.service}</p>
                      </td>
                      <td className="text-xs text-slate-600 font-medium">{row.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Telephony Architecture Information Card */}
          <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-900 font-black text-sm">
              <ShieldCheck className="size-5 text-emerald-700" /> Unified Backend Telephony Architecture
            </div>
            <p className="text-xs text-emerald-950/80 font-medium leading-relaxed">
              In production, KrishiSetu connects via an Exotel / Twilio voice gateway. The farmer dials <strong>1800-890-SETU</strong> from any feature phone. The caller ID maps to their unique Farmer ID (KS-CG-10482), retrieving verified ledger data without requiring smartphone logins or app downloads.
            </p>
          </div>
        </div>

        {/* Right Column: Realistic Phone Dialpad Mockup */}
        <div>
          <div className="relative mx-auto w-full max-w-xs rounded-[40px] border-4 border-slate-800 bg-slate-950 p-5 shadow-2xl text-white">
            {/* Phone Speaker Notch */}
            <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-slate-700" />

            {/* Simulated Call Screen */}
            <div className="rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 p-4 border border-slate-800 text-center space-y-2">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>1800-890-SETU</span>
                <span className={`flex items-center gap-1 font-bold ${callActive ? "text-emerald-400" : "text-slate-500"}`}>
                  <span className={`size-2 rounded-full ${callActive ? "bg-emerald-500 animate-pulse" : "bg-slate-600"}`} />
                  {callActive ? "CALL ACTIVE" : "STANDBY"}
                </span>
              </div>

              <p className="text-xs font-black text-amber-300">KrishiSetu Voice Gateway</p>
              <p className="text-[11px] text-slate-300 font-medium line-clamp-3 min-h-12 bg-slate-900/90 rounded-lg p-2 border border-slate-800">
                {currentPrompt}
              </p>

              {isSpeaking && (
                <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-400 animate-pulse">
                  <Volume2 className="size-3" /> Voice Synthesizer Playing...
                </div>
              )}
            </div>

            {/* DTMF Keypad Grid */}
            <div className="my-5 grid grid-cols-3 gap-3 px-2">
              {[
                { k: "1", sub: "" },
                { k: "2", sub: "ABC" },
                { k: "3", sub: "DEF" },
                { k: "4", sub: "GHI" },
                { k: "5", sub: "JKL" },
                { k: "6", sub: "MNO" },
                { k: "7", sub: "PQRS" },
                { k: "8", sub: "TUV" },
                { k: "9", sub: "WXYZ" },
                { k: "*", sub: "" },
                { k: "0", sub: "+" },
                { k: "#", sub: "" },
              ].map((btn) => (
                <button
                  key={btn.k}
                  onClick={() => handleKeyPress(btn.k)}
                  className={`flex aspect-square flex-col items-center justify-center rounded-full border transition-all cursor-pointer ${
                    selectedKey === btn.k
                      ? "border-emerald-400 bg-emerald-800 text-white shadow-lg scale-95"
                      : "border-slate-800 bg-slate-900/90 hover:bg-slate-800 text-white hover:border-slate-700"
                  }`}
                >
                  <span className="text-xl font-bold font-mono leading-none">{btn.k}</span>
                  {btn.sub && <span className="text-[8px] text-slate-400 tracking-widest">{btn.sub}</span>}
                </button>
              ))}
            </div>

            {/* Call Control Buttons */}
            <div className="flex items-center justify-center gap-4 pt-1 pb-2">
              {!callActive ? (
                <button
                  onClick={handleStartCall}
                  className="flex items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-500 px-6 py-3 font-black text-xs text-white shadow-lg shadow-emerald-900/40 transition cursor-pointer"
                >
                  <Phone className="size-4" /> Start Demo Call
                </button>
              ) : (
                <button
                  onClick={handleHangup}
                  className="flex items-center gap-2 rounded-full bg-red-600 hover:bg-red-500 px-6 py-3 font-black text-xs text-white shadow-lg shadow-red-900/40 transition cursor-pointer"
                >
                  <PhoneOff className="size-4" /> End Call
                </button>
              )}
            </div>

            {/* Phone Home Bar */}
            <div className="mx-auto mt-3 h-1 w-24 rounded-full bg-slate-700" />
          </div>
        </div>
      </div>
    </div>
  );
}
