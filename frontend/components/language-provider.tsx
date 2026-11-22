"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  getEnglishSource,
  isLanguage,
  languages,
  translateText,
  type Language,
} from "@/lib/i18n/translations";

const STORAGE_KEY = "krishisetu-language";
const textOriginals = new WeakMap<Text, string>();
const attributeOriginals = new WeakMap<Element, Map<string, string>>();

let currentLanguage: Language = "en";
let languageInitialized = false;
const listeners = new Set<() => void>();

function subscribeToLanguage(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getLanguageSnapshot(): Language {
  if (typeof window !== "undefined" && !languageInitialized) {
    const savedLanguage = window.localStorage.getItem(STORAGE_KEY);
    if (isLanguage(savedLanguage)) currentLanguage = savedLanguage;
    languageInitialized = true;
  }
  return currentLanguage;
}

function getServerLanguageSnapshot(): Language {
  return "en";
}

function isExistingTranslation(source: string, value: string) {
  return languages.some((language) => translateText(source, language) === value);
}

function publishLanguage(language: Language) {
  currentLanguage = language;
  languageInitialized = true;
  listeners.forEach((listener) => listener());
}

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function localizeTextNode(node: Text, language: Language, originals: WeakMap<Text, string>) {
  const current = node.nodeValue ?? "";
  const previous = originals.get(node);
  const source =
    previous && isExistingTranslation(previous, current)
      ? previous
      : getEnglishSource(current);
  originals.set(node, source);
  const translated = translateText(source, language);
  if (current !== translated) node.nodeValue = translated;
}

function localizeElement(
  element: Element,
  language: Language,
  textOriginals: WeakMap<Text, string>,
  attributeOriginals: WeakMap<Element, Map<string, string>>,
) {
  if (element.closest("[data-no-translate]")) return;

  const localizeAttributes = (target: Element) => {
    if (target.closest("[data-no-translate]")) return;

    const attributes = ["aria-label", "alt", "placeholder", "title"];
    attributes.forEach((attribute) => {
      if (!target.hasAttribute(attribute)) return;

      const current = target.getAttribute(attribute) ?? "";
      const originals = attributeOriginals.get(target) ?? new Map<string, string>();
      const previous = originals.get(attribute);
      const source =
        previous && isExistingTranslation(previous, current)
          ? previous
          : getEnglishSource(current);
      originals.set(attribute, source);
      attributeOriginals.set(target, originals);
      const translated = translateText(source, language);
      if (current !== translated) target.setAttribute(attribute, translated);
    });
  };

  localizeAttributes(element);
  element.querySelectorAll("*").forEach(localizeAttributes);

  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const text = node as Text;
    if (
      text.parentElement?.closest(
        "script, style, noscript, code, pre, textarea, [contenteditable='true'], [data-no-translate]",
      )
    ) {
      continue;
    }
    localizeTextNode(text, language, textOriginals);
  }
}

function localizeDocument(
  language: Language,
  textOriginals: WeakMap<Text, string>,
  attributeOriginals: WeakMap<Element, Map<string, string>>,
  metadata: { title: string; description: string | null },
) {
  localizeElement(document.documentElement, language, textOriginals, attributeOriginals);
  document.title = translateText(metadata.title, language);

  const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (description && metadata.description) {
    description.content = translateText(metadata.description, language);
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const metadata = useRef<{ title: string; description: string | null } | null>(null);
  const language = useSyncExternalStore(
    subscribeToLanguage,
    getLanguageSnapshot,
    getServerLanguageSnapshot,
  );

  const setLanguage = useCallback((nextLanguage: Language) => {
    window.localStorage.setItem(STORAGE_KEY, nextLanguage);
    publishLanguage(nextLanguage);
  }, []);

  useEffect(() => {
    if (!metadata.current) {
      metadata.current = {
        title: document.title,
        description:
          document.querySelector<HTMLMetaElement>('meta[name="description"]')?.content ?? null,
      };
    }

    document.documentElement.lang = language;
    localizeDocument(language, textOriginals, attributeOriginals, metadata.current);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "characterData" && mutation.target instanceof Text) {
          localizeTextNode(mutation.target, language, textOriginals);
          return;
        }

        if (mutation.type === "attributes" && mutation.target instanceof Element) {
          localizeElement(mutation.target, language, textOriginals, attributeOriginals);
          return;
        }

        mutation.addedNodes.forEach((node) => {
          if (node instanceof Text) {
            localizeTextNode(node, language, textOriginals);
          } else if (node instanceof Element) {
            localizeElement(node, language, textOriginals, attributeOriginals);
          }
        });
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["aria-label", "alt", "placeholder", "title"],
      characterData: true,
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage }), [language, setLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider.");
  }
  return context;
}
