import {
  CircleCheckBig,
  Truck,
} from "lucide-react";

import { DataEmptyState } from "@/components/dashboard/data-empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { RestockOrderFormSheet } from "@/components/dashboard/restock-order-form-sheet";
import { RestockOrderStatusDialog } from "@/components/dashboard/restock-order-status-dialog";
import { SupplierRatingFormDialog } from "@/components/dashboard/supplier-rating-form-dialog";
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
import { requireDashboardPathAccess } from "@/lib/auth";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/formatters";
import { getServerTranslator } from "@/lib/i18n/server";
import { translateRestockStatus, translateRole } from "@/lib/i18n/status";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const RESTOCK_ORDER_TABLE_LIMIT = 20;

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "PENDING":
      return "secondary";
    case "CONFIRMED":
    case "RECEIVED":
      return "default";
    case "REJECTED":
      return "destructive";
    case "IN_TRANSIT":
      return "outline";
    default:
      return "outline";
  }
}

export default async function RestockOrdersPage() {
  const currentUser = await requireDashboardPathAccess("/dashboard/restock-orders");
  const { locale, t } = await getServerTranslator();
  const restockOrderWhere =
    currentUser?.role === "SUPPLIER"
      ? {
          supplier: {
            userId: currentUser.id,
          },
        }
      : currentUser?.role === "MANAGER"
        ? {
            managerId: currentUser.id,
          }
        : undefined;

  const [
    restockOrders,
    suppliers,
    products,
    pendingCount,
    inTransitCount,
    receivedCount,
    rejectedCount,
  ] = await Promise.all([
    prisma.restockOrder.findMany({
      where: restockOrderWhere,
      take: RESTOCK_ORDER_TABLE_LIMIT,
      select: {
        id: true,
        poNumber: true,
        status: true,
        orderDate: true,
        expectedDeliveryDate: true,
        confirmedAt: true,
        receivedAt: true,
        notes: true,
        manager: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        supplier: {
          select: {
            id: true,
            companyName: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        items: {
          select: {
            id: true,
            quantity: true,
            estimatedPrice: true,
            product: {
              select: {
                name: true,
                sku: true,
                unit: true,
              },
            },
          },
        },
        sourceTransaction: {
          select: {
            transactionNumber: true,
          },
        },
        supplierRating: {
          select: {
            id: true,
            rating: true,
            feedback: true,
          },
        },
      },
      orderBy: [{ orderDate: "desc" }, { createdAt: "desc" }],
    }),
    prisma.supplier.findMany({
      where: {
        user: {
          status: "ACTIVE",
          role: "SUPPLIER",
        },
      },
      select: {
        id: true,
        companyName: true,
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [{ companyName: "asc" }],
    }),
    prisma.product.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        unit: true,
      },
      orderBy: [{ name: "asc" }],
    }),
    prisma.restockOrder.count({
      where: {
        ...restockOrderWhere,
        status: "PENDING",
      },
    }),
    prisma.restockOrder.count({
      where: {
        ...restockOrderWhere,
        status: "IN_TRANSIT",
      },
    }),
    prisma.restockOrder.count({
      where: {
        ...restockOrderWhere,
        status: "RECEIVED",
      },
    }),
    prisma.restockOrder.count({
      where: {
        ...restockOrderWhere,
        status: "REJECTED",
      },
    }),
  ]);

  const canCreateRestockOrders =
    currentUser?.role === "ADMIN" || currentUser?.role === "MANAGER";
  const isSupplier = currentUser?.role === "SUPPLIER";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("restockOrders.eyebrow")}
        title={t("restockOrders.title")}
        description={t("restockOrders.description")}
        action={
          canCreateRestockOrders && currentUser ? (
            <RestockOrderFormSheet
              currentUser={currentUser}
              products={products}
              suppliers={suppliers.map((supplier) => ({
                id: supplier.id,
                companyName: supplier.companyName,
                contactName: supplier.user.name,
              }))}
            />
          ) : null
        }
      />

      <Card className="border-border bg-card shadow-none">
        <CardContent className="grid gap-6 pt-6 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryValue label={t("restockOrders.pending")} value={pendingCount} warning />
          <SummaryValue label={t("restockOrders.inTransit")} value={inTransitCount} />
          <SummaryValue label={t("restockOrders.received")} value={receivedCount} />
          <SummaryValue label={t("restockOrders.rejected")} value={rejectedCount} />
        </CardContent>
      </Card>

      {restockOrders.length === 0 ? (
        <DataEmptyState
          icon={Truck}
          title={t("restockOrders.emptyTitle")}
          description={t("restockOrders.emptyDescription")}
          hint={t("restockOrders.emptyHint")}
        />
      ) : (
        <Card className="stockwise-panel">
          <CardHeader>
            <CardTitle>{t("restockOrders.tableTitle")}</CardTitle>
            <CardDescription>
              {t("restockOrders.tableDescription", { count: restockOrders.length })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("restockOrders.order")}</TableHead>
                  <TableHead>{t("restockOrders.supplier")}</TableHead>
                  <TableHead>{t("restockOrders.timeline")}</TableHead>
                  <TableHead>{t("restockOrders.rating")}</TableHead>
                  <TableHead className="text-right">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {restockOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="min-w-64">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{order.poNumber}</p>
                          <Badge variant={getStatusBadgeVariant(order.status)}>
                            {translateRestockStatus(order.status, locale)}
                          </Badge>
                          {order.sourceTransaction ? (
                            <Badge variant="outline">
                              {order.sourceTransaction.transactionNumber}
                            </Badge>
                          ) : null}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {t("restockOrders.manager")}: {order.manager.name} (
                          {translateRole(order.manager.role, locale)})
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.notes ?? t("common.noNotes")}
                        </p>
                        <details className="text-xs text-muted-foreground">
                          <summary className="cursor-pointer font-medium text-foreground">{t("common.details")}</summary>
                          <div className="mt-2 space-y-2">
                            {order.items.map((item) => (
                              <p key={item.id}>
                                {item.product.name} ({item.product.sku}) · {item.quantity} {item.product.unit}
                                {item.estimatedPrice ? ` · ${formatCurrency(item.estimatedPrice.toString(), { locale })}` : ""}
                              </p>
                            ))}
                          </div>
                        </details>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-56">
                      <div className="space-y-1">
                        <p className="font-medium">{order.supplier.companyName}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.supplier.user.name}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-56">
                      <div className="space-y-1 text-sm">
                        <p>{t("restockOrders.ordered")}: {formatDate(order.orderDate, { locale })}</p>
                        <p>
                          {t("restockOrders.eta")}:{" "}
                          {order.expectedDeliveryDate
                            ? formatDate(order.expectedDeliveryDate, { locale })
                            : t("common.notSet")}
                        </p>
                        <p>
                          {t("restockOrders.confirmed")}:{" "}
                          {order.confirmedAt
                            ? formatDateTime(order.confirmedAt, { locale })
                            : t("restockOrders.pendingShort")}
                        </p>
                        <p>
                          {t("restockOrders.received")}:{" "}
                          {order.receivedAt
                            ? formatDateTime(order.receivedAt, { locale })
                            : t("restockOrders.notReceived")}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-56">
                      {order.supplierRating ? (
                        <div className="space-y-1">
                          <p className="font-medium">
                            {order.supplierRating.rating} / 5
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.supplierRating.feedback ?? t("restockOrders.noFeedback")}
                          </p>
                        </div>
                      ) : order.status === "RECEIVED" && canCreateRestockOrders ? (
                        <SupplierRatingFormDialog
                          managerId={order.manager.id}
                          managerLabel={`${order.manager.name} (${translateRole(order.manager.role, locale)})`}
                          poNumber={order.poNumber}
                          restockOrderId={order.id}
                          supplierName={order.supplier.companyName}
                        />
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {t("restockOrders.availableAfterReceipt")}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {order.status === "PENDING" ? (
                          isSupplier ? (
                            <>
                              <RestockOrderStatusDialog
                                actorId={order.supplier.user.id}
                                actorLabel={`${order.supplier.user.name} (${t("roles.SUPPLIER")})`}
                                mode="confirm"
                                orderId={order.id}
                                poNumber={order.poNumber}
                              />
                              <RestockOrderStatusDialog
                                actorId={order.supplier.user.id}
                                actorLabel={`${order.supplier.user.name} (${t("roles.SUPPLIER")})`}
                                mode="reject"
                                orderId={order.id}
                                poNumber={order.poNumber}
                              />
                            </>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              {t("restockOrders.awaitingSupplierAction")}
                            </span>
                          )
                        ) : null}

                        {order.status === "CONFIRMED" ? (
                          isSupplier ? (
                            <RestockOrderStatusDialog
                              actorId={order.supplier.user.id}
                              actorLabel={`${order.supplier.user.name} (${t("roles.SUPPLIER")})`}
                              mode="in_transit"
                              orderId={order.id}
                              poNumber={order.poNumber}
                            />
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              {t("restockOrders.awaitingSupplierDispatch")}
                            </span>
                          )
                        ) : null}

                        {order.status === "IN_TRANSIT" ? (
                          canCreateRestockOrders ? (
                            <RestockOrderStatusDialog
                              actorId={order.manager.id}
                              actorLabel={`${order.manager.name} (${translateRole(order.manager.role, locale)})`}
                              mode="receive"
                              orderId={order.id}
                              poNumber={order.poNumber}
                            />
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              {t("restockOrders.awaitingWarehouseReceipt")}
                            </span>
                          )
                        ) : null}

                        {["RECEIVED", "REJECTED"].includes(order.status) ? (
                          <span className="text-sm text-muted-foreground">
                            <CircleCheckBig className="mr-1 inline size-4" />
                            {t("restockOrders.workflowComplete")}
                          </span>
                        ) : null}
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

function SummaryValue({ label, value, warning = false }: { label: string; value: number; warning?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={warning && value > 0 ? "mt-2 truncate text-xl font-semibold text-warning sm:text-2xl" : "mt-2 truncate text-xl font-semibold sm:text-2xl"}>{value}</p>
    </div>
  );
}
