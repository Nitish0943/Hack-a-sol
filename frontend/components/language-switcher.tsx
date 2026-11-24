"use client";

import { Check, ChevronDown, Globe2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  languageNames,
  languages,
  isLanguage,
  type Language,
} from "@/lib/i18n/translations";
import { useLanguage } from "@/components/language-provider";

const compactNames: Record<Language, string> = {
  en: "EN",
  hi: "हिं",
  hne: "छत्तीस",
};

const accessibilityLabels: Record<Language, { language: string; choose: string }> = {
  en: { language: "Language", choose: "Choose language" },
  hi: { language: "भाषा", choose: "भाषा चुनें" },
  hne: { language: "भाखा", choose: "भाखा चुनव" },
};

export function LanguageSwitcher({
  variant = "navbar",
}: {
  variant?: "navbar" | "select";
}) {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const [alignRight, setAlignRight] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closeOnOutsideClick(event: PointerEvent) {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, []);

  if (variant === "select") {
    return (
      <select
        aria-label={accessibilityLabels[language].language}
        data-no-translate
        className="field mt-2"
        value={language}
        onChange={(event) => {
          if (isLanguage(event.target.value)) setLanguage(event.target.value);
        }}
      >
        {languages.map((option) => (
          <option key={option} value={option}>
            {languageNames[option]}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div className="relative" data-no-translate ref={rootRef}>
      <button
        type="button"
        aria-label={`${accessibilityLabels[language].language}: ${languageNames[language]}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => {
          if (!open && rootRef.current) {
            const { left } = rootRef.current.getBoundingClientRect();
            setAlignRight(left + 192 > window.innerWidth);
          }
          setOpen(!open);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200/90 dark:border-white/20 bg-white dark:bg-slate-900/90 px-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100 transition hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 sm:px-3 shadow-xs"
      >
        <Globe2 aria-hidden="true" className="size-4 shrink-0 text-[#166534] dark:text-emerald-400" />
        <span className="sm:hidden">{compactNames[language]}</span>
        <span className="hidden sm:inline">{languageNames[language]}</span>
        <ChevronDown aria-hidden="true" className="hidden size-3.5 text-slate-400 dark:text-slate-300 sm:block" />
      </button>
      {open && (
        <div
          role="menu"
          aria-label={accessibilityLabels[language].choose}
          className={`absolute z-50 mt-2 w-48 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200/90 dark:border-white/20 bg-white dark:bg-slate-900 p-1.5 shadow-xl ${
            alignRight ? "right-0" : "left-0"
          }`}
        >
          {languages.map((option) => {
            const selected = option === language;
            return (
              <button
                key={option}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                onClick={() => {
                  setLanguage(option);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${
                  selected
                    ? "bg-[#EAF4EC] dark:bg-emerald-950/80 font-bold text-[#166534] dark:text-emerald-300"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <span>{languageNames[option]}</span>
                {selected && <Check aria-hidden="true" className="size-4" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
