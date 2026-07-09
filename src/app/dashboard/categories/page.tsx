import { FolderSearch } from "lucide-react";

import { DataEmptyState } from "@/components/dashboard/data-empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
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
import { formatDate } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      createdAt: true,
      _count: {
        select: {
          products: true,
        },
      },
    },
    orderBy: [{ name: "asc" }],
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Categories"
        title="Inventory classification layer"
        description="Category records are now loaded from Prisma to show taxonomy structure, slugs, descriptions, and live product counts."
      />

      {categories.length === 0 ? (
        <DataEmptyState
          icon={FolderSearch}
          title="No categories available yet"
          description="The category read view is connected and ready, but the database does not contain any category records yet."
          hint="Run the demo seed or add category management later to populate this area."
        />
      ) : (
        <Card className="border-border/70 bg-background/80 shadow-sm shadow-black/5">
          <CardHeader>
            <CardTitle>Category catalog</CardTitle>
            <CardDescription>
              {categories.length} categor{categories.length === 1 ? "y" : "ies"}{" "}
              currently structure the product catalog.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.slug}</TableCell>
                    <TableCell className="min-w-72 whitespace-normal text-sm leading-6 text-muted-foreground">
                      {category.description ?? "No description provided yet."}
                    </TableCell>
                    <TableCell>{category._count.products}</TableCell>
                    <TableCell>{formatDate(category.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
