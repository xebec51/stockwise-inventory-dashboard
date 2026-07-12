import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { StockStatusBadge } from "@/components/dashboard/stock-status-badge";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireDashboardPathAccess } from "@/lib/auth";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import { getServerTranslator } from "@/lib/i18n/server";
import { translateRestockStatus, translateTransactionStatus } from "@/lib/i18n/status";
import { prisma } from "@/lib/prisma";
import { getStockStatus } from "@/lib/stock";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PREVIEW_LIMIT = 5;

type InventorySummaryRow = {
  totalProducts: number;
  inventoryValue: string;
  lowStockCount: number;
  outOfStockCount: number;
};

type PriorityProductRow = {
  id: string;
  name: string;
  currentStock: number;
  minimumStock: number;
  categoryName: string;
};

export default async function DashboardPage() {
  const currentUser = await requireDashboardPathAccess("/dashboard");
  const { locale, t } = await getServerTranslator();
  const canViewInventory = currentUser.role !== "SUPPLIER";
  const transactionWhere =
    currentUser.role === "STAFF"
      ? { createdById: currentUser.id }
      : currentUser.role === "SUPPLIER"
        ? { id: "__restricted__" }
        : undefined;
  const restockWhere =
    currentUser.role === "SUPPLIER"
      ? { supplier: { userId: currentUser.id } }
      : currentUser.role === "MANAGER"
        ? { managerId: currentUser.id }
        : currentUser.role === "STAFF"
          ? { id: "__restricted__" }
          : undefined;

  const inventorySummaryPromise = canViewInventory
    ? prisma.$queryRaw<InventorySummaryRow[]>`
        SELECT
          COUNT(*)::int AS "totalProducts",
          COALESCE(SUM(current_stock * purchase_price), 0)::text AS "inventoryValue",
          COUNT(*) FILTER (
            WHERE current_stock > 0 AND current_stock <= minimum_stock
          )::int AS "lowStockCount",
          COUNT(*) FILTER (WHERE current_stock <= 0)::int AS "outOfStockCount"
        FROM products
      `
    : Promise.resolve([
        { totalProducts: 0, inventoryValue: "0", lowStockCount: 0, outOfStockCount: 0 },
      ]);
  const priorityProductsPromise = canViewInventory
    ? prisma.$queryRaw<PriorityProductRow[]>`
        SELECT
          p.id,
          p.name,
          p.current_stock AS "currentStock",
          p.minimum_stock AS "minimumStock",
          c.name AS "categoryName"
        FROM products p
        JOIN categories c ON c.id = p.category_id
        WHERE p.current_stock <= p.minimum_stock
        ORDER BY p.current_stock ASC, p.name ASC
        LIMIT ${PREVIEW_LIMIT}
      `
    : Promise.resolve([] as PriorityProductRow[]);

  const [inventoryRows, priorityProducts, recentTransactions, pendingTransactionCount, activeRestockOrderCount, recentRestocks] =
    await Promise.all([
      inventorySummaryPromise,
      priorityProductsPromise,
      prisma.transaction.findMany({
        where: transactionWhere,
        take: PREVIEW_LIMIT,
        orderBy: [{ transactionDate: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          transactionNumber: true,
          type: true,
          status: true,
          transactionDate: true,
          creator: { select: { name: true } },
        },
      }),
      prisma.transaction.count({ where: { ...transactionWhere, status: "PENDING" } }),
      prisma.restockOrder.count({
        where: { ...restockWhere, status: { in: ["PENDING", "CONFIRMED", "IN_TRANSIT"] } },
      }),
      prisma.restockOrder.findMany({
        where:
          currentUser.role === "SUPPLIER"
            ? restockWhere
            : { id: "__not_needed__" },
        take: PREVIEW_LIMIT,
        orderBy: [{ orderDate: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          poNumber: true,
          status: true,
          supplier: { select: { companyName: true } },
        },
      }),
    ]);
  const inventorySummary = inventoryRows[0] ?? {
    totalProducts: 0,
    inventoryValue: "0",
    lowStockCount: 0,
    outOfStockCount: 0,
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={t("dashboard.overview")}
        title={t("dashboard.commandCenter")}
        description={t("dashboard.commandDescription")}
        action={
          currentUser.role !== "SUPPLIER" ? (
            <Link href="/dashboard/transactions" className={cn(buttonVariants({ size: "sm" }))}>
              {t("dashboard.reviewTransactions")} <ArrowRight className="size-4" />
            </Link>
          ) : undefined
        }
      />

      <Card className="border-border bg-card shadow-none">
        <CardHeader><CardTitle className="text-lg">{t("dashboard.overview")}</CardTitle></CardHeader>
        <CardContent className="grid gap-6 border-t border-border pt-6 sm:grid-cols-2 xl:grid-cols-5">
          <Metric label={t("dashboard.totalProducts")} value={String(inventorySummary.totalProducts)} />
          <Metric label={t("dashboard.inventoryValue")} value={formatCurrency(inventorySummary.inventoryValue, { locale })} />
          <Metric label={t("dashboard.lowStock")} value={String(inventorySummary.lowStockCount)} warning={inventorySummary.lowStockCount > 0} />
          <Metric label={t("statuses.stock.OUT_OF_STOCK")} value={String(inventorySummary.outOfStockCount)} danger={inventorySummary.outOfStockCount > 0} />
          <Metric label={t("dashboard.pendingTransactions")} value={String(pendingTransactionCount + activeRestockOrderCount)} warning={pendingTransactionCount + activeRestockOrderCount > 0} />
        </CardContent>
      </Card>

      <section className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-border bg-card shadow-none">
          <CardHeader><CardTitle className="text-lg">{t("dashboard.recentTransactions")}</CardTitle></CardHeader>
          <CardContent className="divide-y divide-border">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                <div>
                  <p className="font-medium">{transaction.transactionNumber}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {transaction.creator.name} · {formatDateTime(transaction.transactionDate, { locale })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="text-sm text-muted-foreground">{translateTransactionStatus(transaction.type, locale)}</span>
                  <Badge variant={transaction.status === "REJECTED" ? "destructive" : "outline"}>
                    {translateTransactionStatus(transaction.status, locale)}
                  </Badge>
                </div>
              </div>
            ))}
            {recentTransactions.length === 0 ? <p className="text-sm text-muted-foreground">{t("transactions.emptyTitle")}</p> : null}
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-none">
          <CardHeader>
            <CardTitle className="text-lg">
              {currentUser.role === "SUPPLIER" ? t("restockOrders.tableTitle") : t("dashboard.lowStockProducts")}
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {currentUser.role === "SUPPLIER"
              ? recentRestocks.map((order) => (
                  <div key={order.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                    <div><p className="font-medium">{order.poNumber}</p><p className="mt-1 text-sm text-muted-foreground">{order.supplier.companyName}</p></div>
                    <Badge variant="outline">{translateRestockStatus(order.status, locale)}</Badge>
                  </div>
                ))
              : priorityProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                    <div><p className="font-medium">{product.name}</p><p className="mt-1 text-sm text-muted-foreground">{product.categoryName} · {product.currentStock}/{product.minimumStock}</p></div>
                    <StockStatusBadge status={getStockStatus(product.currentStock, product.minimumStock)} />
                  </div>
                ))}
            {currentUser.role !== "SUPPLIER" && priorityProducts.length === 0 ? <p className="text-sm text-muted-foreground">{t("dashboard.healthyThresholds")}</p> : null}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function Metric({ label, value, warning = false, danger = false }: { label: string; value: string; warning?: boolean; danger?: boolean }) {
  const tone = danger ? "text-destructive" : warning ? "text-warning" : "text-foreground";
  return (
    <div className="min-w-0">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`mt-2 truncate text-xl font-semibold sm:text-2xl ${tone}`}>{value}</p>
    </div>
  );
}
