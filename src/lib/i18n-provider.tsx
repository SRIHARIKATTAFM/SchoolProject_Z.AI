"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import type { Lang } from "@/lib/i18n";
import { tr as translate } from "@/lib/i18n";

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
  t: (key: string) => string;
}

const Ctx = createContext<I18nCtx | null>(null);

const COOKIE = "zphs_lang";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const m = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]*)`));
    // Hydrate language from cookie on mount (client-only) — eslint-disable to avoid hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (m && (m[1] === "en" || m[1] === "te")) setLangState(m[1] as Lang);
  }, []);

  // Reflect language on <html lang> so the Telugu font rule kicks in.
  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    document.cookie = `${COOKIE}=${l}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    document.documentElement.lang = l;
  }, []);

  const toggle = useCallback(() => setLang(lang === "en" ? "te" : "en"), [lang, setLang]);

  const t = useCallback((key: string) => translate(key, lang), [lang]);

  return (
    <Ctx.Provider value={{ lang, setLang, toggle, t }}>{children}</Ctx.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
