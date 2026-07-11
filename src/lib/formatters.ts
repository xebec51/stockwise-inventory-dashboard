import { defaultLocale, type Locale } from "@/lib/i18n/locales";
import {
  formatCurrencyByLocale,
  formatDateByLocale,
  formatDateTimeByLocale,
} from "@/lib/i18n/formatters";

type CurrencyFormatOptions = {
  currency?: string;
  locale?: string | Locale;
};

type DateFormatOptions = {
  locale?: string | Locale;
  options?: Intl.DateTimeFormatOptions;
};

export function formatCurrency(
  value: number | string,
  { currency, locale = defaultLocale }: CurrencyFormatOptions = {}
) {
  return formatCurrencyByLocale(value, {
    currency,
    locale: locale === "id-ID" ? "id" : locale === "en-US" ? "en" : (locale as Locale),
  });
}

export function formatDate(
  value: Date | string,
  { locale = defaultLocale, options }: DateFormatOptions = {}
) {
  return formatDateByLocale(value, {
    locale: locale === "id-ID" ? "id" : locale === "en-US" ? "en" : (locale as Locale),
    options,
  });
}

export function formatDateTime(
  value: Date | string,
  { locale = defaultLocale, options }: DateFormatOptions = {}
) {
  return formatDateTimeByLocale(value, {
    locale: locale === "id-ID" ? "id" : locale === "en-US" ? "en" : (locale as Locale),
    options,
  });
}

export function formatStatusLabel(value: string) {
  return value
    .trim()
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}
