"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { getDictionary, getTranslator } from "@/lib/i18n/dictionary";
import {
  isLocale,
  localeCookieName,
  locales,
  type Locale,
} from "@/lib/i18n/locales";

type I18nContextValue = {
  dictionary: ReturnType<typeof getDictionary>;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: ReturnType<typeof getTranslator>;
};

const I18nContext = createContext<I18nContextValue | null>(null);

type I18nProviderProps = {
  children: ReactNode;
  initialLocale: Locale;
};

export function I18nProvider({
  children,
  initialLocale,
}: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === "undefined") {
      return initialLocale;
    }

    const stored = window.localStorage.getItem(localeCookieName);

    return isLocale(stored) ? stored : initialLocale;
  });

  useEffect(() => {
    document.documentElement.lang = locale;
    document.cookie = `${localeCookieName}=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    window.localStorage.setItem(localeCookieName, locale);
  }, [locale]);

  const value = useMemo<I18nContextValue>(() => {
    return {
      locale,
      setLocale: (nextLocale) => {
        if (locales.includes(nextLocale)) {
          setLocaleState(nextLocale);
        }
      },
      dictionary: getDictionary(locale),
      t: getTranslator(locale),
    };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18nContext() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18nContext must be used within I18nProvider");
  }

  return context;
}
