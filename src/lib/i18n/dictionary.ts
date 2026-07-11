import { en } from "@/lib/i18n/dictionaries/en";
import { id } from "@/lib/i18n/dictionaries/id";
import { defaultLocale, type Locale } from "@/lib/i18n/locales";

const dictionaries = {
  en,
  id,
} as const;

export function getDictionary(locale: Locale = defaultLocale) {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}

function resolveValue(source: unknown, segments: string[]) {
  return segments.reduce<unknown>((current, segment) => {
    if (current && typeof current === "object" && segment in current) {
      return (current as Record<string, unknown>)[segment];
    }

    return undefined;
  }, source);
}

export function getTranslator(locale: Locale = defaultLocale) {
  const dictionary = getDictionary(locale);
  const fallback = getDictionary(defaultLocale);

  return (key: string, values?: Record<string, string | number>) => {
    const segments = key.split(".");
    const localized = resolveValue(dictionary, segments);
    const fallbackValue = resolveValue(fallback, segments);
    const raw =
      typeof localized === "string"
        ? localized
        : typeof fallbackValue === "string"
          ? fallbackValue
          : key;

    if (!values) {
      return raw;
    }

    return Object.entries(values).reduce((message, [token, value]) => {
      return message.replaceAll(`{${token}}`, String(value));
    }, raw);
  };
}
