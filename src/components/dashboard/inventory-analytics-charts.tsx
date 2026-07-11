"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { useI18n } from "@/lib/i18n/use-i18n";

type MovementPoint = {
  label: string;
  incoming: number;
  outgoing: number;
};

type CategoryPoint = {
  name: string;
  value: number;
};

type InventoryAnalyticsChartsProps = {
  categoryData: CategoryPoint[];
  movementData: MovementPoint[];
};

export function InventoryAnalyticsCharts({
  categoryData,
  movementData,
}: InventoryAnalyticsChartsProps) {
  const { locale, t } = useI18n();

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card className="stockwise-panel">
        <CardHeader>
          <CardTitle>{t("dashboard.incomingVsOutgoing")}</CardTitle>
          <CardDescription>
            {t("dashboard.incomingVsOutgoingDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={movementData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="incoming" name={t("statuses.transaction.INCOMING")} fill="var(--color-chart-2, #16a34a)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="outgoing" name={t("statuses.transaction.OUTGOING")} fill="var(--color-chart-4, #ea580c)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="stockwise-panel">
        <CardHeader>
          <CardTitle>{t("dashboard.inventoryValueByCategory")}</CardTitle>
          <CardDescription>
            {t("dashboard.inventoryValueByCategoryDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={(value: number) =>
                  formatCurrency(value, { locale })
                }
              />
              <YAxis
                type="category"
                dataKey="name"
                width={140}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(value) => {
                  const numericValue =
                    typeof value === "number" ? value : Number(value ?? 0);

                  return formatCurrency(numericValue, { locale });
                }}
              />
              <Bar dataKey="value" name={t("dashboard.inventoryValue")} fill="var(--color-chart-1, #2563eb)" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
