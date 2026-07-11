import { redirect } from "next/navigation";

import { AppFooter } from "@/components/app-footer";
import { LoginForm } from "@/components/auth/login-form";
import { StockWiseLogo } from "@/components/brand/stockwise-logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthSession } from "@/lib/auth";
import { getServerTranslator } from "@/lib/i18n/server";

type LoginPageProps = { searchParams?: Promise<{ error?: string }> };

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

  if (session?.user?.status === "ACTIVE") redirect("/dashboard");

  const params = await searchParams;

  return (
    <>
      <main className="min-h-screen bg-background px-4 py-12">
        <div className="mx-auto max-w-md">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <StockWiseLogo showWordmark={false} />
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("login.title")}</h1>
                <p className="text-sm text-muted-foreground">{t("login.description")}</p>
              </div>
            </div>
            <LanguageSwitcher />
          </div>

          <Card className="border-border bg-card shadow-none">
            <CardHeader>
              <CardTitle>{t("login.accessTitle")}</CardTitle>
              <CardDescription>{t("login.accessDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <LoginForm error={params?.error} />
              <details className="rounded-lg border border-border bg-muted/60 p-4 text-sm">
                <summary className="cursor-pointer font-medium text-foreground">{t("login.badge")}</summary>
                <div className="mt-3 space-y-1 text-muted-foreground">
                  {demoAccounts.map((account) => <p key={account}>{account}</p>)}
                  <p className="pt-2">{t("login.demoPassword")}: <strong>Password123!</strong></p>
                </div>
              </details>
            </CardContent>
          </Card>
        </div>
      </main>
      <AppFooter />
    </>
  );
}
