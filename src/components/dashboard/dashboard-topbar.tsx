"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { StockWiseMark } from "@/components/brand/stockwise-logo";
import type { DashboardNavItem } from "@/config/dashboard-nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DashboardMobileNav } from "@/components/dashboard/dashboard-mobile-nav";
import { SignOutButton } from "@/components/dashboard/sign-out-button";
import type { AuthSessionUser } from "@/lib/auth";
import { LanguageSwitcher } from "@/components/language-switcher";
import { translateRole } from "@/lib/i18n/status";
import { useI18n } from "@/lib/i18n/use-i18n";

function getCurrentPage(pathname: string, navItems: DashboardNavItem[]) {
  return (
    navItems.find((item) =>
      item.href === "/dashboard"
        ? pathname === item.href
        : pathname === item.href || pathname.startsWith(`${item.href}/`)
    ) ?? navItems[0]
  );
}

type DashboardTopbarProps = {
  currentUser: AuthSessionUser;
  navItems: DashboardNavItem[];
};

export function DashboardTopbar({
  currentUser,
  navItems,
}: DashboardTopbarProps) {
  const pathname = usePathname();
  const { locale, t } = useI18n();
  const currentPage = getCurrentPage(pathname, navItems);
  const currentPageLabel = t(currentPage.titleKey);

  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/82 backdrop-blur-xl">
      <div className="flex min-h-18 items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <DashboardMobileNav currentUser={currentUser} navItems={navItems} />
          <StockWiseMark className="hidden size-7 sm:block" />
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/dashboard" className="hover:text-foreground">
                {t("nav.dashboard")}
              </Link>
              {currentPage.href !== "/dashboard" && (
                <>
                  <ChevronRight className="size-4" />
                  <span className="truncate text-foreground">
                    {currentPageLabel}
                  </span>
                </>
              )}
            </div>
            <p className="truncate text-lg font-semibold tracking-tight sm:text-xl">
              {currentPageLabel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {translateRole(currentUser.role, locale)}
          </span>
          <div className="hidden items-center gap-3 md:flex">
            <div className="text-right">
              <p className="text-sm font-medium">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground">
                {currentUser.email}
              </p>
            </div>
            <SignOutButton />
          </div>
          <Avatar size="sm">
            <AvatarImage src={currentUser.image ?? undefined} alt={currentUser.name ?? "User"} />
            <AvatarFallback>
              {currentUser.name?.slice(0, 2).toUpperCase() ?? "SW"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
