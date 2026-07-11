import {
  CircleCheckBig,
  CircleOff,
  PackageCheck,
  TimerReset,
  Truck,
} from "lucide-react";

import { DataEmptyState } from "@/components/dashboard/data-empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { RestockOrderFormDialog } from "@/components/dashboard/restock-order-form-dialog";
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
import { getCurrentUser } from "@/lib/auth";
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
  const { locale, t } = await getServerTranslator();
  const currentUser = await getCurrentUser();
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
            <RestockOrderFormDialog
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="stockwise-panel">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">{t("restockOrders.pending")}</CardTitle>
              <CardDescription>{t("restockOrders.pendingDescription")}</CardDescription>
            </div>
            <TimerReset className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">
              {pendingCount}
            </p>
          </CardContent>
        </Card>

        <Card className="stockwise-panel">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">{t("restockOrders.inTransit")}</CardTitle>
              <CardDescription>{t("restockOrders.inTransitDescription")}</CardDescription>
            </div>
            <Truck className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">
              {inTransitCount}
            </p>
          </CardContent>
        </Card>

        <Card className="stockwise-panel">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">{t("restockOrders.received")}</CardTitle>
              <CardDescription>{t("restockOrders.receivedDescription")}</CardDescription>
            </div>
            <PackageCheck className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">
              {receivedCount}
            </p>
          </CardContent>
        </Card>

        <Card className="stockwise-panel">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">{t("restockOrders.rejected")}</CardTitle>
              <CardDescription>{t("restockOrders.rejectedDescription")}</CardDescription>
            </div>
            <CircleOff className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">
              {rejectedCount}
            </p>
          </CardContent>
        </Card>
      </div>

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
                  <TableHead>{t("restockOrders.items")}</TableHead>
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
                    <TableCell className="min-w-80">
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="rounded-xl border border-border/60 px-3 py-2"
                          >
                            <p className="text-sm font-medium">
                              {item.product.name} ({item.product.sku})
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Qty {item.quantity} {item.product.unit}
                              {item.estimatedPrice
                                ? ` | ${formatCurrency(item.estimatedPrice.toString(), { locale })}`
                                : ""}
                            </p>
                          </div>
                        ))}
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
                                description="The assigned supplier can confirm the order and begin delivery planning."
                                mode="confirm"
                                orderId={order.id}
                                poNumber={order.poNumber}
                              />
                              <RestockOrderStatusDialog
                                actorId={order.supplier.user.id}
                                actorLabel={`${order.supplier.user.name} (${t("roles.SUPPLIER")})`}
                                description="Reject the order if the supplier cannot fulfill this purchase request."
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
                              description="Mark the confirmed order in transit once the shipment has left the supplier."
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
                              description="Mark the order received to create the linked incoming transaction and update product stock."
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
