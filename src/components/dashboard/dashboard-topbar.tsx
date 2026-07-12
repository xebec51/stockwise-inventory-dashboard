"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, LogOut, UserCircle2 } from "lucide-react";
import { signOut } from "next-auth/react";

import { StockWiseMark } from "@/components/brand/stockwise-logo";
import type { DashboardNavItem } from "@/config/dashboard-nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DashboardMobileNav } from "@/components/dashboard/dashboard-mobile-nav";
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
          <span className="hidden text-sm text-muted-foreground lg:inline">
            {translateRole(currentUser.role, locale)}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  aria-label={t("profile.accountMenuLabel")}
                  className="flex items-center gap-2.5 rounded-full p-0.5 outline-none transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 md:rounded-lg md:py-1 md:pr-3"
                />
              }
            >
              <Avatar size="sm">
                <AvatarImage
                  src={currentUser.image ?? undefined}
                  alt={currentUser.name ?? "User"}
                />
                <AvatarFallback>
                  {currentUser.name?.slice(0, 2).toUpperCase() ?? "SW"}
                </AvatarFallback>
              </Avatar>
              <span className="hidden min-w-0 text-left md:block">
                <span className="block max-w-40 truncate text-sm font-medium">
                  {currentUser.name}
                </span>
                <span className="block max-w-40 truncate text-xs text-muted-foreground">
                  {currentUser.email}
                </span>
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuLabel className="px-2 py-1.5">
                <span className="block truncate text-sm font-medium text-foreground">
                  {currentUser.name}
                </span>
                <span className="block truncate text-xs font-normal text-muted-foreground">
                  {currentUser.email}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<Link href="/dashboard/profile" />}>
                <UserCircle2 className="size-4" />
                {t("profile.viewProfile")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut className="size-4" />
                {t("common.signOut")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
