"use client";

import { AlertTriangle, CheckCircle2, CircleOff } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { translateStockStatus } from "@/lib/i18n/status";
import { useI18n } from "@/lib/i18n/use-i18n";
import { cn } from "@/lib/utils";
import {
  type StockStatus,
} from "@/lib/stock";

type StockStatusBadgeProps = {
  status: StockStatus;
};

const statusStyles: Record<StockStatus, string> = {
  IN_STOCK:
    "border-emerald-200 bg-emerald-50 text-emerald-800 shadow-emerald-950/5 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-200",
  LOW_STOCK:
    "border-amber-200 bg-amber-50 text-amber-800 shadow-amber-950/5 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200",
  OUT_OF_STOCK:
    "border-rose-200 bg-rose-50 text-rose-800 shadow-rose-950/5 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-200",
};

const statusIcons = {
  IN_STOCK: CheckCircle2,
  LOW_STOCK: AlertTriangle,
  OUT_OF_STOCK: CircleOff,
} as const;

export function StockStatusBadge({ status }: StockStatusBadgeProps) {
  const { locale } = useI18n();
  const Icon = statusIcons[status];

  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 rounded-full px-2.5 shadow-sm", statusStyles[status])}
    >
      <Icon className="size-3.5" />
      {translateStockStatus(status, locale)}
    </Badge>
  );
}
