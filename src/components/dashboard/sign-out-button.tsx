"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/use-i18n";

export function SignOutButton() {
  const { t } = useI18n();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      <LogOut className="size-4" />
      {t("common.signOut")}
    </Button>
  );
}
