import type { ReactNode } from "react";
import { Code2, ExternalLink, Mail, Settings } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { PlaceholderState } from "@/components/dashboard/placeholder-state";
import { Card, CardContent } from "@/components/ui/card";
import { getServerTranslator } from "@/lib/i18n/server";
import { requireDashboardPathAccess } from "@/lib/auth";

export default async function SettingsPage() {
  await requireDashboardPathAccess("/dashboard/settings");
  const { t } = await getServerTranslator();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("settings.eyebrow")}
        title={t("settings.title")}
        description={t("settings.description")}
      />
      <PlaceholderState
        icon={Settings}
        title={t("settings.placeholderTitle")}
        description={t("settings.placeholderDescription")}
        bullets={[
          t("settings.bullets.one"),
          t("settings.bullets.two"),
          t("settings.bullets.three"),
        ]}
      />
      <Card className="stockwise-ink stockwise-signal overflow-hidden rounded-3xl">
        <CardContent className="relative grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100/75">
              {t("developer.portfolioProject")}
            </p>
            <h2 className="mt-3 text-2xl font-semibold">
              {t("footer.developer")}: Muh. Rinaldi Ruslan
            </h2>
            <p className="mt-2 text-sm text-white/65">{t("developer.role")}</p>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/68">
              {t("developer.portfolioDescription")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <DeveloperLink
              href="https://github.com/xebec51"
              label={t("developer.github")}
              icon={<Code2 className="size-4" />}
            />
            <DeveloperLink
              href="https://www.linkedin.com/in/rinaldiruslan"
              label={t("developer.linkedin")}
              icon={<ExternalLink className="size-4" />}
            />
            <DeveloperLink
              href="mailto:rinaldi.ruslan51@gmail.com"
              label={t("developer.email")}
              icon={<Mail className="size-4" />}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DeveloperLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: ReactNode;
}) {
  const external = !href.startsWith("mailto:");

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-sm font-semibold text-white/80 transition hover:border-cyan-300/30 hover:bg-cyan-300/10 hover:text-cyan-100"
    >
      {icon}
      {label}
    </a>
  );
}
