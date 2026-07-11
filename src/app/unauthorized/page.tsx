import Link from "next/link";
import { ShieldAlert } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { getServerTranslator } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

export default async function UnauthorizedPage() {
  const user = await getCurrentUser();
  const { t } = await getServerTranslator();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-lg border-y border-slate-200 py-10 text-center">
        <ShieldAlert className="mx-auto size-8 text-slate-500" />
        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950">
          {t("common.unauthorizedTitle")}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {t("common.unauthorizedDescription")}
        </p>
        <Link
          href={user ? "/dashboard" : "/login"}
          className={cn(buttonVariants(), "mt-6")}
        >
          {user ? t("common.returnToDashboard") : t("common.signIn")}
        </Link>
      </div>
    </main>
  );
}
