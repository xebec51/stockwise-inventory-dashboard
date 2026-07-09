import Link from "next/link";
import { Boxes, Sparkles } from "lucide-react";

import type { DashboardNavItem } from "@/config/dashboard-nav";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { NavItem } from "@/components/dashboard/nav-item";
import type { AuthSessionUser } from "@/lib/auth";

type DashboardSidebarProps = {
  currentUser: AuthSessionUser;
  navItems: DashboardNavItem[];
};

export function DashboardSidebar({
  currentUser,
  navItems,
}: DashboardSidebarProps) {
  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-sidebar-border bg-sidebar/95 px-5 py-5 lg:flex">
      <Link href="/" className="flex items-center gap-3 rounded-2xl px-2 py-1">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
          <Boxes className="size-5" />
        </div>
        <div>
          <p className="font-semibold tracking-tight text-sidebar-foreground">
            StockWise
          </p>
          <p className="text-xs text-muted-foreground">
            Inventory intelligence
          </p>
        </div>
      </Link>

      <div className="mt-6 rounded-3xl border border-sidebar-border bg-background/70 p-4 shadow-sm">
        <Badge variant="secondary" className="gap-1.5">
          <Sparkles className="size-3" />
          {currentUser.role}
        </Badge>
        <p className="mt-3 text-sm font-medium text-sidebar-foreground">
          Signed in as {currentUser.name}.
        </p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Navigation is filtered by the permissions available to this role.
        </p>
      </div>

      <Separator className="my-5" />

      <nav className="flex flex-1 flex-col gap-1.5">
        {navItems.map((item) => (
          <NavItem key={item.href} item={item} />
        ))}
      </nav>
    </aside>
  );
}
