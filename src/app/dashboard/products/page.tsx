import { PackageSearch } from "lucide-react";

import { deleteProduct } from "@/app/dashboard/products/actions";
import { DataEmptyState } from "@/components/dashboard/data-empty-state";
import { DeleteConfirmDialog } from "@/components/dashboard/delete-confirm-dialog";
import { ExportButtons } from "@/components/dashboard/export-buttons";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProductQrDialog } from "@/components/dashboard/product-qr-dialog";
import { ProductFormDialog } from "@/components/dashboard/product-form-dialog";
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
import { formatCurrency } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";
import { getStockStatus } from "@/lib/stock";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
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
  });

  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: [{ name: "asc" }],
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Products"
        title="Product catalog workspace"
        description="Live product data now flows from Prisma into the dashboard, including stock context, category assignment, warehouse location, and pricing references."
        action={
          <div className="flex flex-wrap justify-end gap-2">
            <ExportButtons
              filenamePrefix="stockwise-products"
              rows={products.map((product) => ({
                name: product.name,
                sku: product.sku,
                category: product.category.name,
                currentStock: product.currentStock,
                minimumStock: product.minimumStock,
                stockStatus: getStockStatus(
                  product.currentStock,
                  product.minimumStock
                ),
                unit: product.unit,
                rackLocation: product.rackLocation,
                purchasePrice: product.purchasePrice.toString(),
                sellingPrice: product.sellingPrice.toString(),
                qrCode: product.qrCode ?? product.sku,
              }))}
              sheetName="Products"
            />
            <ProductFormDialog categories={categories} mode="create" />
          </div>
        }
      />

      {products.length === 0 ? (
        <DataEmptyState
          icon={PackageSearch}
          title="No products available yet"
          description="The product read view is connected and ready, but there are no catalog records in the database to display."
          hint="Run the demo seed or create product management flows in a later phase to populate this table."
        />
      ) : (
        <Card className="border-border/70 bg-background/80 shadow-sm shadow-black/5">
          <CardHeader>
            <CardTitle>Product inventory</CardTitle>
            <CardDescription>
              {products.length} product{products.length === 1 ? "" : "s"} loaded
              from the warehouse catalog.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Rack</TableHead>
                  <TableHead className="text-right">Purchase</TableHead>
                  <TableHead className="text-right">Selling</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                        </div>
                      </TableCell>
                      <TableCell>{product.category.name}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{product.currentStock}</p>
                          <p className="text-xs text-muted-foreground">
                            Minimum {product.minimumStock}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StockStatusBadge status={status} />
                      </TableCell>
                      <TableCell>{product.unit}</TableCell>
                      <TableCell>{product.rackLocation ?? "-"}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(product.purchasePrice.toString())}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(product.sellingPrice.toString())}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <ProductQrDialog
                            label={product.name}
                            value={product.qrCode ?? product.sku}
                          />
                          <ProductFormDialog
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
                            description="Delete this product from the catalog. Stock status remains computed and will disappear with the record."
                            entityId={product.id}
                            entityLabel={product.name}
                            title="Delete product"
                          />
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
