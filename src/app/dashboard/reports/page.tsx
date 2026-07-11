import { FileBarChart2, Package, ReceiptText } from "lucide-react";

import { ExportButtons } from "@/components/dashboard/export-buttons";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDateTime } from "@/lib/formatters";
import { getServerTranslator } from "@/lib/i18n/server";
import { translateStockStatus, translateTransactionStatus } from "@/lib/i18n/status";
import { prisma } from "@/lib/prisma";
import { getStockStatus } from "@/lib/stock";
import { requireDashboardPathAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  await requireDashboardPathAccess("/dashboard/reports");
  const { locale, t } = await getServerTranslator();
  const [products, transactions] = await Promise.all([
    prisma.product.findMany({
      select: {
        name: true,
        sku: true,
        currentStock: true,
        minimumStock: true,
        unit: true,
        rackLocation: true,
        purchasePrice: true,
        sellingPrice: true,
        qrCode: true,
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [{ name: "asc" }],
    }),
    prisma.transaction.findMany({
      select: {
        transactionNumber: true,
        type: true,
        status: true,
        transactionDate: true,
        destination: true,
        notes: true,
        creator: {
          select: {
            name: true,
          },
        },
        approver: {
          select: {
            name: true,
          },
        },
        items: {
          select: {
            quantity: true,
            stockBefore: true,
            stockAfter: true,
            product: {
              select: {
                name: true,
                sku: true,
              },
            },
          },
        },
      },
      orderBy: [{ transactionDate: "desc" }],
    }),
  ]);

  const productRows = products.map((product) => ({
    name: product.name,
    sku: product.sku,
    category: product.category.name,
    currentStock: product.currentStock,
    minimumStock: product.minimumStock,
    stockStatus: translateStockStatus(
      getStockStatus(product.currentStock, product.minimumStock),
      locale
    ),
    unit: product.unit,
    rackLocation: product.rackLocation ?? "",
    purchasePrice: product.purchasePrice.toString(),
    sellingPrice: product.sellingPrice.toString(),
    qrCode: product.qrCode ?? product.sku,
  }));

  const transactionRows = transactions.flatMap((transaction) =>
    transaction.items.map((item) => ({
      transactionNumber: transaction.transactionNumber,
      type: translateTransactionStatus(transaction.type, locale),
      status: translateTransactionStatus(transaction.status, locale),
      transactionDate: transaction.transactionDate.toISOString(),
      creator: transaction.creator.name,
      approver: transaction.approver?.name ?? "",
      destination: transaction.destination ?? "",
      product: item.product.name,
      sku: item.product.sku,
      quantity: item.quantity,
      stockBefore: item.stockBefore,
      stockAfter: item.stockAfter,
      notes: transaction.notes ?? "",
    }))
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("reports.eyebrow")}
        title={t("reports.title")}
        description={t("reports.description")}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="stockwise-panel">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/8 text-primary ring-1 ring-primary/10">
                <Package className="size-5" />
              </div>
              <div>
                <CardTitle>{t("reports.productExport")}</CardTitle>
                <CardDescription>
                  {t("reports.productExportDescription")}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ExportButtons
              filenamePrefix="stockwise-products"
              rows={productRows}
              sheetName="Products"
            />
            <p className="text-sm text-muted-foreground">
              {t("reports.productRowsReady", { count: productRows.length })}
            </p>
          </CardContent>
        </Card>

        <Card className="stockwise-panel">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/8 text-primary ring-1 ring-primary/10">
                <ReceiptText className="size-5" />
              </div>
              <div>
                <CardTitle>{t("reports.transactionExport")}</CardTitle>
                <CardDescription>
                  {t("reports.transactionExportDescription")}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ExportButtons
              filenamePrefix="stockwise-transactions"
              rows={transactionRows}
              sheetName="Transactions"
            />
            <p className="text-sm text-muted-foreground">
              {t("reports.transactionRowsReady", { count: transactionRows.length })}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="stockwise-panel">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/8 text-primary ring-1 ring-primary/10">
              <FileBarChart2 className="size-5" />
            </div>
            <div>
              <CardTitle>{t("reports.recentContext")}</CardTitle>
              <CardDescription>
                {t("reports.recentContextDescription")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {transactions.slice(0, 5).map((transaction) => (
            <div
              key={transaction.transactionNumber}
            className="rounded-2xl border border-border/70 bg-muted/25 p-4 transition-colors hover:bg-muted/38"
            >
              <p className="font-medium">{transaction.transactionNumber}</p>
              <p className="text-sm text-muted-foreground">
                {translateTransactionStatus(transaction.type, locale)} -{" "}
                {translateTransactionStatus(transaction.status, locale)} -{" "}
                {formatDateTime(transaction.transactionDate, { locale })}
              </p>
            </div>
          ))}
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("reports.noTransactionExport")}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
