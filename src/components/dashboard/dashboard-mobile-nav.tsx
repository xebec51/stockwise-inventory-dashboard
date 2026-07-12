"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, UserCircle2 } from "lucide-react";

import { StockWiseLogo } from "@/components/brand/stockwise-logo";
import type { DashboardNavItem } from "@/config/dashboard-nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { NavItem } from "@/components/dashboard/nav-item";
import { SignOutButton } from "@/components/dashboard/sign-out-button";
import type { AuthSessionUser } from "@/lib/auth";
import { LanguageSwitcher } from "@/components/language-switcher";
import { translateRole } from "@/lib/i18n/status";
import { useI18n } from "@/lib/i18n/use-i18n";

type DashboardMobileNavProps = {
  currentUser: AuthSessionUser;
  navItems: DashboardNavItem[];
};

export function DashboardMobileNav({
  currentUser,
  navItems,
}: DashboardMobileNavProps) {
  const [open, setOpen] = useState(false);
  const { locale, t } = useI18n();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="outline"
            size="icon-sm"
            className="lg:hidden"
            aria-label={t("nav.dashboard")}
          />
        }
      >
        <Menu className="size-4" />
      </SheetTrigger>
      <SheetContent side="left" className="w-[88vw] max-w-sm p-0">
        <SheetHeader className="border-b border-border px-5 py-5 text-left">
          <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <StockWiseLogo showWordmark={false} />
            <div>
              <SheetTitle>StockWise</SheetTitle>
              <SheetDescription>{t("landing.badge")}</SheetDescription>
            </div>
          </Link>
        </SheetHeader>

        <div className="px-4 py-4">
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => (
              <NavItem
                key={item.href}
                item={item}
                onNavigate={() => setOpen(false)}
              />
            ))}
          </nav>
          <Separator className="my-4" />
          <Link
            href="/dashboard/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted"
          >
            <Avatar size="default">
              <AvatarImage
                src={currentUser.image ?? undefined}
                alt={currentUser.name ?? "User"}
              />
              <AvatarFallback>
                {currentUser.name?.slice(0, 2).toUpperCase() ?? "SW"}
              </AvatarFallback>
            </Avatar>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">
                {currentUser.name} ({translateRole(currentUser.role, locale)})
              </span>
              <span className="flex items-center gap-1 text-xs text-primary">
                <UserCircle2 className="size-3.5" />
                {t("profile.viewProfile")}
              </span>
            </span>
          </Link>
          <div className="space-y-3 px-2 pt-3">
            <p className="text-sm leading-6 text-muted-foreground">
              {t("dashboard.mobileDescription")}
            </p>
            <LanguageSwitcher />
            <SignOutButton />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
