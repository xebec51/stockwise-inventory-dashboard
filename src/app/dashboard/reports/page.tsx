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
import { prisma } from "@/lib/prisma";
import { getStockStatus } from "@/lib/stock";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
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
    stockStatus: getStockStatus(product.currentStock, product.minimumStock),
    unit: product.unit,
    rackLocation: product.rackLocation ?? "",
    purchasePrice: product.purchasePrice.toString(),
    sellingPrice: product.sellingPrice.toString(),
    qrCode: product.qrCode ?? product.sku,
  }));

  const transactionRows = transactions.flatMap((transaction) =>
    transaction.items.map((item) => ({
      transactionNumber: transaction.transactionNumber,
      type: transaction.type,
      status: transaction.status,
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
        eyebrow="Reports"
        title="Export and analytics workspace"
        description="Reporting now includes real CSV/XLSX export entry points for warehouse products and transaction history using the current Prisma-backed dataset."
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="border-border/70 bg-background/80 shadow-sm shadow-black/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/8 text-primary ring-1 ring-primary/10">
                <Package className="size-5" />
              </div>
              <div>
                <CardTitle>Product export</CardTitle>
                <CardDescription>
                  Catalog, stock thresholds, pricing, rack locations, and QR values.
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
              {productRows.length} product row{productRows.length === 1 ? "" : "s"} ready for spreadsheet export.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-background/80 shadow-sm shadow-black/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/8 text-primary ring-1 ring-primary/10">
                <ReceiptText className="size-5" />
              </div>
              <div>
                <CardTitle>Transaction export</CardTitle>
                <CardDescription>
                  Flattened movement history with item quantities and stock audit fields.
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
              {transactionRows.length} transaction line
              {transactionRows.length === 1 ? "" : "s"} ready for spreadsheet export.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/70 bg-background/80 shadow-sm shadow-black/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/8 text-primary ring-1 ring-primary/10">
              <FileBarChart2 className="size-5" />
            </div>
            <div>
              <CardTitle>Recent export context</CardTitle>
              <CardDescription>
                Quick visibility into the newest transaction records that would be included in the export.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {transactions.slice(0, 5).map((transaction) => (
            <div
              key={transaction.transactionNumber}
              className="rounded-2xl border border-border/70 bg-muted/25 p-4"
            >
              <p className="font-medium">{transaction.transactionNumber}</p>
              <p className="text-sm text-muted-foreground">
                {transaction.type} • {transaction.status} •{" "}
                {formatDateTime(transaction.transactionDate)}
              </p>
            </div>
          ))}
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No transaction records are available for export yet.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
