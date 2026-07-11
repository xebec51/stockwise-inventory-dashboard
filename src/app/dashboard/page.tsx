import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  ClipboardList,
  PackageCheck,
  Wallet,
} from "lucide-react";

import { InventoryAnalyticsCharts } from "@/components/dashboard/inventory-analytics-charts";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import { getServerTranslator } from "@/lib/i18n/server";
import {
  translateStockStatus,
  translateTransactionStatus,
} from "@/lib/i18n/status";
import { prisma } from "@/lib/prisma";
import { getStockStatus } from "@/lib/stock";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const RECENT_TRANSACTION_LIMIT = 5;
const LOW_STOCK_PREVIEW_LIMIT = 5;

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "PENDING":
      return "secondary";
    case "APPROVED":
    case "COMPLETED":
      return "default";
    case "REJECTED":
      return "destructive";
    default:
      return "outline";
  }
}

export default async function DashboardPage() {
  const { locale, t } = await getServerTranslator();
  const [
    products,
    movementTransactions,
    recentTransactions,
    pendingTransactionCount,
    activeRestockOrderCount,
  ] = await Promise.all([
    prisma.product.findMany({
      select: {
        id: true,
        name: true,
        currentStock: true,
        minimumStock: true,
        purchasePrice: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.transaction.findMany({
      where: {
        status: {
          in: ["APPROVED", "COMPLETED"],
        },
      },
      select: {
        type: true,
        transactionDate: true,
        items: {
          select: {
            quantity: true,
          },
        },
      },
    }),
    prisma.transaction.findMany({
      take: RECENT_TRANSACTION_LIMIT,
      orderBy: [{ transactionDate: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        transactionNumber: true,
        type: true,
        status: true,
        destination: true,
        transactionDate: true,
        creator: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.transaction.count({
      where: {
        status: "PENDING",
      },
    }),
    prisma.restockOrder.count({
      where: {
        status: {
          in: ["PENDING", "CONFIRMED", "IN_TRANSIT"],
        },
      },
    }),
  ]);

  const inventoryByCategoryMap = new Map<string, number>();
  const lowStockCandidates: typeof products = [];
  let totalInventoryValue = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;

  products.forEach((product) => {
    const status = getStockStatus(product.currentStock, product.minimumStock);
    const currentValue = inventoryByCategoryMap.get(product.category.name) ?? 0;
    const productValue = Number(product.purchasePrice) * product.currentStock;

    totalInventoryValue += productValue;
    inventoryByCategoryMap.set(product.category.name, currentValue + productValue);

    if (status === "LOW_STOCK") {
      lowStockCount += 1;
      lowStockCandidates.push(product);
    }

    if (status === "OUT_OF_STOCK") {
      outOfStockCount += 1;
      lowStockCandidates.push(product);
    }
  });

  const lowStockProducts = lowStockCandidates
    .sort((left, right) => left.currentStock - right.currentStock)
    .slice(0, LOW_STOCK_PREVIEW_LIMIT);

  const inventoryByCategory = [...inventoryByCategoryMap.entries()]
    .map(([name, value]) => ({
      name,
      value,
    }))
    .sort((left, right) => right.value - left.value);

  const movementMap = new Map<string, { label: string; incoming: number; outgoing: number }>();

  movementTransactions.forEach((transaction) => {
    const monthKey = new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
      month: "short",
      year: "2-digit",
    }).format(transaction.transactionDate);
    const quantity = transaction.items.reduce(
      (total, item) => total + item.quantity,
      0
    );

    const entry = movementMap.get(monthKey) ?? {
      label: monthKey,
      incoming: 0,
      outgoing: 0,
    };

    if (transaction.type === "INCOMING") {
      entry.incoming += quantity;
    } else {
      entry.outgoing += quantity;
    }

    movementMap.set(monthKey, entry);
  });

  const movementData = [...movementMap.values()];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("dashboard.overview")}
        title={t("dashboard.commandCenter")}
        description={t("dashboard.commandDescription")}
        action={
          <Link
            href="/dashboard/transactions"
            className={cn(buttonVariants({ variant: "default", size: "sm" }))}
          >
            {t("dashboard.reviewTransactions")}
            <ArrowRight className="size-4" />
          </Link>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="stockwise-panel">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">{t("dashboard.totalProducts")}</CardTitle>
              <CardDescription>{t("dashboard.totalProductsDescription")}</CardDescription>
            </div>
            <Boxes className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">{products.length}</p>
          </CardContent>
        </Card>

        <Card className="stockwise-panel">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">{t("dashboard.inventoryValue")}</CardTitle>
              <CardDescription>{t("dashboard.inventoryValueDescription")}</CardDescription>
            </div>
            <Wallet className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">
              {formatCurrency(totalInventoryValue, { locale })}
            </p>
          </CardContent>
        </Card>

        <Card className="stockwise-panel border-amber-200/70 bg-amber-50/45 dark:border-amber-500/25 dark:bg-amber-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">{t("dashboard.lowStock")}</CardTitle>
              <CardDescription>{t("dashboard.lowStockDescription")}</CardDescription>
            </div>
            <AlertTriangle className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">{lowStockCount}</p>
            <p className="text-sm text-muted-foreground">
              {t("dashboard.outOfStockNow", { count: outOfStockCount })}
            </p>
          </CardContent>
        </Card>

        <Card className="stockwise-panel">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">{t("dashboard.pendingTransactions")}</CardTitle>
              <CardDescription>{t("dashboard.pendingTransactionsDescription")}</CardDescription>
            </div>
            <ClipboardList className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">
              {pendingTransactionCount}
            </p>
          </CardContent>
        </Card>

        <Card className="stockwise-panel">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">{t("dashboard.activeRestocks")}</CardTitle>
              <CardDescription>{t("dashboard.activeRestocksDescription")}</CardDescription>
            </div>
            <PackageCheck className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">
              {activeRestockOrderCount}
            </p>
          </CardContent>
        </Card>

        <Card className="stockwise-panel">
          <CardHeader className="space-y-1">
            <CardTitle className="text-sm font-medium">{t("dashboard.stockPressure")}</CardTitle>
            <CardDescription>{t("dashboard.stockPressureDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {lowStockProducts.slice(0, 3).map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between rounded-xl border border-border/70 bg-background/45 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {product.category.name}
                  </p>
                </div>
                <Badge
                  variant={
                    product.currentStock === 0 ? "destructive" : "secondary"
                  }
                >
                  {product.currentStock}
                </Badge>
              </div>
            ))}
            {lowStockProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("dashboard.noLowStock")}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </section>

      <InventoryAnalyticsCharts
        categoryData={inventoryByCategory}
        movementData={movementData}
      />

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="stockwise-panel">
          <CardHeader>
            <CardTitle>{t("dashboard.recentTransactions")}</CardTitle>
            <CardDescription>
              {t("dashboard.recentTransactionsDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="rounded-2xl border border-border/70 bg-muted/25 p-4 transition-colors hover:bg-muted/38"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{transaction.transactionNumber}</p>
                  <Badge variant="outline">
                    {translateTransactionStatus(transaction.type, locale)}
                  </Badge>
                  <Badge variant={getStatusBadgeVariant(transaction.status)}>
                    {translateTransactionStatus(transaction.status, locale)}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {transaction.creator.name} -{" "}
                  {formatDateTime(transaction.transactionDate, { locale })}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {transaction.destination ?? t("common.noDestination")}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="stockwise-panel">
          <CardHeader>
            <CardTitle>{t("dashboard.lowStockProducts")}</CardTitle>
            <CardDescription>
              {t("dashboard.lowStockProductsDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {lowStockProducts.map((product) => {
              const status = getStockStatus(
                product.currentStock,
                product.minimumStock
              );

              return (
                <div
                  key={product.id}
                  className="rounded-2xl border border-border/70 bg-muted/25 p-4 transition-colors hover:bg-muted/38"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.category.name}
                      </p>
                    </div>
                    <Badge
                      variant={
                        status === "OUT_OF_STOCK" ? "destructive" : "secondary"
                      }
                    >
                      {translateStockStatus(status, locale)}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t("dashboard.currentStockMinimumLabel", {
                      current: product.currentStock,
                      minimum: product.minimumStock,
                    })}
                  </p>
                </div>
              );
            })}
            {lowStockProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("dashboard.healthyThresholds")}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
