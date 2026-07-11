import "server-only";

import { cookies } from "next/headers";

import { getTranslator } from "@/lib/i18n/dictionary";
import {
  defaultLocale,
  isLocale,
  localeCookieName,
  type Locale,
} from "@/lib/i18n/locales";

export async function getCurrentLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const locale = cookieStore.get(localeCookieName)?.value;

  return isLocale(locale) ? locale : defaultLocale;
}

export async function getServerTranslator() {
  const locale = await getCurrentLocale();

  return {
    locale,
    t: getTranslator(locale),
  };
}
