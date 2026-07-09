import { PackageSearch } from "lucide-react";

import { DataEmptyState } from "@/components/dashboard/data-empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
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
      name: true,
      sku: true,
      currentStock: true,
      minimumStock: true,
      unit: true,
      rackLocation: true,
      purchasePrice: true,
      sellingPrice: true,
      category: {
        select: {
          name: true,
        },
      },
    },
    orderBy: [{ createdAt: "desc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Products"
        title="Product catalog workspace"
        description="Live product data now flows from Prisma into the dashboard, including stock context, category assignment, warehouse location, and pricing references."
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
