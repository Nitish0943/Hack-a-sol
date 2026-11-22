"use client";

import { useState } from "react";
import { Phone, RefreshCw, Sparkles, Volume2, VolumeX } from "lucide-react";
import { Card, PageHeading } from "@/components/ui-kit";
import { queryPolicyRAG } from "@/lib/api";

const KEY_ACTIONS: Record<string, { service: string; question: string; lang: string }> = {
  "1": {
    service: "Government scheme information (योजना जानकारी)",
    question: "पीएम किसान और फसल बीमा योजना के लाभ और पात्रता क्या है?",
    lang: "hi",
  },
  "2": {
    service: "Loan and subsidy information (ऋण और सब्सिडी)",
    question: "किसान क्रेडिट कार्ड (KCC) ब्याज अनुदान और ऋण नियम क्या हैं?",
    lang: "hi",
  },
  "3": {
    service: "Application status (आवेदन स्थिति)",
    question: "योजना आवेदन की जांच और सत्यापन प्रक्रिया क्या है?",
    lang: "hi",
  },
  "4": {
    service: "Payment status & eligibility (किस्त व पात्रता)",
    question: "पीएम किसान ₹6000 की किस्त मिलने की शर्तें क्या हैं?",
    lang: "hi",
  },
  "5": {
    service: "Register grievance (शिकायत निवारण)",
    question: "कृषि योजना में समस्या होने पर शिकायत प्रक्रिया क्या है?",
    lang: "hi",
  },
  "9": {
    service: "Repeat menu / सहायता (Chhattisgarhi)",
    question: "छत्तीसगढ़ किसान मन बर का का योजना अउ सहायता हे?",
    lang: "chg",
  },
};

export default function IvrPage() {
  const [key, setKey] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [ivrMessage, setIvrMessage] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  async function handleKeyPress(v: string) {
    setKey(v);

    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    const action = KEY_ACTIONS[v];
    if (!action) {
      setIvrMessage(`Key ${v} pressed. KrishiSetu IVR service ready. Please select 1, 2, 3, 4, 5, or 9.`);
      return;
    }

    setLoading(true);
    setIvrMessage("Connecting to KrishiSetu AI Voice Engine...");

    try {
      const res = await queryPolicyRAG({
        question: action.question,
        language: action.lang,
        response_style: "ivr",
      });

      const spokenText = res.ivr_summary || res.answer;
      setIvrMessage(spokenText);

      // Play audio automatically if browser permits
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(spokenText);
        utterance.rate = 0.95;
        utterance.lang = "hi-IN";
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      setIvrMessage(
        `[Demo Audio Mode]: ${action.service}. KrishiSetu provides official assistance for agricultural schemes and loans. Press 9 for help.`,
      );
    } finally {
      setLoading(false);
    }
  }

  function toggleSpeech() {
    if (!ivrMessage) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(ivrMessage);
      utterance.rate = 0.95;
      utterance.lang = "hi-IN";
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  }

  return (
    <div>
      <PageHeading
        title="IVR Support & Voice Assistant"
        description="Call assistance and simulated keypad preview powered by KrishiSetu AI RAG voice engine"
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        {/* Left Side: Instructions and Key Map */}
        <div className="space-y-5">
          <Card>
            <h3 className="font-bold text-slate-900">How to use KrishiSetu IVR</h3>
            <ol className="mt-4 space-y-3 text-sm text-slate-600">
              {[
                "Call the toll-free KrishiSetu number (1800-XXX-XXXX).",
                "Choose Hindi (1), English (2), or Chhattisgarhi (3).",
                "Complete the registered mobile OTP verification.",
                "Press a keypad number below to receive instant spoken policy guidance.",
              ].map((step, i) => (
                <li key={step} className="flex gap-3">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#EAF4EC] text-xs font-bold text-[#166534]">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>

            <div className="mt-6 table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Key</th>
                    <th>Interactive Service</th>
                    <th>Audio Response Mode</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["1", "Government scheme information", "PM-KISAN & PMFBY benefits"],
                    ["2", "Loan and subsidy information", "KCC concessional credit"],
                    ["3", "Application status & rules", "Verification guidelines"],
                    ["4", "Payment status & eligibility", "Installment rules"],
                    ["5", "Register grievance", "Resolution portal guidance"],
                    ["9", "Repeat menu / छत्तीसगढ़ी सहायता", "Chhattisgarhi assistance"],
                  ].map((row) => (
                    <tr
                      key={row[0]}
                      className="cursor-pointer hover:bg-green-50/50"
                      onClick={() => handleKeyPress(row[0])}
                    >
                      <td className="font-bold text-[#166534]">{row[0]}</td>
                      <td className="font-medium text-slate-800">{row[1]}</td>
                      <td className="text-xs text-slate-500">{row[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Spoken voice transcript box */}
          {ivrMessage && (
            <Card className="border-2 border-green-600/30 bg-emerald-50/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid size-7 place-items-center rounded-lg bg-emerald-100 text-emerald-800">
                    <Phone className="size-4" />
                  </span>
                  <h4 className="text-sm font-bold text-emerald-950">
                    {key ? `Key [${key}] Audio Broadcast` : "Voice Message"}
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={toggleSpeech}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-semibold ${
                    isSpeaking
                      ? "border-amber-300 bg-amber-50 text-amber-800"
                      : "border-emerald-300 bg-white text-emerald-800 hover:bg-emerald-50"
                  }`}
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="size-3.5 text-amber-600" /> Stop Audio
                    </>
                  ) : (
                    <>
                      <Volume2 className="size-3.5 text-emerald-700" /> Replay Voice
                    </>
                  )}
                </button>
              </div>

              <p className="mt-3 text-sm leading-6 font-medium text-emerald-950">
                {ivrMessage}
              </p>
            </Card>
          )}
        </div>

        {/* Right Side: Keypad Simulator */}
        <Card className="h-fit">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Simulated Phone Keypad</h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              <Sparkles className="size-3" /> Live RAG
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Press any number to hear the live AI voice response generated by the RAG backend.
          </p>

          <div className="mx-auto mt-6 grid max-w-52 grid-cols-3 gap-3">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map((v) => (
              <button
                key={v}
                onClick={() => handleKeyPress(v)}
                disabled={loading}
                className="grid aspect-square place-items-center rounded-2xl border border-slate-200 bg-white text-base font-bold text-slate-800 shadow-sm transition hover:border-green-500 hover:bg-green-50 hover:text-green-800 active:scale-95 disabled:opacity-50"
              >
                {v}
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-xl bg-slate-900 p-4 text-center text-xs text-white">
            {loading ? (
              <div className="flex items-center justify-center gap-2 text-emerald-400">
                <RefreshCw className="size-3.5 animate-spin" />
                <span>Generating voice answer...</span>
              </div>
            ) : key ? (
              <div>
                <p className="font-bold text-emerald-400">Option {key} Selected</p>
                <p className="mt-1 text-slate-400 line-clamp-2">
                  {KEY_ACTIONS[key]?.service || "Standard service request"}
                </p>
              </div>
            ) : (
              <div>
                <p className="font-bold text-slate-300">KrishiSetu IVR Simulator</p>
                <p className="mt-1 text-slate-400">Press 1–5 or 9 to test voice assistance</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
