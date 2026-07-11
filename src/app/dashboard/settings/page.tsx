import { Settings } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { PlaceholderState } from "@/components/dashboard/placeholder-state";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function SettingsPage() {
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
    </div>
  );
}
