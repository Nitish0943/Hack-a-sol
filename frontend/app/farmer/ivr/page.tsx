"use client";

import { useEffect, useState } from "react";
import { Phone, RefreshCw, Sparkles, Volume2, VolumeX } from "lucide-react";
import { Card, PageHeading } from "@/components/ui-kit";
import { queryPolicyRAG, voiceApi } from "@/lib/api";
import type { VoiceCall, VoiceEscalation, VoiceServiceStatus } from "@/types/api";

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
    question: "किसान क्रेडिट कार्ड (KCC) के लिए आवेदन प्रक्रिया क्या है?",
    lang: "hi",
  },
  "9": {
    service: "Chhattisgarhi policy question (browser simulator only)",
    question: "छत्तीसगढ़ किसान मन बर का का योजना अउ सहायता हे?",
    lang: "chg",
  },
};

export default function IvrPage() {
  const [key, setKey] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [ivrMessage, setIvrMessage] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [voiceStatus, setVoiceStatus] = useState<VoiceServiceStatus | null>(null);
  const [voiceStatusError, setVoiceStatusError] = useState<string | null>(null);
  const [calls, setCalls] = useState<VoiceCall[]>([]);
  const [escalations, setEscalations] = useState<VoiceEscalation[]>([]);
  const [historyError, setHistoryError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    voiceApi.status().then((status) => {
      if (active) setVoiceStatus(status);
    }).catch((error: unknown) => {
      if (active) setVoiceStatusError(error instanceof Error ? error.message : "Voice status is unavailable.");
    });
    voiceApi.calls().then((items) => {
      if (active) setCalls(items);
    }).catch(() => {
      if (active) setHistoryError("Sign in to view your private call history.");
    });
    voiceApi.myEscalations().then((items) => {
      if (active) setEscalations(items);
    }).catch(() => {
      if (active) setHistoryError("Sign in to view your call and escalation history.");
    });
    return () => {
      active = false;
    };
  }, []);

  async function handleKeyPress(v: string) {
    setKey(v);

    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    if (["4", "5", "6", "7"].includes(v)) {
      setIvrMessage(
        "Private application, payment, grievance, and callback actions are not available in this browser simulator. Live calls require SMS verification to be configured and a one-time code to be completed.",
      );
      return;
    }

    const action = KEY_ACTIONS[v];
    if (!action) {
      setIvrMessage(v === "0" ? "The browser keypad simulator has ended." : "Please select 1, 2, 3, or 9.");
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
    } catch (error: unknown) {
      setIvrMessage(
        error instanceof Error
          ? error.message
          : "The policy assistant is unavailable. No answer was generated.",
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
        description="Live Twilio phone service status, private call history, and a separate browser keypad simulator"
      />

      <div className="mb-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-bold text-slate-900">Live phone service</h3>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
              voiceStatus?.incoming_webhook_ready
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-800"
            }`}>
              {voiceStatus?.incoming_webhook_ready ? "Webhook configured" : "Not configured"}
            </span>
          </div>
          {voiceStatusError ? (
            <p className="mt-3 text-sm text-red-700">{voiceStatusError}</p>
          ) : voiceStatus?.incoming_webhook_ready ? (
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p>Twilio number: <strong>{voiceStatus.phone_number ?? "Set in Twilio Console"}</strong></p>
              <p>Phone languages: Hindi and English. Regional-language speech is not enabled.</p>
              <p>{voiceStatus.private_verification_ready
                ? "Private actions require a one-time code sent to the registered mobile."
                : "Private account actions are currently disabled because SMS verification is not configured."}</p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-600">
              Live phone calls are unavailable until Twilio credentials and a public HTTPS webhook are configured.
              The keypad below is only a browser simulator and does not place calls.
            </p>
          )}
        </Card>
        <Card>
          <h3 className="font-bold text-slate-900">Your recent calls and requests</h3>
          {historyError ? (
            <p className="mt-3 text-sm text-slate-600">{historyError}</p>
          ) : calls.length === 0 && escalations.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No voice call or escalation records are available.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {calls.slice(0, 3).map((call) => (
                <li key={call.call_sid} className="flex justify-between gap-3">
                  <span>{new Date(call.started_at).toLocaleString()} · {call.language.toUpperCase()}</span>
                  <span>{call.duration_seconds == null ? call.call_status : `${call.duration_seconds}s`}</span>
                </li>
              ))}
              {escalations.slice(0, 2).map((item) => (
                <li key={item.id} className="flex justify-between gap-3">
                  <span>{item.reason.replaceAll("_", " ")}</span>
                  <span className="capitalize">{item.status}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-xs text-slate-400">Call recordings and raw speech transcripts are not retained.</p>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        {/* Left Side: Instructions and Key Map */}
        <div className="space-y-5">
          <Card>
            <h3 className="font-bold text-slate-900">How to use KrishiSetu IVR</h3>
            <ol className="mt-4 space-y-3 text-sm text-slate-600">
              {[
                voiceStatus?.phone_number
                  ? `Call the configured KrishiSetu number: ${voiceStatus.phone_number}.`
                  : "A public Twilio phone number must be configured before real telephone calls work.",
                "Choose Hindi (1) or English (2). Chhattisgarhi speech is not available on the phone line.",
                "Private account requests require a one-time code sent to the registered mobile.",
                "Use the keypad below to test policy audio in this browser; it does not place a phone call.",
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
                    ["1", "Government scheme information", "Verified-source policy answers"],
                    ["2", "Eligibility information", "Verified-source policy answers"],
                    ["3", "Loan and subsidy information", "Verified-source policy answers"],
                    ["4", "Application status", "Live call · SMS OTP required"],
                    ["5", "Benefit and payment records", "Live call · SMS OTP required"],
                    ["6", "Register a grievance", "Live call · SMS OTP + confirmation"],
                    ["7", "Request an officer callback", "Live call · SMS OTP + confirmation"],
                    ["9", "Repeat menu (live) / Chhattisgarhi query (browser)", "Phone and simulator differ"],
                    ["0", "End call", "Live call or end browser simulator"],
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
            <Sparkles className="size-3" /> Browser simulator
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Press 1–3 or 9 for browser speech output. Private account actions are not simulated.
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
                  {KEY_ACTIONS[key]?.service ||
                    (["4", "5", "6", "7"].includes(key)
                      ? "Live-only private action; unavailable in simulator"
                      : key === "0" ? "End browser simulator" : "No simulator action")}
                </p>
              </div>
            ) : (
              <div>
                <p className="font-bold text-slate-300">KrishiSetu IVR Simulator</p>
                <p className="mt-1 text-slate-400">Press 1–3 or 9 to test policy audio</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
