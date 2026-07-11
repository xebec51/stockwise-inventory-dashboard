"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  type DashboardNavItem,
  dashboardIconMap,
} from "@/config/dashboard-nav";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useI18n } from "@/lib/i18n/use-i18n";
import { cn } from "@/lib/utils";

type NavItemProps = {
  item: DashboardNavItem;
  collapsed?: boolean;
  onNavigate?: () => void;
};

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavItem({
  item,
  collapsed = false,
  onNavigate,
}: NavItemProps) {
  const pathname = usePathname();
  const { t } = useI18n();
  const active = isActivePath(pathname, item.href);
  const Icon = dashboardIconMap[item.icon];
  const label = t(item.titleKey);

  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors",
        collapsed ? "justify-center px-2.5" : "justify-start",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
      aria-current={active ? "page" : undefined}
    >
      <Icon className="size-4 shrink-0" />
      {!collapsed && <span>{label}</span>}
    </Link>
  );

  if (!collapsed) {
    return link;
  }

  return (
    <Tooltip>
      <TooltipTrigger render={link} />
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}
