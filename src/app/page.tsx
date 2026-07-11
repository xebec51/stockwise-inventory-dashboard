import Link from "next/link";
import { ArrowRight, Boxes, ClipboardCheck, Factory, Warehouse } from "lucide-react";

import { AppFooter } from "@/components/app-footer";
import { LanguageSwitcher } from "@/components/language-switcher";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
] as const;

const modules = [
  "landing.modules.analytics",
  "landing.modules.catalog",
  "landing.modules.transactions",
  "landing.modules.restocks",
] as const;

export default async function Home() {
  const { t } = await getServerTranslator();

  return (
    <main className="bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-slate-950 text-white">
              <Boxes className="size-4" />
            </div>
            <div>
              <p className="font-semibold tracking-tight">StockWise</p>
              <p className="text-xs text-slate-500">{t("landing.tagline")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Link href="/dashboard" className={cn(buttonVariants({ size: "sm" }))}>
              {t("landing.openDashboard")}
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_0.75fr] lg:py-24">
        <div className="max-w-3xl space-y-7">
          <p className="text-sm font-medium text-cyan-700">{t("landing.eyebrow")}</p>
          <h1 className="text-5xl font-semibold leading-[1.04] tracking-tight text-slate-950 sm:text-6xl">
            {t("landing.title")}
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-600">
            {t("landing.description")}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/dashboard" className={cn(buttonVariants({ size: "lg" }))}>
              {t("landing.exploreDashboard")}
              <ArrowRight className="size-4" />
            </Link>
            <Link href="/dashboard/products" className={cn(buttonVariants({ size: "lg", variant: "outline" }))}>
              {t("landing.viewModuleStructure")}
            </Link>
          </div>
        </div>

        <Card className="border-slate-800 bg-slate-950 text-white shadow-none">
          <CardContent className="p-7">
            <p className="text-sm text-cyan-300">{t("landing.platformScope")}</p>
            <h2 className="mt-2 text-2xl font-semibold">{t("landing.foundations")}</h2>
            <div className="mt-6 divide-y divide-white/10 border-y border-white/10">
              {modules.map((module) => (
                <div key={module} className="flex items-center justify-between gap-4 py-4 text-sm">
                  <span>{t(module)}</span>
                  <span className="text-slate-500">01</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-3">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.titleKey} className="border-l-2 border-slate-200 pl-5">
                <Icon className="size-5 text-cyan-700" />
                <h2 className="mt-4 text-lg font-semibold text-slate-950">{t(item.titleKey)}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{t(item.descriptionKey)}</p>
              </div>
            );
          })}
        </div>
      </section>
      <AppFooter />
    </main>
  );
}
