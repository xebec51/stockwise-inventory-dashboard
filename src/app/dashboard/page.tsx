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
import { formatCurrency, formatDateTime, formatStatusLabel } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";
import { getStockStatus } from "@/lib/stock";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

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
  const [products, transactions, recentTransactions, restockOrders] =
    await Promise.all([
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
        select: {
          id: true,
          type: true,
          status: true,
          transactionDate: true,
          items: {
            select: {
              quantity: true,
            },
          },
        },
      }),
      prisma.transaction.findMany({
        take: 6,
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
      prisma.restockOrder.findMany({
        select: {
          id: true,
          status: true,
        },
      }),
    ]);

  const lowStockProducts = products
    .filter((product) => product.currentStock <= product.minimumStock)
    .sort((left, right) => left.currentStock - right.currentStock)
    .slice(0, 6);

  const totalInventoryValue = products.reduce(
    (total, product) =>
      total + Number(product.purchasePrice) * product.currentStock,
    0
  );

  const lowStockCount = products.filter(
    (product) =>
      getStockStatus(product.currentStock, product.minimumStock) === "LOW_STOCK"
  ).length;

  const outOfStockCount = products.filter(
    (product) =>
      getStockStatus(product.currentStock, product.minimumStock) === "OUT_OF_STOCK"
  ).length;

  const pendingTransactionCount = transactions.filter(
    (transaction) => transaction.status === "PENDING"
  ).length;

  const activeRestockOrderCount = restockOrders.filter((order) =>
    ["PENDING", "CONFIRMED", "IN_TRANSIT"].includes(order.status)
  ).length;

  const inventoryByCategoryMap = new Map<string, number>();

  products.forEach((product) => {
    const currentValue =
      inventoryByCategoryMap.get(product.category.name) ?? 0;
    const productValue = Number(product.purchasePrice) * product.currentStock;

    inventoryByCategoryMap.set(product.category.name, currentValue + productValue);
  });

  const inventoryByCategory = [...inventoryByCategoryMap.entries()]
    .map(([name, value]) => ({
      name,
      value,
    }))
    .sort((left, right) => right.value - left.value);

  const movementMap = new Map<string, { label: string; incoming: number; outgoing: number }>();

  transactions
    .filter((transaction) =>
      ["APPROVED", "COMPLETED"].includes(transaction.status)
    )
    .forEach((transaction) => {
      const monthKey = new Intl.DateTimeFormat("en-US", {
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
        eyebrow="Overview"
        title="Warehouse command center"
        description="Live inventory, replenishment, and approval signals now roll up into the StockWise dashboard from the Prisma-backed warehouse dataset."
        action={
          <Link
            href="/dashboard/transactions"
            className={cn(buttonVariants({ variant: "default", size: "sm" }))}
          >
            Review transactions
            <ArrowRight className="size-4" />
          </Link>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="border-border/70 bg-background/80 shadow-sm shadow-black/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <CardDescription>Catalog items in the warehouse</CardDescription>
            </div>
            <Boxes className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">{products.length}</p>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-background/80 shadow-sm shadow-black/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">
                Inventory Value
              </CardTitle>
              <CardDescription>Based on purchase price and stock</CardDescription>
            </div>
            <Wallet className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">
              {formatCurrency(totalInventoryValue)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-background/80 shadow-sm shadow-black/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <CardDescription>Products at or below minimum stock</CardDescription>
            </div>
            <AlertTriangle className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">{lowStockCount}</p>
            <p className="text-sm text-muted-foreground">
              {outOfStockCount} currently out of stock
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-background/80 shadow-sm shadow-black/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">
                Pending Transactions
              </CardTitle>
              <CardDescription>Awaiting approval workflow</CardDescription>
            </div>
            <ClipboardList className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">
              {pendingTransactionCount}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-background/80 shadow-sm shadow-black/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">
                Active Restocks
              </CardTitle>
              <CardDescription>Open supplier replenishment orders</CardDescription>
            </div>
            <PackageCheck className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">
              {activeRestockOrderCount}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-background/80 shadow-sm shadow-black/5">
          <CardHeader className="space-y-1">
            <CardTitle className="text-sm font-medium">
              Stock Pressure
            </CardTitle>
            <CardDescription>Immediate product attention needed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {lowStockProducts.slice(0, 3).map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between rounded-xl border border-border/70 px-3 py-2"
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
                No low-stock products right now.
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
        <Card className="border-border/70 bg-background/80 shadow-sm shadow-black/5">
          <CardHeader>
            <CardTitle>Recent transactions</CardTitle>
            <CardDescription>
              The latest warehouse movements across incoming and outgoing flow.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="rounded-2xl border border-border/70 bg-muted/25 p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{transaction.transactionNumber}</p>
                  <Badge variant="outline">
                    {formatStatusLabel(transaction.type)}
                  </Badge>
                  <Badge variant={getStatusBadgeVariant(transaction.status)}>
                    {formatStatusLabel(transaction.status)}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {transaction.creator.name} • {formatDateTime(transaction.transactionDate)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {transaction.destination ?? "No destination recorded"}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-background/80 shadow-sm shadow-black/5">
          <CardHeader>
            <CardTitle>Low stock products</CardTitle>
            <CardDescription>
              Products at risk of stockout based on current thresholds.
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
                  className="rounded-2xl border border-border/70 bg-muted/25 p-4"
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
                      {formatStatusLabel(status)}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Current stock {product.currentStock} • Minimum {product.minimumStock}
                  </p>
                </div>
              );
            })}
            {lowStockProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Inventory thresholds look healthy across the catalog.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
