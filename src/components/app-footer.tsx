"use client";

import Link from "next/link";
import {
  Code2,
  ExternalLink,
  Mail,
} from "lucide-react";

import { StockWiseLogo } from "@/components/brand/stockwise-logo";
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
    <footer className="border-t border-white/10 bg-brand-graphite text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 sm:px-8 lg:grid-cols-[1.2fr_0.8fr_1fr] lg:px-10">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <StockWiseLogo showWordmark={false} variant="inverse" />
            <div>
              <p className="text-lg font-semibold tracking-tight">StockWise</p>
              <p className="text-xs text-white/56">{t("landing.tagline")}</p>
            </div>
          </div>
          <p className="max-w-md text-sm leading-6 text-white/68">
            {t("footer.description")}
          </p>
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
                className="inline-flex w-fit items-center gap-2 text-white/68 transition hover:text-brand-cyan"
              >
                {t(item.labelKey)}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-cyan">
                {t("footer.developer")}
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                Muh. Rinaldi Ruslan
              </h2>
              <p className="mt-1 text-sm text-white/60">
                {t("developer.role")}
              </p>
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
                  className="inline-flex items-center gap-2 text-xs font-semibold text-white/70 transition hover:text-brand-cyan"
                >
                  <Icon className="size-3.5" />
                  {t(link.labelKey)}
                </a>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 text-sm text-white/55 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <p>{t("footer.rights", { year })}</p>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Code2 className="size-4 text-brand-cyan" />
            {techStack.join(" · ")}
          </div>
        </div>
      </div>
    </footer>
  );
}
