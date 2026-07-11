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
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
  LOW_STOCK:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
  OUT_OF_STOCK:
    "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300",
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
    <Badge variant="outline" className={cn("gap-1.5", statusStyles[status])}>
      <Icon className="size-3.5" />
      {translateStockStatus(status, locale)}
    </Badge>
  );
}
