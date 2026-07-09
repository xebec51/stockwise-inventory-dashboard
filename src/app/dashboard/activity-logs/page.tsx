import { FolderKanban } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { PlaceholderState } from "@/components/dashboard/placeholder-state";

export default function ActivityLogsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Activity Logs"
        title="Operational audit timeline"
        description="Activity logs will later provide a structured view of user actions, module context, and audit-friendly warehouse event history."
      />
      <PlaceholderState
        icon={FolderKanban}
        title="Activity logs module placeholder"
        description="The UI now reserves an explicit audit surface for future visibility into actions across products, transactions, restocks, and system events."
        bullets={[
          "Future timeline and filter controls can plug in here.",
          "Supports cross-module visibility for warehouse governance later.",
          "Aligns directly with the planned activity_logs entity.",
        ]}
      />
    </div>
  );
}
