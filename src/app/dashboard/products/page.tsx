import { PackageSearch } from "lucide-react";

import { deleteProduct } from "@/app/dashboard/products/actions";
import { DataEmptyState } from "@/components/dashboard/data-empty-state";
import { DeleteConfirmDialog } from "@/components/dashboard/delete-confirm-dialog";
import { ExportButtons } from "@/components/dashboard/export-buttons";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProductFormSheet } from "@/components/dashboard/product-form-sheet";
import { ProductQrDialog } from "@/components/dashboard/product-qr-dialog";
import { StockStatusBadge } from "@/components/dashboard/stock-status-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireDashboardPathAccess } from "@/lib/auth";
import { formatCurrency } from "@/lib/formatters";
import { getServerTranslator } from "@/lib/i18n/server";
import { translateStockStatus } from "@/lib/i18n/status";
import { prisma } from "@/lib/prisma";
import { getStockStatus } from "@/lib/stock";

export const dynamic = "force-dynamic";

const PRODUCT_TABLE_LIMIT = 50;

export default async function ProductsPage() {
  const currentUser = await requireDashboardPathAccess("/dashboard/products");
  const { locale, t } = await getServerTranslator();
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      take: PRODUCT_TABLE_LIMIT,
      select: {
        id: true,
        categoryId: true,
        name: true,
        sku: true,
        description: true,
        currentStock: true,
        minimumStock: true,
        unit: true,
        rackLocation: true,
        imageUrl: true,
        purchasePrice: true,
        qrCode: true,
        sellingPrice: true,
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [{ createdAt: "desc" }, { name: "asc" }],
    }),
    prisma.category.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: [{ name: "asc" }],
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("products.eyebrow")}
        title={t("products.title")}
        description={t("products.description")}
        action={
          <div className="flex flex-wrap justify-end gap-2">
            {currentUser && currentUser.role !== "STAFF" ? (
              <ExportButtons
                filenamePrefix="stockwise-products"
                rows={products.map((product) => ({
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
                  rackLocation: product.rackLocation,
                  purchasePrice: product.purchasePrice.toString(),
                  sellingPrice: product.sellingPrice.toString(),
                  qrCode: product.qrCode ?? product.sku,
                }))}
                sheetName="Products"
              />
            ) : null}
            {currentUser?.role === "ADMIN" ? (
              <ProductFormSheet categories={categories} mode="create" />
            ) : null}
          </div>
        }
      />

      {products.length === 0 ? (
        <DataEmptyState
          icon={PackageSearch}
          title={t("products.emptyTitle")}
          description={t("products.emptyDescription")}
          hint={t("products.emptyHint")}
        />
      ) : (
        <Card className="stockwise-panel">
          <CardHeader>
            <CardTitle>{t("products.tableTitle")}</CardTitle>
            <CardDescription>
              {t("products.tableDescription", { count: products.length })}
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("products.product")}</TableHead>
                  <TableHead>{t("products.category")}</TableHead>
                  <TableHead>{t("products.stock")}</TableHead>
                  <TableHead>{t("products.status")}</TableHead>
                  <TableHead className="text-right">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const status = getStockStatus(
                    product.currentStock,
                    product.minimumStock
                  );

                  return (
                    <TableRow key={product.id}>
                      <TableCell className="min-w-52">
                        <div className="space-y-1">
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            SKU: {product.sku}
                          </p>
                          <details className="pt-1 text-xs text-muted-foreground">
                            <summary className="cursor-pointer font-medium text-foreground">
                              {t("common.details")}
                            </summary>
                            <div className="mt-2 space-y-1">
                              <p>{t("products.rack")}: {product.rackLocation ?? "-"}</p>
                              <p>{t("products.purchase")}: {formatCurrency(product.purchasePrice.toString(), { locale })}</p>
                              <p>{t("products.selling")}: {formatCurrency(product.sellingPrice.toString(), { locale })}</p>
                            </div>
                          </details>
                        </div>
                      </TableCell>
                      <TableCell>{product.category.name}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{product.currentStock}</p>
                          <p className="text-xs text-muted-foreground">
                            {t("products.minimum", { count: product.minimumStock })}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StockStatusBadge status={status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <ProductQrDialog
                            label={product.name}
                            value={product.qrCode ?? product.sku}
                          />
                          {currentUser?.role === "ADMIN" ? (
                            <>
                              <ProductFormSheet
                                categories={categories}
                                mode="edit"
                                product={{
                                  id: product.id,
                                  categoryId: product.categoryId,
                                  name: product.name,
                                  sku: product.sku,
                                  description: product.description,
                                  purchasePrice: product.purchasePrice.toString(),
                                  sellingPrice: product.sellingPrice.toString(),
                                  currentStock: product.currentStock,
                                  minimumStock: product.minimumStock,
                                  unit: product.unit,
                                  rackLocation: product.rackLocation,
                                  imageUrl: product.imageUrl,
                                  qrCode: product.qrCode,
                                }}
                              />
                              <DeleteConfirmDialog
                                action={deleteProduct}
                                entityId={product.id}
                                entityLabel={product.name}
                                title={t("products.deleteProduct")}
                              />
                            </>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
