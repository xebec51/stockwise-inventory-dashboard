import { redirect } from "next/navigation";
import { Boxes, ScanLine, ShieldCheck } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAuthSession } from "@/lib/auth";
import { getServerTranslator } from "@/lib/i18n/server";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export const dynamic = "force-dynamic";

const demoAccounts = [
  "admin@stockwise.demo",
  "manager@stockwise.demo",
  "staff@stockwise.demo",
  "supplier.alpha@stockwise.demo",
  "supplier.beta@stockwise.demo",
];

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getAuthSession();
  const { t } = await getServerTranslator();

  if (session?.user?.status === "ACTIVE") {
    redirect("/dashboard");
  }

  const params = await searchParams;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(8,145,178,0.17),transparent_34%),radial-gradient(circle_at_88%_8%,rgba(16,185,129,0.12),transparent_28%)] px-4 py-10">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="stockwise-ink stockwise-signal rounded-[2rem] p-8">
          <div className="flex items-start justify-between gap-4">
            <Badge className="gap-2 border-cyan-300/25 bg-cyan-300/10 text-cyan-100 hover:bg-cyan-300/15">
              <ShieldCheck className="size-4" />
              {t("login.badge")}
            </Badge>
            <LanguageSwitcher />
          </div>
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-cyan-300/15 text-cyan-100 ring-1 ring-cyan-300/25">
                <Boxes className="size-6" />
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">
                  {t("login.title")}
                </h1>
                <p className="text-sm text-white/60">
                  {t("login.description")}
                </p>
              </div>
            </div>

            <p className="max-w-2xl text-sm leading-7 text-white/68">
              {t("login.intro")}
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {demoAccounts.map((account) => (
                <div
                  key={account}
                  className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white/82"
                >
                  {account}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-50">
              <ScanLine className="size-4 shrink-0" />
              {t("login.demoPassword")}: <strong>Password123!</strong>
            </div>
          </div>
        </div>

        <Card className="stockwise-panel rounded-[2rem]">
          <CardHeader>
            <CardTitle>{t("login.accessTitle")}</CardTitle>
            <CardDescription>
              {t("login.accessDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm error={params?.error} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
