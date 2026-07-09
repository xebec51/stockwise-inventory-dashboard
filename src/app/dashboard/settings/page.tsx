import { Settings } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { PlaceholderState } from "@/components/dashboard/placeholder-state";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Workspace configuration area"
        description="Settings will later host system preferences, role-based configuration, dashboard defaults, and platform-level controls as the application grows."
      />
      <PlaceholderState
        icon={Settings}
        title="Settings module placeholder"
        description="This route gives the dashboard shell a stable destination for future workspace controls without prematurely introducing user or system management logic."
        bullets={[
          "Future role-aware preferences and workspace options.",
          "Home for configurable dashboard behavior and admin defaults.",
          "Keeps configuration concerns separate from operational modules.",
        ]}
      />
    </div>
  );
}
