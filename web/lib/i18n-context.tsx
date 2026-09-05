"use client";

import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";
import { Lang, STR, t as tFn, tt as ttFn } from "./i18n";

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof STR | string, vars?: Record<string, string>) => string;
  tt: (pair: Parameters<typeof ttFn>[0]) => string;
};

const LangContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "ho.lang.v1";

/* useSyncExternalStore, not useState+useEffect: reading localStorage is
   reading an external store, and this avoids the "setState inside an
   effect" anti-pattern (and its extra render) for what's really just a
   subscription. The native "storage" event only fires in *other* tabs;
   setLang() dispatches one manually so this tab's own change is seen. */
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}
function getSnapshot(): Lang {
  try {
    return localStorage.getItem(STORAGE_KEY) === "am" ? "am" : "en";
  } catch {
    return "en";
  }
}
function getServerSnapshot(): Lang {
  return "en"; // matches the server-rendered HTML exactly — no hydration mismatch
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.body.classList.toggle("lang-am", lang === "am");
  }, [lang]);

  function setLang(l: Lang) {
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* fine — just won't persist across visits */
    }
    window.dispatchEvent(new Event("storage"));
  }

  const value: Ctx = {
    lang,
    setLang,
    t: (key, vars) => tFn(key, lang, vars),
    tt: (pair) => ttFn(pair, lang),
  };

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang() must be called inside <LanguageProvider>");
  return ctx;
}
