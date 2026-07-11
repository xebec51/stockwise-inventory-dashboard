"use client";

import { Languages } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { localeConfig, locales, type Locale } from "@/lib/i18n/locales";
import { useI18n } from "@/lib/i18n/use-i18n";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full bg-card/72"
            aria-label={t("common.language")}
          />
        }
      >
        <Languages className="size-4" />
        {locale.toUpperCase()}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((value) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setLocale(value as Locale)}
            className="flex items-center justify-between gap-3"
          >
            <span>{localeConfig[value].label}</span>
            {locale === value ? <span aria-hidden="true">{"*"}</span> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
