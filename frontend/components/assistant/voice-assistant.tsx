"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Compass,
  ExternalLink,
  History,
  Languages,
  Mic,
  MicOff,
  Navigation,
  RefreshCw,
  Send,
  Sparkles,
  Square,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { assistantApi, type AssistantResponse } from "@/lib/api";
import { executeSafeNavigation } from "./action-executor";
import { VoiceWaveform } from "./voice-waveform";

type AssistantState =
  | "IDLE"
  | "LISTENING"
  | "TRANSCRIBING"
  | "PROCESSING"
  | "EXECUTING_ACTION"
  | "SPEAKING"
  | "ERROR";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  spokenText?: string;
  intent?: string;
  action?: string;
  navigation?: { targetRoute: string; description: string };
  applicationChannel?: AssistantResponse["applicationChannel"];
  cards?: Array<Record<string, unknown>>;
  timestamp: Date;
}

export function GlobalVoiceAssistant() {
  const router = useRouter();
  const pathname = usePathname();

  // Assistant & Window States
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<AssistantState>("IDLE");
  const [language, setLanguage] = useState<"hi" | "en">("hi");
  const [userRole, setUserRole] = useState("farmer");

  // Conversation & Input States
  const [textInput, setTextInput] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([
    "Which agricultural loans can I apply for?",
    "Where can I apply for KCC?",
    "Open my profile",
    "Show my applications",
  ]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>("");

  // Refs
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Initialize Speech APIs & User Session on Mount
  useEffect(() => {
    // Generate persistent session id for this browser session
    const storedSid = sessionStorage.getItem("krishisetu_voice_sid") || `vsess-${Date.now()}`;
    sessionStorage.setItem("krishisetu_voice_sid", storedSid);
    setSessionId(storedSid);

    // Read user role from localStorage
    try {
      const storedUser = localStorage.getItem("krishisetu_user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed.role) setUserRole(parsed.role);
      }
    } catch {
      // Default to farmer
    }

    // Initialize TTS reference
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // cleanup
        }
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Auto-scroll chat to latest message
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, interimTranscript, state]);

  // Stop active speech synthesis
  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setState((prev) => (prev === "SPEAKING" ? "IDLE" : prev));
  }, []);

  // Speak text using Web Speech API TTS
  const speakResponse = useCallback(
    (textToSpeak: string, langCode: string = "hi") => {
      if (!synthRef.current) return;

      stopSpeaking();

      // Clean markdown tags for natural speech readout
      const cleanText = textToSpeak
        .replace(/[*#_`~>]/g, "")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      currentUtteranceRef.current = utterance;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Select voice matching language
      const voices = synthRef.current.getVoices();
      if (langCode === "hi") {
        utterance.lang = "hi-IN";
        const hiVoice = voices.find((v) => v.lang.startsWith("hi"));
        if (hiVoice) utterance.voice = hiVoice;
      } else {
        utterance.lang = "en-IN";
        const enVoice = voices.find((v) => v.lang.startsWith("en-IN") || v.lang.startsWith("en"));
        if (enVoice) utterance.voice = enVoice;
      }

      utterance.onstart = () => {
        setState("SPEAKING");
      };

      utterance.onend = () => {
        setState("IDLE");
      };

      utterance.onerror = () => {
        setState("IDLE");
      };

      synthRef.current.speak(utterance);
    },
    [stopSpeaking],
  );

  // Send command to backend assistant
  const handleSendCommand = useCallback(
    async (commandText: string) => {
      if (!commandText.trim()) return;

      stopSpeaking();
      setState("PROCESSING");
      setErrorMessage(null);

      // Add user message to thread
      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}-user`,
        sender: "user",
        text: commandText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setTextInput("");
      setInterimTranscript("");

      try {
        const response: AssistantResponse = await assistantApi.sendCommand({
          message: commandText,
          sessionId: sessionId,
          currentRoute: pathname,
          language: language,
        });

        // Add assistant response to thread
        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now()}-assistant`,
          sender: "assistant",
          text: response.text,
          spokenText: response.spokenText,
          intent: response.intent,
          action: response.action,
          navigation: response.navigation,
          applicationChannel: response.applicationChannel,
          cards: response.cards,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMsg]);

        if (response.followUpSuggestions && response.followUpSuggestions.length > 0) {
          setSuggestions(response.followUpSuggestions);
        }

        // Execute Navigation if intent is navigation
        if (response.intent === "navigation" && response.navigation?.targetRoute) {
          setState("EXECUTING_ACTION");
          executeSafeNavigation(response.navigation, userRole, (route) => {
            router.push(route);
          });
        }

        // Speak response aloud
        if (response.spokenText) {
          speakResponse(response.spokenText, language);
        } else {
          setState("IDLE");
        }
      } catch (err) {
        setState("ERROR");
        const errMsg = err instanceof Error ? err.message : "Voice command could not be processed.";
        setErrorMessage(errMsg);
      }
    },
    [language, pathname, router, sessionId, speakResponse, stopSpeaking, userRole],
  );

  // Speech Recognition (Speech-to-Text) Lifecycle
  const startListening = useCallback(() => {
    stopSpeaking();
    setErrorMessage(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage(
        "Speech recognition is not supported in this browser. Please use text input or Chrome/Edge.",
      );
      setState("ERROR");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === "hi" ? "hi-IN" : "en-IN";

      recognition.onstart = () => {
        setState("LISTENING");
        setInterimTranscript("");
      };

      recognition.onresult = (event: any) => {
        let finalStr = "";
        let interimStr = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalStr += item[0].transcript;
          } else {
            interimStr += item[0].transcript;
          }
        }

        if (interimStr) {
          setInterimTranscript(interimStr);
          setState("TRANSCRIBING");
        }

        if (finalStr) {
          setInterimTranscript(finalStr);
          recognition.stop();
          handleSendCommand(finalStr);
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === "no-speech") {
          setState("IDLE");
          return;
        }
        if (event.error === "not-allowed") {
          setErrorMessage(
            "Microphone access blocked. Please enable microphone permissions in your browser settings.",
          );
        } else {
          setErrorMessage(`Speech recognition error: ${event.error}`);
        }
        setState("ERROR");
      };

      recognition.onend = () => {
        if (state === "LISTENING" || state === "TRANSCRIBING") {
          setState("IDLE");
        }
      };

      recognition.start();
    } catch (exc) {
      setErrorMessage("Could not start speech recognition.");
      setState("ERROR");
    }
  }, [handleSendCommand, language, state, stopSpeaking]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // cleanup
      }
    }
    setState("IDLE");
  }, []);

  // Mic toggle handler
  const handleMicClick = () => {
    if (!isOpen) {
      setIsOpen(true);
      startListening();
      return;
    }

    if (state === "LISTENING" || state === "TRANSCRIBING") {
      stopListening();
    } else if (state === "SPEAKING") {
      stopSpeaking();
    } else {
      startListening();
    }
  };

  return (
    <>
      {/* 1. FLOATING CIRCULAR MICROPHONE BUTTON (BOTTOM-RIGHT) */}
      <aside
        aria-label="KrishiSetu AI Voice Assistant"
        className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 max-sm:bottom-20 max-sm:right-4"
      >
        {/* Subtle Idle Pill when closed */}
        {!isOpen && (
          <div className="glass flex items-center gap-2 rounded-full py-1.5 px-3.5 text-xs font-bold text-slate-800 dark:text-slate-100 shadow-md border border-emerald-500/30 animate-pulse">
            <Sparkles className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>AI Voice Command</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            if (!isOpen) {
              setIsOpen(true);
              startListening();
            } else {
              handleMicClick();
            }
          }}
          title={isOpen ? "Voice Assistant Active" : "Open KrishiSetu AI Voice Assistant"}
          aria-label="Open KrishiSetu AI Voice Assistant"
          className={`relative grid size-14 place-items-center rounded-full text-white shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 ${
            state === "LISTENING"
              ? "bg-red-600 ring-8 ring-red-400/40 animate-pulse"
              : state === "PROCESSING" || state === "EXECUTING_ACTION"
              ? "bg-amber-600 ring-8 ring-amber-400/40"
              : state === "SPEAKING"
              ? "bg-emerald-600 ring-8 ring-emerald-400/40"
              : "bg-[#166534] hover:bg-emerald-700 ring-4 ring-emerald-600/30"
          }`}
        >
          {state === "LISTENING" ? (
            <Mic className="size-7 animate-bounce" />
          ) : state === "SPEAKING" ? (
            <Volume2 className="size-7 animate-pulse" />
          ) : state === "PROCESSING" || state === "EXECUTING_ACTION" ? (
            <RefreshCw className="size-7 animate-spin" />
          ) : (
            <Mic className="size-7" />
          )}

          {/* Pulse ring animation */}
          {state === "LISTENING" && (
            <span className="absolute -inset-1 rounded-full border-2 border-red-500 animate-ping opacity-75" />
          )}
        </button>
      </aside>

      {/* 2. COMPACT FLOATING SLIDE-UP ASSISTANT PANEL */}
      {isOpen && (
        <section
          aria-label="AI Voice Assistant Dialog"
          className="glass glass-strong fixed bottom-24 right-6 z-50 flex h-[580px] w-full max-w-[420px] flex-col rounded-[28px] border border-white/20 shadow-2xl backdrop-blur-xl transition-all duration-300 max-sm:bottom-24 max-sm:right-2 max-sm:left-2 max-sm:max-w-none max-sm:h-[520px]"
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-slate-200/80 dark:border-white/10 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-xl bg-emerald-600 text-white shadow-sm">
                <Sparkles className="size-4" />
              </span>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                  KrishiSetu AI Assistant
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`size-2 rounded-full ${
                      state === "LISTENING"
                        ? "bg-red-500 animate-ping"
                        : state === "PROCESSING"
                        ? "bg-amber-500 animate-spin"
                        : state === "SPEAKING"
                        ? "bg-emerald-500"
                        : "bg-slate-400"
                    }`}
                  />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {state}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Language Switcher */}
              <button
                type="button"
                onClick={() => setLanguage((prev) => (prev === "hi" ? "en" : "hi"))}
                className="flex items-center gap-1 rounded-lg border border-slate-200/90 dark:border-white/15 bg-white/70 dark:bg-slate-800/80 px-2 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-white transition"
              >
                <Languages className="size-3 text-emerald-600" />
                <span>{language === "hi" ? "हिंदी" : "EN"}</span>
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  stopSpeaking();
                  stopListening();
                  setIsOpen(false);
                }}
                title="Minimize voice assistant"
                aria-label="Minimize voice assistant"
                className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 transition"
              >
                <ChevronDown className="size-5" />
              </button>
            </div>
          </div>

          {/* Conversation History Scroll Area */}
          <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center py-8 px-4 space-y-3">
                <span className="grid size-12 place-items-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                  <Mic className="size-6" />
                </span>
                <p className="font-bold text-sm text-slate-800 dark:text-slate-100">
                  How can KrishiSetu help you today?
                </p>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
                  Speak naturally in Hindi or English to check loans, evaluate scheme subsidies, track
                  applications, or navigate the portal.
                </p>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === "user" ? "items-end" : "items-start"
                } space-y-1.5`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-xs ${
                    msg.sender === "user"
                      ? "bg-emerald-600 text-white rounded-br-xs"
                      : "bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-white/10 rounded-bl-xs"
                  }`}
                >
                  {/* Message body */}
                  <div className="whitespace-pre-line font-medium">{msg.text}</div>

                  {/* Navigation Action Pill */}
                  {msg.navigation && (
                    <div className="mt-2.5 flex items-center justify-between rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 p-2 text-emerald-800 dark:text-emerald-300">
                      <span className="flex items-center gap-1.5 font-bold text-[11px]">
                        <Compass className="size-3.5 text-emerald-600" />
                        {msg.navigation.description}
                      </span>
                      <ArrowRight className="size-3.5" />
                    </div>
                  )}

                  {/* Verified Application Channel Card */}
                  {msg.applicationChannel && (
                    <div className="mt-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 p-2.5 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white text-[11px]">
                          Official Channel:
                        </span>
                        {msg.applicationChannel.official_url && (
                          <a
                            href={msg.applicationChannel.official_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                          >
                            Open Portal <ExternalLink className="size-3" />
                          </a>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-600 dark:text-slate-300">
                        📍 {msg.applicationChannel.application_channel}
                      </p>
                    </div>
                  )}
                </div>

                <span className="text-[9px] font-semibold text-slate-400 px-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}

            {/* Interim live speech transcript */}
            {interimTranscript && (
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl bg-emerald-600/70 p-3 text-white italic text-xs animate-pulse">
                  "{interimTranscript}..."
                </div>
              </div>
            )}

            {/* Error Notice */}
            {errorMessage && (
              <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-2.5 text-red-700 dark:text-red-300 text-xs">
                <AlertCircle className="size-4 shrink-0 text-red-600" />
                <span className="font-semibold">{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Suggested follow-up prompt chips */}
          <div className="shrink-0 px-4 py-2 border-t border-slate-200/60 dark:border-white/10 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendCommand(s)}
                className="shrink-0 rounded-full border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-800/80 px-2.5 py-1 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 transition"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Active Audio / Waveform Bar */}
          {(state === "LISTENING" || state === "SPEAKING") && (
            <div className="shrink-0 px-4 py-1.5 flex items-center justify-between bg-emerald-50/70 dark:bg-emerald-950/40 border-t border-emerald-200/50">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                  {state === "LISTENING" ? "Listening to your voice..." : "Speaking response..."}
                </span>
                <VoiceWaveform active={true} color="emerald" bars={10} />
              </div>

              {state === "SPEAKING" && (
                <button
                  type="button"
                  onClick={stopSpeaking}
                  className="flex items-center gap-1 rounded-md bg-white dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-200 border border-slate-200"
                >
                  <Square className="size-2.5 text-red-600 fill-red-600" />
                  <span>Stop</span>
                </button>
              )}
            </div>
          )}

          {/* Footer Input Bar */}
          <div className="shrink-0 border-t border-slate-200/80 dark:border-white/10 p-3 bg-white/50 dark:bg-slate-900/50 rounded-b-[28px]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendCommand(textInput);
              }}
              className="flex items-center gap-2"
            >
              {/* Mic Action Button */}
              <button
                type="button"
                onClick={handleMicClick}
                className={`grid size-10 shrink-0 place-items-center rounded-xl text-white shadow-xs transition ${
                  state === "LISTENING"
                    ? "bg-red-600 animate-pulse"
                    : state === "SPEAKING"
                    ? "bg-emerald-600"
                    : "bg-[#166534] hover:bg-emerald-700"
                }`}
                title={state === "LISTENING" ? "Stop Listening" : "Tap to speak"}
              >
                {state === "LISTENING" ? <MicOff className="size-4" /> : <Mic className="size-4" />}
              </button>

              {/* Text Input Alternative */}
              <input
                type="text"
                placeholder={
                  language === "hi"
                    ? "बोलें या सवाल टाइप करें..."
                    : "Speak or type your command..."
                }
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="field flex-1 !py-2 !text-xs !rounded-xl"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!textInput.trim() || state === "PROCESSING"}
                className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white shadow-xs disabled:opacity-40 transition"
              >
                <Send className="size-4" />
              </button>
            </form>
          </div>
        </section>
      )}
    </>
  );
}
