import type { ReactNode } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getDashboardNavItemsForRole } from "@/config/dashboard-nav";
import { requireCurrentUser } from "@/lib/auth";

export default function DashboardLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <DashboardLayoutContent>{children}</DashboardLayoutContent>;
}

async function DashboardLayoutContent({
  children,
}: Readonly<{ children: ReactNode }>) {
  const currentUser = await requireCurrentUser();
  const navItems = getDashboardNavItemsForRole(currentUser.role);

  return (
    <DashboardShell currentUser={currentUser} navItems={navItems}>
      {children}
    </DashboardShell>
  );
}
