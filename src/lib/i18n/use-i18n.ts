"use client";

import { useI18nContext } from "@/lib/i18n/i18n-provider";

export function useI18n() {
  return useI18nContext();
}
