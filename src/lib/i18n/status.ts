import { getTranslator } from "@/lib/i18n/dictionary";
import { defaultLocale, type Locale } from "@/lib/i18n/locales";
import type { StockStatus } from "@/lib/stock";

export function translateRole(role: string, locale: Locale = defaultLocale) {
  return getTranslator(locale)(`roles.${role}`);
}

export function translateStockStatus(
  status: StockStatus,
  locale: Locale = defaultLocale
) {
  return getTranslator(locale)(`statuses.stock.${status}`);
}

export function translateUserStatus(
  status: string,
  locale: Locale = defaultLocale
) {
  return getTranslator(locale)(`statuses.user.${status}`);
}

export function translateTransactionStatus(
  status: string,
  locale: Locale = defaultLocale
) {
  return getTranslator(locale)(`statuses.transaction.${status}`);
}

export function translateRestockStatus(
  status: string,
  locale: Locale = defaultLocale
) {
  return getTranslator(locale)(`statuses.restock.${status}`);
}
