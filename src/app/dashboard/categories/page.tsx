import { FolderSearch } from "lucide-react";

import { deleteCategory } from "@/app/dashboard/categories/actions";
import { CategoryFormDialog } from "@/components/dashboard/category-form-dialog";
import { DataEmptyState } from "@/components/dashboard/data-empty-state";
import { DeleteConfirmDialog } from "@/components/dashboard/delete-confirm-dialog";
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
import { getServerTranslator } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const CATEGORY_TABLE_LIMIT = 50;

export default async function CategoriesPage() {
  const { locale, t } = await getServerTranslator();
  const categories = await prisma.category.findMany({
    take: CATEGORY_TABLE_LIMIT,
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      imageUrl: true,
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
        eyebrow={t("categories.eyebrow")}
        title={t("categories.title")}
        description={t("categories.description")}
        action={<CategoryFormDialog mode="create" />}
      />

      {categories.length === 0 ? (
        <DataEmptyState
          icon={FolderSearch}
          title={t("categories.emptyTitle")}
          description={t("categories.emptyDescription")}
          hint={t("categories.emptyHint")}
        />
      ) : (
        <Card className="border-border/70 bg-background/80 shadow-sm shadow-black/5">
          <CardHeader>
            <CardTitle>{t("categories.tableTitle")}</CardTitle>
            <CardDescription>
              {t("categories.tableDescription", { count: categories.length })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("categories.eyebrow")}</TableHead>
                  <TableHead>{t("categories.slug")}</TableHead>
                  <TableHead>{t("categories.descriptionLabel")}</TableHead>
                  <TableHead>{t("categories.products")}</TableHead>
                  <TableHead>{t("categories.created")}</TableHead>
                  <TableHead className="text-right">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.slug}</TableCell>
                    <TableCell className="min-w-72 whitespace-normal text-sm leading-6 text-muted-foreground">
                      {category.description ?? t("common.noDescription")}
                    </TableCell>
                    <TableCell>{category._count.products}</TableCell>
                    <TableCell>{formatDate(category.createdAt, { locale })}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <CategoryFormDialog
                          mode="edit"
                          category={{
                            id: category.id,
                            name: category.name,
                            slug: category.slug,
                            description: category.description,
                            imageUrl: category.imageUrl,
                          }}
                        />
                        <DeleteConfirmDialog
                          action={deleteCategory}
                          description="Delete this category only if it no longer has any products assigned to it."
                          entityId={category.id}
                          entityLabel={category.name}
                          title={t("categories.deleteCategory")}
                        />
                      </div>
                    </TableCell>
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
