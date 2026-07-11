export const locales = ["en", "id"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";
export const localeCookieName = "stockwise-locale";

export const localeConfig: Record<
  Locale,
  { dateLocale: string; currency: string; label: string }
> = {
  en: {
    dateLocale: "en-US",
    currency: "USD",
    label: "English",
  },
  id: {
    dateLocale: "id-ID",
    currency: "IDR",
    label: "Bahasa Indonesia",
  },
};

export function isLocale(value: string | undefined | null): value is Locale {
  return Boolean(value && locales.includes(value as Locale));
}
