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
import { formatDate, formatStatusLabel } from "@/lib/formatters";
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
  const currentUser = await getCurrentUser();
  const [
    suppliers,
    supplierCount,
    activeCount,
    pendingCount,
    activeRestockCount,
    ratingsAggregate,
  ] =
    await Promise.all([
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
        eyebrow="Suppliers"
        title="Supplier relationship workspace"
        description="Supplier profiles now load from Prisma with linked account status, contact data, restock activity, and rating context for the next workflow phases."
        action={currentUser?.role === "ADMIN" ? <SupplierFormDialog mode="create" /> : null}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/70 bg-background/80 shadow-sm shadow-black/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">
                Supplier Accounts
              </CardTitle>
              <CardDescription>Total linked supplier profiles</CardDescription>
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
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <CardDescription>Accounts ready for live coordination</CardDescription>
            </div>
            <Building2 className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">
              {activeCount}
            </p>
            <p className="text-sm text-muted-foreground">
              {pendingCount} pending review
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-background/80 shadow-sm shadow-black/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">Open Restocks</CardTitle>
              <CardDescription>Pending, confirmed, or in transit</CardDescription>
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
              <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
              <CardDescription>Supplier feedback from received orders</CardDescription>
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
          title="No suppliers available yet"
          description="Supplier management is connected, but there are no supplier profiles in the database to display."
          hint="Create the first supplier account here to prepare for restock workflows and supplier-facing status changes."
        />
      ) : (
        <Card className="border-border/70 bg-background/80 shadow-sm shadow-black/5">
          <CardHeader>
            <CardTitle>Supplier directory</CardTitle>
            <CardDescription>
              Showing {suppliers.length} supplier
              {suppliers.length === 1 ? "" : "s"} connected to user accounts and
              future restock coordination.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Restocks</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                              {supplier.phone ?? "No phone provided"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {supplier.address ?? "No address provided"}
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
                            {formatStatusLabel(supplier.user.status)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p>{supplier.supplierCategory ?? "-"}</p>
                          <p className="text-xs text-muted-foreground">
                            {supplier.bankAccount ?? "No bank account recorded"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">
                            {supplier._count.restockOrders} total
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {supplier._count.restockOrders > 0
                              ? "Recent order tracked"
                              : "No orders yet"}
                            {lastOrder ? ` • Last ${lastOrder.poNumber}` : ""}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">
                            {averageSupplierRating
                              ? `${averageSupplierRating.toFixed(1)} / 5`
                              : "No ratings yet"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {supplier._count.supplierRatings} recorded review
                            {supplier._count.supplierRatings === 1 ? "" : "s"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(supplier.createdAt)}</TableCell>
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
                                title="Delete supplier"
                              />
                            </>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Read only
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
