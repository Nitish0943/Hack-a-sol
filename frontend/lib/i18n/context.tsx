"use client";

import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { type Locale, translations } from "./translations";

export type { Locale };
export type Language = Locale;

interface I18nContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  language: Locale;
  setLanguage: (l: Locale) => void;
  t: (path: string, fallback?: string) => string;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
}

const I18nContext = createContext<I18nContextType>({
  locale: "hi",
  setLocale: () => {},
  language: "hi",
  setLanguage: () => {},
  t: (path, fallback) => fallback || path,
  speak: () => {},
  stopSpeaking: () => {},
  isSpeaking: false,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("hi");
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("krishisetu_locale") as Locale;
      if (saved && (saved === "en" || saved === "hi" || saved === "cghi")) {
        setLocaleState(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem("krishisetu_locale", newLocale);
    } catch {
      // ignore
    }
  };

  const t = (path: string, fallback?: string): string => {
    const parts = path.split(".");
    let current: any = translations[locale];

    for (const part of parts) {
      if (current && typeof current === "object" && part in current) {
        current = current[part];
      } else {
        // Fallback to Hindi or English
        let fb: any = translations["hi"];
        for (const p of parts) {
          if (fb && typeof fb === "object" && p in fb) {
            fb = fb[p];
          } else {
            fb = null;
            break;
          }
        }
        if (fb && typeof fb === "string") return fb;
        return fallback || path;
      }
    }

    return typeof current === "string" ? current : fallback || path;
  };

  const speak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = locale === "en" ? "en-IN" : "hi-IN";
    utterance.rate = 0.9; // clear, steady pace for rural farmers

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, language: locale, setLanguage: setLocale, t, speak, stopSpeaking, isSpeaking }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useTranslation = () => useContext(I18nContext);
export const useLocale = () => useContext(I18nContext).locale;
