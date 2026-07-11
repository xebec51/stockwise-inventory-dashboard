"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Command } from "lucide-react";

import type { DashboardNavItem } from "@/config/dashboard-nav";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DashboardMobileNav } from "@/components/dashboard/dashboard-mobile-nav";
import { SignOutButton } from "@/components/dashboard/sign-out-button";
import type { AuthSessionUser } from "@/lib/auth";
import { LanguageSwitcher } from "@/components/language-switcher";
import { translateRole, translateUserStatus } from "@/lib/i18n/status";
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
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="flex min-h-18 items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <DashboardMobileNav currentUser={currentUser} navItems={navItems} />
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
            <p className="truncate text-lg font-semibold tracking-tight">
              {currentPageLabel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
          <Badge variant="outline" className="hidden sm:inline-flex">
            {translateRole(currentUser.role, locale)}
          </Badge>
          <Button variant="outline" size="sm" className="hidden md:inline-flex">
            <Command className="size-4" />
            {translateUserStatus(currentUser.status, locale)}
          </Button>
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
