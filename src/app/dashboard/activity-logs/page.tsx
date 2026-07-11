import { FolderKanban } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { PlaceholderState } from "@/components/dashboard/placeholder-state";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function ActivityLogsPage() {
  const { t } = await getServerTranslator();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("activityLogs.eyebrow")}
        title={t("activityLogs.title")}
        description={t("activityLogs.description")}
      />
      <PlaceholderState
        icon={FolderKanban}
        title={t("activityLogs.placeholderTitle")}
        description={t("activityLogs.placeholderDescription")}
        bullets={[
          t("activityLogs.bullets.one"),
          t("activityLogs.bullets.two"),
          t("activityLogs.bullets.three"),
        ]}
      />
    </div>
  );
}
