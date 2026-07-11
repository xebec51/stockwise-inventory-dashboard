"use client";

import Link from "next/link";
import {
  Activity,
  Boxes,
  Code2,
  ExternalLink,
  Mail,
  Radar,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n/use-i18n";

const productLinks = [
  { href: "/", labelKey: "footer.links.home" },
  { href: "/login", labelKey: "footer.links.login" },
  { href: "/dashboard", labelKey: "footer.links.dashboard" },
  { href: "/dashboard/products", labelKey: "footer.links.products" },
  { href: "/dashboard/reports", labelKey: "footer.links.reports" },
  { href: "/dashboard/settings", labelKey: "footer.links.settings" },
] as const;

const techStack = [
  "Next.js",
  "TypeScript",
  "Prisma",
  "PostgreSQL",
  "Tailwind CSS",
  "shadcn/ui",
] as const;

const developerLinks = [
  {
    href: "https://github.com/xebec51",
    labelKey: "developer.github",
    icon: Code2,
  },
  {
    href: "https://www.linkedin.com/in/rinaldiruslan",
    labelKey: "developer.linkedin",
    icon: ExternalLink,
  },
  {
    href: "mailto:rinaldi.ruslan51@gmail.com",
    labelKey: "developer.email",
    icon: Mail,
  },
] as const;

export function AppFooter() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[linear-gradient(135deg,oklch(0.16_0.026_250),oklch(0.22_0.042_230))] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_0%,rgba(34,211,238,0.22),transparent_31%),radial-gradient(circle_at_88%_18%,rgba(16,185,129,0.16),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-0 stockwise-grid opacity-[0.06]" />

      <div className="relative mx-auto grid max-w-7xl gap-8 px-6 py-12 sm:px-8 lg:grid-cols-[1.2fr_0.8fr_1fr] lg:px-10">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-950/30">
              <Boxes className="size-5" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight">StockWise</p>
              <p className="text-xs text-white/56">{t("landing.tagline")}</p>
            </div>
          </div>
          <p className="max-w-md text-sm leading-6 text-white/68">
            {t("footer.description")}
          </p>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
            <Radar className="size-3.5" />
            {t("developer.portfolioProject")}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-white/50">
            {t("footer.product")}
          </h2>
          <nav className="mt-4 grid gap-3 text-sm">
            {productLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group inline-flex w-fit items-center gap-2 text-white/72 transition hover:text-cyan-100"
              >
                {t(item.labelKey)}
                <ExternalLink className="size-3.5 opacity-0 transition group-hover:opacity-100" />
              </Link>
            ))}
          </nav>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/20">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/70">
                {t("footer.developer")}
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                Muh. Rinaldi Ruslan
              </h2>
              <p className="mt-1 text-sm text-white/60">
                {t("developer.role")}
              </p>
            </div>
            <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-300/15 text-emerald-100 ring-1 ring-emerald-300/25">
              <Activity className="size-5" />
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-white/66">
            {t("developer.portfolioDescription")}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {developerLinks.map((link) => {
              const Icon = link.icon;
              const external = !link.href.startsWith("mailto:");

              return (
                <a
                  key={link.href}
                  href={link.href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noreferrer" : undefined}
                  aria-label={t(link.labelKey)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-white/78 transition hover:border-cyan-300/30 hover:bg-cyan-300/10 hover:text-cyan-100"
                >
                  <Icon className="size-3.5" />
                  {t(link.labelKey)}
                </a>
              );
            })}
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 text-sm text-white/55 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <p>{t("footer.rights", { year })}</p>
          <div className="flex flex-wrap items-center gap-2">
            <Code2 className="size-4 text-cyan-100/75" />
            {techStack.map((item) => (
              <Badge
                key={item}
                className="border-white/10 bg-white/[0.06] text-white/68 hover:bg-white/[0.08]"
              >
                {item}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
