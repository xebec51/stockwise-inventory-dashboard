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

function formatAxisCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function InventoryAnalyticsCharts({
  categoryData,
  movementData,
}: InventoryAnalyticsChartsProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card className="border-border/70 bg-background/80 shadow-sm shadow-black/5">
        <CardHeader>
          <CardTitle>Incoming vs outgoing volume</CardTitle>
          <CardDescription>
            Approved and completed stock movement quantities grouped by month.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={movementData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="incoming" name="Incoming" fill="var(--color-chart-2, #16a34a)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="outgoing" name="Outgoing" fill="var(--color-chart-4, #ea580c)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-background/80 shadow-sm shadow-black/5">
        <CardHeader>
          <CardTitle>Inventory value by category</CardTitle>
          <CardDescription>
            Current on-hand inventory value based on purchase price and stock.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={(value: number) => formatAxisCurrency(value)}
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

                  return formatCurrency(numericValue);
                }}
              />
              <Bar dataKey="value" name="Inventory Value" fill="var(--color-chart-1, #2563eb)" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
