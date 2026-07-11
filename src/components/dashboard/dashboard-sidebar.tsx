import Link from "next/link";
import { Boxes, Radar, Sparkles } from "lucide-react";

import type { DashboardNavItem } from "@/config/dashboard-nav";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Badge } from "@/components/ui/badge";
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
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.22),transparent_58%)]" />
      <Link href="/" className="relative flex items-center gap-3 rounded-2xl px-2 py-1">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-cyan-950/30">
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

      <div className="relative mt-6 rounded-3xl border border-white/10 bg-white/[0.06] p-4 shadow-xl shadow-black/20">
        <div className="flex items-center justify-between gap-3">
          <Badge className="gap-1.5 border-cyan-300/25 bg-cyan-300/10 text-cyan-100 hover:bg-cyan-300/15">
            <Sparkles className="size-3" />
            {translateRole(currentUser.role, locale)}
          </Badge>
          <div className="flex size-9 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-200 ring-1 ring-emerald-300/20">
            <Radar className="size-4" />
          </div>
        </div>
        <p className="mt-4 text-sm font-medium">
          {t("common.signedInAs")} {currentUser.name}.
        </p>
        <p className="mt-2 text-sm leading-6 text-sidebar-foreground/62">
          {t("dashboard.sidebarDescription")}
        </p>
      </div>

      <div className="relative mt-3 grid grid-cols-3 gap-2 rounded-3xl border border-white/10 bg-white/[0.04] p-3">
        <div className="rounded-2xl bg-white/[0.06] p-2">
          <p className="text-[10px] uppercase tracking-[0.22em] text-sidebar-foreground/45">
            {t("dashboard.sidebarMode")}
          </p>
          <p className="mt-1 text-xs font-semibold text-cyan-100">
            {t("dashboard.sidebarLive")}
          </p>
        </div>
        <div className="rounded-2xl bg-white/[0.06] p-2">
          <p className="text-[10px] uppercase tracking-[0.22em] text-sidebar-foreground/45">
            {t("dashboard.sidebarScope")}
          </p>
          <p className="mt-1 text-xs font-semibold text-emerald-100">
            {t("dashboard.sidebarOps")}
          </p>
        </div>
        <div className="rounded-2xl bg-white/[0.06] p-2">
          <p className="text-[10px] uppercase tracking-[0.22em] text-sidebar-foreground/45">
            {t("dashboard.sidebarRisk")}
          </p>
          <p className="mt-1 text-xs font-semibold text-amber-100">
            {t("dashboard.sidebarWatch")}
          </p>
        </div>
      </div>

      <Separator className="my-5 bg-white/10" />

      <nav className="relative flex flex-1 flex-col gap-1.5">
        {navItems.map((item) => (
          <NavItem key={item.href} item={item} />
        ))}
      </nav>

      <div className="relative pt-4">
        <LanguageSwitcher />
      </div>
    </aside>
  );
}
