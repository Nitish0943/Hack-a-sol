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
import { Card, PageHeading, VoiceAssistButton } from "@/components/ui-kit";
import { useTranslation } from "@/lib/i18n/context";
import { processIvrKey } from "@/lib/api";

export default function IvrPage() {
  const { t, locale, speak, stopSpeaking, isSpeaking, language } = useTranslation();

  const [callActive, setCallActive] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<string>(
    "कृषि सेतु टेलीफोन सेवा में आपका स्वागत है। कॉल शुरू करने के लिए नीचे 'Start Demo Call' बटन दबाएं।"
  );
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
        description={
          language === "hi"
            ? "बिना इंटरनेट या स्मार्टफोन के साधारण कीपैड मोबाइल फोन से डीटीएमएफ नंबर दबाकर जानकारी प्राप्त करें।"
            : "Accessible telephone DTMF keypad interface for rural farmers with zero internet connectivity or basic keypad phones."
        }
        action={
          <span className="rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3.5 py-1 text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm">
            <PhoneCall className="size-3.5 text-amber-400" /> Toll-Free Simulator: 1800-890-SETU
          </span>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Left Column: Menu Structure */}
        <div className="space-y-6">
          <div className="glass-panel p-6 space-y-4 border border-white/10">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2 font-display">
                  <Phone className="size-5 text-emerald-400" />
                  DTMF Interactive Keypad Menu Structure
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Connected directly to the deterministic rules engine and benefit ledger.
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
                      className="cursor-pointer hover:bg-white/[0.04] transition"
                    >
                      <td className="text-center font-mono font-extrabold text-base text-emerald-400">
                        <span className="inline-grid size-8 place-items-center rounded-xl bg-emerald-500/15 border border-emerald-500/30">
                          {row.key}
                        </span>
                      </td>
                      <td>
                        <p className="font-bold text-white">
                          {locale === "hi" || locale === "cghi" ? row.service_hi : row.service}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono">{row.service}</p>
                      </td>
                      <td className="text-xs text-slate-300">{row.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Tactile Liquid Glass Phone Simulator */}
        <div className="space-y-4">
          <div className="glass-panel p-6 border border-white/20 shadow-2xl relative overflow-hidden rounded-3xl">
            {/* Phone Screen Display */}
            <div className="rounded-2xl border border-white/15 bg-black/60 p-4 space-y-3 backdrop-blur-xl">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-white/10 pb-2">
                <span>1800-890-SETU</span>
                <span className={callActive ? "text-emerald-400 font-bold flex items-center gap-1" : "text-slate-500"}>
                  {callActive && <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />}
                  {callActive ? "CALL IN PROGRESS" : "STANDBY"}
                </span>
              </div>

              {/* Dynamic Telephony Prompt Text */}
              <div className="min-h-[110px] text-xs leading-relaxed text-slate-200">
                {currentPrompt}
              </div>

              {isSpeaking && (
                <div className="flex items-center justify-center gap-1 py-1">
                  {[40, 70, 100, 60, 90, 50, 80].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 bg-emerald-400 rounded-full animate-pulse"
                      style={{ height: `${h * 0.18}px`, animationDelay: `${i * 120}ms` }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Keypad Dial Grid (1-9, *, 0, #) */}
            <div className="grid grid-cols-3 gap-3 pt-5">
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
                  className={`flex flex-col items-center justify-center py-3 rounded-2xl border transition-all cursor-pointer ${
                    selectedKey === btn.k
                      ? "border-emerald-400 bg-emerald-500/30 text-white scale-95 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                      : "border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/10 hover:border-white/25 active:scale-95"
                  }`}
                >
                  <span className="text-xl font-bold font-mono leading-none">{btn.k}</span>
                  {btn.sub && <span className="text-[9px] text-slate-400 font-mono mt-1">{btn.sub}</span>}
                </button>
              ))}
            </div>

            {/* Call / End Call Buttons */}
            <div className="pt-5 flex gap-3">
              {!callActive ? (
                <button
                  onClick={handleStartCall}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 transition cursor-pointer"
                >
                  <PhoneCall className="size-4" />
                  <span>Start Demo Call</span>
                </button>
              ) : (
                <button
                  onClick={handleHangup}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-500/25 transition cursor-pointer"
                >
                  <PhoneOff className="size-4" />
                  <span>End Call</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
