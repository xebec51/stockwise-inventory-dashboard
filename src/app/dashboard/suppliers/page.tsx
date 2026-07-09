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
  const suppliers = await prisma.supplier.findMany({
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
        select: {
          id: true,
          status: true,
          orderDate: true,
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
  });

  const summary = suppliers.reduce(
    (accumulator, supplier) => {
      if (supplier.user.status === "ACTIVE") {
        accumulator.active += 1;
      }

      if (supplier.user.status === "PENDING") {
        accumulator.pending += 1;
      }

      const liveRestocks = supplier.restockOrders.filter((order) =>
        ["PENDING", "CONFIRMED", "IN_TRANSIT"].includes(order.status)
      ).length;

      accumulator.activeRestocks += liveRestocks;

      supplier.supplierRatings.forEach((rating) => {
        accumulator.ratingTotal += rating.rating;
        accumulator.ratingCount += 1;
      });

      return accumulator;
    },
    {
      active: 0,
      pending: 0,
      activeRestocks: 0,
      ratingTotal: 0,
      ratingCount: 0,
    }
  );

  const averageRating =
    summary.ratingCount > 0 ? summary.ratingTotal / summary.ratingCount : null;

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
              {suppliers.length}
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
              {summary.active}
            </p>
            <p className="text-sm text-muted-foreground">
              {summary.pending} pending review
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
              {summary.activeRestocks}
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
              {suppliers.length} supplier
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
                  const activeRestocks = supplier.restockOrders.filter((order) =>
                    ["PENDING", "CONFIRMED", "IN_TRANSIT"].includes(order.status)
                  ).length;
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
                            {activeRestocks} open
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
