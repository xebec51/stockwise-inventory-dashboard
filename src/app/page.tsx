import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  ClipboardCheck,
  Factory,
  FileSpreadsheet,
  QrCode,
  ShieldCheck,
  Warehouse,
} from "lucide-react";

import { LanguageSwitcher } from "@/components/language-switcher";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getServerTranslator } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

const highlights = [
  {
    titleKey: "landing.highlights.inventoryControl",
    descriptionKey: "landing.highlights.inventoryControlDescription",
    icon: Warehouse,
  },
  {
    titleKey: "landing.highlights.approvalWorkflows",
    descriptionKey: "landing.highlights.approvalWorkflowsDescription",
    icon: ClipboardCheck,
  },
  {
    titleKey: "landing.highlights.supplierOperations",
    descriptionKey: "landing.highlights.supplierOperationsDescription",
    icon: Factory,
  },
  {
    titleKey: "landing.highlights.reportingLayer",
    descriptionKey: "landing.highlights.reportingLayerDescription",
    icon: FileSpreadsheet,
  },
];

const modules = [
  "landing.modules.analytics",
  "landing.modules.catalog",
  "landing.modules.transactions",
  "landing.modules.restocks",
  "landing.modules.suppliers",
  "landing.modules.qrAndReports",
];

export default async function Home() {
  const { t } = await getServerTranslator();

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(circle_at_top,rgba(14,116,144,0.16),transparent_55%),linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,255,255,0.78))] dark:bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_45%),linear-gradient(180deg,rgba(9,9,11,0.96),rgba(9,9,11,0.82))]" />

      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 pb-16 pt-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between rounded-full border border-border/70 bg-background/80 px-4 py-3 shadow-sm shadow-black/5 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <Boxes className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">StockWise</p>
              <p className="text-xs text-muted-foreground">
                {t("landing.tagline")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-3 md:flex">
              <Badge variant="outline">{t("landing.eyebrow")}</Badge>
            </div>
            <LanguageSwitcher />
            <Link
              href="/dashboard"
              className={cn(buttonVariants({ variant: "default", size: "sm" }))}
            >
              {t("landing.openDashboard")}
            </Link>
          </div>
        </header>

        <div className="grid flex-1 items-center gap-12 py-14 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="gap-1.5 px-3 py-1">
                <ShieldCheck className="size-3.5" />
                {t("landing.badge")}
              </Badge>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                {t("landing.title")}
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                {t("landing.description")}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className={cn(buttonVariants({ variant: "default", size: "lg" }))}
              >
                {t("landing.exploreDashboard")}
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/dashboard/products"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
              >
                {t("landing.viewModuleStructure")}
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {highlights.map((item) => {
                const Icon = item.icon;

                return (
                  <Card
                    key={item.titleKey}
                    className="border-border/70 bg-background/80 shadow-sm shadow-black/5 backdrop-blur"
                  >
                    <CardHeader className="space-y-3">
                      <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/8 text-primary ring-1 ring-primary/10">
                        <Icon className="size-5" />
                      </div>
                      <CardTitle>{t(item.titleKey)}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm leading-6 text-muted-foreground">
                      {t(item.descriptionKey)}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-[2rem] bg-[radial-gradient(circle_at_top_right,rgba(14,116,144,0.18),transparent_45%)] blur-2xl dark:bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_45%)]" />
            <Card className="overflow-hidden border-border/70 bg-background/90 shadow-xl shadow-black/10">
              <CardHeader className="border-b border-border/70 pb-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {t("landing.platformScope")}
                    </p>
                    <CardTitle className="mt-1 text-xl">
                      {t("landing.foundations")}
                    </CardTitle>
                  </div>
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                    <QrCode className="size-6" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid gap-3">
                  {modules.map((module) => (
                    <div
                      key={module}
                      className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/40 px-4 py-3"
                    >
                      <span className="text-sm font-medium">{t(module)}</span>
                      <Badge variant="outline">{t("landing.planned")}</Badge>
                    </div>
                  ))}
                </div>

                <div className="rounded-3xl border border-border/70 bg-[linear-gradient(135deg,rgba(14,116,144,0.12),transparent)] p-5 dark:bg-[linear-gradient(135deg,rgba(34,211,238,0.12),transparent)]">
                  <p className="text-sm font-medium">{t("landing.phasedDelivery")}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {t("landing.phasedDeliveryDescription")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}
