import { Building2, PackageCheck, Star, UsersRound } from "lucide-react";

import { deleteSupplier } from "@/app/dashboard/suppliers/actions";
import { DataEmptyState } from "@/components/dashboard/data-empty-state";
import { DeleteConfirmDialog } from "@/components/dashboard/delete-confirm-dialog";
import { PageHeader } from "@/components/dashboard/page-header";
import { SupplierFormDialog } from "@/components/dashboard/supplier-form-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { getCurrentUser } from "@/lib/auth";
import { formatDate } from "@/lib/formatters";
import { getServerTranslator } from "@/lib/i18n/server";
import { translateUserStatus } from "@/lib/i18n/status";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const SUPPLIER_TABLE_LIMIT = 20;

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "ACTIVE":
      return "default";
    case "PENDING":
      return "secondary";
    case "REJECTED":
    case "INACTIVE":
      return "destructive";
    default:
      return "outline";
  }
}

export default async function SuppliersPage() {
  const { locale, t } = await getServerTranslator();
  const currentUser = await getCurrentUser();
  const [
    suppliers,
    supplierCount,
    activeCount,
    pendingCount,
    activeRestockCount,
    ratingsAggregate,
  ] = await Promise.all([
    prisma.supplier.findMany({
      take: SUPPLIER_TABLE_LIMIT,
      select: {
        id: true,
        companyName: true,
        address: true,
        contactPerson: true,
        phone: true,
        supplierCategory: true,
        bankAccount: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
            status: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            restockOrders: true,
            supplierRatings: true,
          },
        },
        restockOrders: {
          take: 1,
          select: {
            poNumber: true,
          },
          orderBy: {
            orderDate: "desc",
          },
        },
        supplierRatings: {
          select: {
            rating: true,
          },
        },
      },
      orderBy: [{ companyName: "asc" }],
    }),
    prisma.supplier.count(),
    prisma.supplier.count({
      where: {
        user: {
          status: "ACTIVE",
        },
      },
    }),
    prisma.supplier.count({
      where: {
        user: {
          status: "PENDING",
        },
      },
    }),
    prisma.restockOrder.count({
      where: {
        status: {
          in: ["PENDING", "CONFIRMED", "IN_TRANSIT"],
        },
      },
    }),
    prisma.supplierRating.aggregate({
      _avg: {
        rating: true,
      },
    }),
  ]);

  const averageRating = ratingsAggregate._avg.rating;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("suppliers.eyebrow")}
        title={t("suppliers.title")}
        description={t("suppliers.description")}
        action={currentUser?.role === "ADMIN" ? <SupplierFormDialog mode="create" /> : null}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/70 bg-background/80 shadow-sm shadow-black/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">
                {t("suppliers.accounts")}
              </CardTitle>
              <CardDescription>{t("suppliers.accountsDescription")}</CardDescription>
            </div>
            <UsersRound className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">
              {supplierCount}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-background/80 shadow-sm shadow-black/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">{t("suppliers.active")}</CardTitle>
              <CardDescription>{t("suppliers.activeDescription")}</CardDescription>
            </div>
            <Building2 className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">
              {activeCount}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("suppliers.pendingReview", { count: pendingCount })}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-background/80 shadow-sm shadow-black/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">{t("suppliers.openRestocks")}</CardTitle>
              <CardDescription>{t("suppliers.openRestocksDescription")}</CardDescription>
            </div>
            <PackageCheck className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">
              {activeRestockCount}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-background/80 shadow-sm shadow-black/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">{t("suppliers.averageRating")}</CardTitle>
              <CardDescription>{t("suppliers.averageRatingDescription")}</CardDescription>
            </div>
            <Star className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">
              {averageRating ? averageRating.toFixed(1) : "-"}
            </p>
          </CardContent>
        </Card>
      </div>

      {suppliers.length === 0 ? (
        <DataEmptyState
          icon={UsersRound}
          title={t("suppliers.emptyTitle")}
          description={t("suppliers.emptyDescription")}
          hint={t("suppliers.emptyHint")}
        />
      ) : (
        <Card className="border-border/70 bg-background/80 shadow-sm shadow-black/5">
          <CardHeader>
            <CardTitle>{t("suppliers.tableTitle")}</CardTitle>
            <CardDescription>
              {t("suppliers.tableDescription", { count: suppliers.length })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("suppliers.supplier")}</TableHead>
                  <TableHead>{t("suppliers.account")}</TableHead>
                  <TableHead>{t("suppliers.category")}</TableHead>
                  <TableHead>{t("suppliers.restocks")}</TableHead>
                  <TableHead>{t("suppliers.rating")}</TableHead>
                  <TableHead>{t("suppliers.created")}</TableHead>
                  <TableHead className="text-right">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((supplier) => {
                  const lastOrder = supplier.restockOrders[0];
                  const averageSupplierRating =
                    supplier.supplierRatings.length > 0
                      ? supplier.supplierRatings.reduce(
                          (total, rating) => total + rating.rating,
                          0
                        ) / supplier.supplierRatings.length
                      : null;

                  return (
                    <TableRow key={supplier.id}>
                      <TableCell className="min-w-72">
                        <div className="flex items-start gap-3">
                          <Avatar className="size-10">
                            <AvatarImage
                              src={supplier.user.avatarUrl ?? undefined}
                              alt={supplier.companyName}
                            />
                            <AvatarFallback>
                              {supplier.companyName.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <p className="font-medium">{supplier.companyName}</p>
                            <p className="text-sm text-muted-foreground">
                              {supplier.contactPerson ?? supplier.user.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {supplier.phone ?? t("suppliers.noPhone")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {supplier.address ?? t("suppliers.noAddress")}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="min-w-56">
                        <div className="space-y-2">
                          <div className="space-y-1">
                            <p className="font-medium">{supplier.user.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {supplier.user.email}
                            </p>
                          </div>
                          <Badge variant={getStatusBadgeVariant(supplier.user.status)}>
                            {translateUserStatus(supplier.user.status, locale)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p>{supplier.supplierCategory ?? "-"}</p>
                          <p className="text-xs text-muted-foreground">
                            {supplier.bankAccount ?? t("suppliers.noBankAccount")}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">
                            {t("suppliers.total", { count: supplier._count.restockOrders })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {supplier._count.restockOrders > 0
                              ? t("suppliers.recentOrderTracked")
                              : t("suppliers.noOrdersYet")}
                            {lastOrder
                              ? ` • ${t("suppliers.lastOrder", { poNumber: lastOrder.poNumber })}`
                              : ""}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">
                            {averageSupplierRating
                              ? `${averageSupplierRating.toFixed(1)} / 5`
                              : t("suppliers.noRatingsYet")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t("suppliers.recordedReviews", {
                              count: supplier._count.supplierRatings,
                            })}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(supplier.createdAt, { locale })}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {currentUser?.role === "ADMIN" ? (
                            <>
                              <SupplierFormDialog
                                mode="edit"
                                supplier={{
                                  id: supplier.id,
                                  name: supplier.user.name,
                                  email: supplier.user.email,
                                  status: supplier.user.status,
                                  companyName: supplier.companyName,
                                  contactPerson: supplier.contactPerson,
                                  phone: supplier.phone,
                                  supplierCategory: supplier.supplierCategory,
                                  bankAccount: supplier.bankAccount,
                                  address: supplier.address,
                                  avatarUrl: supplier.user.avatarUrl,
                                }}
                              />
                              <DeleteConfirmDialog
                                action={deleteSupplier}
                                description="Delete this supplier only when it has no operational history, restock references, or retained audit data."
                                entityId={supplier.id}
                                entityLabel={supplier.companyName}
                                title={t("suppliers.deleteSupplier")}
                              />
                            </>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              {t("common.readOnly")}
                            </span>
                          )}
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
