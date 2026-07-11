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
    "border-success/20 bg-success/10 text-success",
  LOW_STOCK:
    "border-warning/20 bg-warning/10 text-warning",
  OUT_OF_STOCK:
    "border-destructive/20 bg-destructive/10 text-destructive",
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
      className={cn("gap-1.5 rounded-full px-2.5", statusStyles[status])}
    >
      <Icon className="size-3.5" />
      {translateStockStatus(status, locale)}
    </Badge>
  );
}
