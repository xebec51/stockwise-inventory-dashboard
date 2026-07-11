import { localeConfig, type Locale } from "@/lib/i18n/locales";

type CurrencyFormatOptions = {
  currency?: string;
  locale?: Locale;
};

type DateFormatOptions = {
  locale?: Locale;
  options?: Intl.DateTimeFormatOptions;
};

export function formatCurrencyByLocale(
  value: number | string,
  { currency, locale = "en" }: CurrencyFormatOptions = {}
) {
  const amount = typeof value === "string" ? Number(value) : value;

  if (!Number.isFinite(amount)) {
    return "-";
  }

  const config = localeConfig[locale];

  return new Intl.NumberFormat(config.dateLocale, {
    style: "currency",
    currency: currency ?? config.currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDateByLocale(
  value: Date | string,
  { locale = "en", options }: DateFormatOptions = {}
) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat(localeConfig[locale].dateLocale, {
    dateStyle: "medium",
    ...options,
  }).format(date);
}

export function formatDateTimeByLocale(
  value: Date | string,
  { locale = "en", options }: DateFormatOptions = {}
) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat(localeConfig[locale].dateLocale, {
    dateStyle: "medium",
    timeStyle: "short",
    ...options,
  }).format(date);
}
