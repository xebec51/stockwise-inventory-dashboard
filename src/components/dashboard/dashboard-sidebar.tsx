import Link from "next/link";

import { StockWiseLogo } from "@/components/brand/stockwise-logo";
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
      <Link href="/" className="rounded-md px-2 py-1 outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring">
        <StockWiseLogo variant="inverse" />
        <p className="mt-1 pl-[3.25rem] text-xs text-sidebar-foreground/55">
          {t("dashboard.inventoryIntelligence")}
        </p>
      </Link>

      <div className="mt-6 border-y border-white/10 py-4">
        <p className="text-xs font-medium text-sidebar-primary">
          {translateRole(currentUser.role, locale)}
        </p>
        <p className="mt-2 text-sm font-medium">
          {t("common.signedInAs")} {currentUser.name}.
        </p>
      </div>

      <Separator className="my-5 bg-white/10" />

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => (
          <NavItem key={item.href} item={item} inverse />
        ))}
      </nav>

      <div className="pt-4">
        <LanguageSwitcher />
      </div>
    </aside>
  );
}
