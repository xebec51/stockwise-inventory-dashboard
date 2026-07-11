import type { ReactNode } from "react";

import type { DashboardNavItem } from "@/config/dashboard-nav";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import type { AuthSessionUser } from "@/lib/auth";

type DashboardShellProps = {
  children: ReactNode;
  currentUser: AuthSessionUser;
  navItems: DashboardNavItem[];
};

export function DashboardShell({
  children,
  currentUser,
  navItems,
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(8,145,178,0.13),transparent_30%),radial-gradient(circle_at_90%_0%,rgba(16,185,129,0.08),transparent_26%)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px]">
        <DashboardSidebar currentUser={currentUser} navItems={navItems} />
        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardTopbar currentUser={currentUser} navItems={navItems} />
          <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
