import Link from "next/link";
import { Boxes } from "lucide-react";

import type { DashboardNavItem } from "@/config/dashboard-nav";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Separator } from "@/components/ui/separator";
import { NavItem } from "@/components/dashboard/nav-item";
import type { AuthSessionUser } from "@/lib/auth";
import { translateRole } from "@/lib/i18n/status";
import { getCurrentLocale } from "@/lib/i18n/server";
import { getTranslator } from "@/lib/i18n/dictionary";

type DashboardSidebarProps = {
  currentUser: AuthSessionUser;
  navItems: DashboardNavItem[];
};

export async function DashboardSidebar({
  currentUser,
  navItems,
}: DashboardSidebarProps) {
  const locale = await getCurrentLocale();
  const t = getTranslator(locale);

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar px-5 py-5 text-sidebar-foreground lg:flex">
      <Link href="/" className="flex items-center gap-3 px-2 py-1">
        <div className="flex size-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Boxes className="size-5" />
        </div>
        <div>
          <p className="font-semibold tracking-tight">
            StockWise
          </p>
          <p className="text-xs text-sidebar-foreground/60">
            {t("dashboard.inventoryIntelligence")}
          </p>
        </div>
      </Link>

      <div className="mt-6 border-y border-white/10 py-4">
        <p className="text-xs font-medium text-cyan-100">
          {translateRole(currentUser.role, locale)}
        </p>
        <p className="mt-2 text-sm font-medium">
          {t("common.signedInAs")} {currentUser.name}.
        </p>
      </div>

      <Separator className="my-5 bg-white/10" />

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => (
          <NavItem key={item.href} item={item} />
        ))}
      </nav>

      <div className="pt-4">
        <LanguageSwitcher />
      </div>
    </aside>
  );
}
