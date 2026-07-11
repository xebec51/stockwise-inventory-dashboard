import { redirect } from "next/navigation";
import { Boxes, ShieldCheck } from "lucide-react";

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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(14,116,144,0.12),transparent_35%)] px-4 py-10">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-border/70 bg-background/85 p-8 shadow-sm shadow-black/5">
          <div className="flex items-start justify-between gap-4">
            <Badge variant="secondary" className="gap-2">
              <ShieldCheck className="size-4" />
              {t("login.badge")}
            </Badge>
            <LanguageSwitcher />
          </div>
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <Boxes className="size-6" />
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">
                  {t("login.title")}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {t("login.description")}
                </p>
              </div>
            </div>

            <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
              {t("login.intro")}
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {demoAccounts.map((account) => (
                <div
                  key={account}
                  className="rounded-2xl border border-border/70 bg-muted/25 px-4 py-3 text-sm"
                >
                  {account}
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-border/70 bg-muted/25 px-4 py-3 text-sm text-muted-foreground">
              {t("login.demoPassword")}: <strong>Password123!</strong>
            </div>
          </div>
        </div>

        <Card className="border-border/70 bg-background/90 shadow-sm shadow-black/5">
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
