import { redirect } from "next/navigation";
import { Boxes, ShieldCheck } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAuthSession } from "@/lib/auth";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

const demoAccounts = [
  "admin@stockwise.demo",
  "manager@stockwise.demo",
  "staff@stockwise.demo",
  "supplier.alpha@stockwise.demo",
  "supplier.beta@stockwise.demo",
];

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getAuthSession();

  if (session?.user?.status === "ACTIVE") {
    redirect("/dashboard");
  }

  const params = await searchParams;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(14,116,144,0.12),transparent_35%)] px-4 py-10">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-border/70 bg-background/85 p-8 shadow-sm shadow-black/5">
          <Badge variant="secondary" className="gap-2">
            <ShieldCheck className="size-4" />
            Demo authentication
          </Badge>
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <Boxes className="size-6" />
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">
                  Sign in to StockWise
                </h1>
                <p className="text-sm text-muted-foreground">
                  Access inventory control, warehouse operations, and role-based dashboard tools.
                </p>
              </div>
            </div>

            <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
              This phase now uses the real `users` table for credential sign-in with
              role-aware access across admin, manager, staff, and supplier flows.
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
              Demo password for all seeded accounts: <strong>Password123!</strong>
            </div>
          </div>
        </div>

        <Card className="border-border/70 bg-background/90 shadow-sm shadow-black/5">
          <CardHeader>
            <CardTitle>Account access</CardTitle>
            <CardDescription>
              Sign in with a seeded demo account to unlock the role-aware dashboard.
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
