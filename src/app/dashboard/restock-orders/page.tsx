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
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatStatusLabel,
} from "@/lib/formatters";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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
  const [restockOrders, managers, suppliers, products] = await Promise.all([
    prisma.restockOrder.findMany({
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
    prisma.user.findMany({
      where: {
        status: "ACTIVE",
        role: {
          in: ["ADMIN", "MANAGER"],
        },
      },
      select: {
        id: true,
        name: true,
        role: true,
      },
      orderBy: [{ name: "asc" }],
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
  ]);

  const summary = restockOrders.reduce(
    (accumulator, order) => {
      if (order.status === "PENDING") {
        accumulator.pending += 1;
      }

      if (order.status === "IN_TRANSIT") {
        accumulator.inTransit += 1;
      }

      if (order.status === "RECEIVED") {
        accumulator.received += 1;
      }

      if (order.status === "REJECTED") {
        accumulator.rejected += 1;
      }

      return accumulator;
    },
    {
      pending: 0,
      inTransit: 0,
      received: 0,
      rejected: 0,
    }
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Restock Orders"
        title="Supplier replenishment coordination"
        description="Restock orders now move from creation through supplier confirmation, delivery transit, receipt, linked incoming transactions, and optional post-delivery supplier ratings."
        action={
          <RestockOrderFormDialog
            managers={managers}
            products={products}
            suppliers={suppliers.map((supplier) => ({
              id: supplier.id,
              companyName: supplier.companyName,
              contactName: supplier.user.name,
            }))}
          />
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/70 bg-background/80 shadow-sm shadow-black/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <CardDescription>Waiting on supplier response</CardDescription>
            </div>
            <TimerReset className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">
              {summary.pending}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-background/80 shadow-sm shadow-black/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">In Transit</CardTitle>
              <CardDescription>Confirmed supplier deliveries en route</CardDescription>
            </div>
            <Truck className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">
              {summary.inTransit}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-background/80 shadow-sm shadow-black/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">Received</CardTitle>
              <CardDescription>Orders linked into inventory updates</CardDescription>
            </div>
            <PackageCheck className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">
              {summary.received}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-background/80 shadow-sm shadow-black/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <CardDescription>Supplier orders that did not proceed</CardDescription>
            </div>
            <CircleOff className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">
              {summary.rejected}
            </p>
          </CardContent>
        </Card>
      </div>

      {restockOrders.length === 0 ? (
        <DataEmptyState
          icon={Truck}
          title="No restock orders recorded yet"
          description="The restock workflow is connected, but the database does not contain any supplier replenishment records yet."
          hint="Create the first purchase order to kick off confirmation, transit, receipt, and supplier rating flows."
        />
      ) : (
        <Card className="border-border/70 bg-background/80 shadow-sm shadow-black/5">
          <CardHeader>
            <CardTitle>Restock pipeline</CardTitle>
            <CardDescription>
              {restockOrders.length} supplier replenishment
              {restockOrders.length === 1 ? "" : "s"} tracked through delivery and
              warehouse receipt.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Timeline</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                            {formatStatusLabel(order.status)}
                          </Badge>
                          {order.sourceTransaction ? (
                            <Badge variant="outline">
                              {order.sourceTransaction.transactionNumber}
                            </Badge>
                          ) : null}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Manager: {order.manager.name} ({order.manager.role})
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.notes ?? "No notes recorded."}
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
                          <div key={item.id} className="rounded-xl border border-border/60 px-3 py-2">
                            <p className="text-sm font-medium">
                              {item.product.name} ({item.product.sku})
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Qty {item.quantity} {item.product.unit}
                              {item.estimatedPrice
                                ? ` • ${formatCurrency(item.estimatedPrice.toString())}`
                                : ""}
                            </p>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="min-w-56">
                      <div className="space-y-1 text-sm">
                        <p>Ordered: {formatDate(order.orderDate)}</p>
                        <p>
                          ETA:{" "}
                          {order.expectedDeliveryDate
                            ? formatDate(order.expectedDeliveryDate)
                            : "Not set"}
                        </p>
                        <p>
                          Confirmed:{" "}
                          {order.confirmedAt
                            ? formatDateTime(order.confirmedAt)
                            : "Pending"}
                        </p>
                        <p>
                          Received:{" "}
                          {order.receivedAt
                            ? formatDateTime(order.receivedAt)
                            : "Not received"}
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
                            {order.supplierRating.feedback ?? "No feedback provided."}
                          </p>
                        </div>
                      ) : order.status === "RECEIVED" ? (
                        <SupplierRatingFormDialog
                          managerId={order.manager.id}
                          managerLabel={`${order.manager.name} (${order.manager.role})`}
                          poNumber={order.poNumber}
                          restockOrderId={order.id}
                          supplierName={order.supplier.companyName}
                        />
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Available after receipt
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {order.status === "PENDING" ? (
                          <>
                            <RestockOrderStatusDialog
                              actorId={order.supplier.user.id}
                              actorLabel={`${order.supplier.user.name} (Supplier)`}
                              description="The assigned supplier can confirm the order and begin delivery planning."
                              mode="confirm"
                              orderId={order.id}
                              poNumber={order.poNumber}
                            />
                            <RestockOrderStatusDialog
                              actorId={order.supplier.user.id}
                              actorLabel={`${order.supplier.user.name} (Supplier)`}
                              description="Reject the order if the supplier cannot fulfill this purchase request."
                              mode="reject"
                              orderId={order.id}
                              poNumber={order.poNumber}
                            />
                          </>
                        ) : null}

                        {order.status === "CONFIRMED" ? (
                          <RestockOrderStatusDialog
                            actorId={order.supplier.user.id}
                            actorLabel={`${order.supplier.user.name} (Supplier)`}
                            description="Mark the confirmed order in transit once the shipment has left the supplier."
                            mode="in_transit"
                            orderId={order.id}
                            poNumber={order.poNumber}
                          />
                        ) : null}

                        {order.status === "IN_TRANSIT" ? (
                          <RestockOrderStatusDialog
                            actorId={order.manager.id}
                            actorLabel={`${order.manager.name} (${order.manager.role})`}
                            description="Mark the order received to create the linked incoming transaction and update product stock."
                            mode="receive"
                            orderId={order.id}
                            poNumber={order.poNumber}
                          />
                        ) : null}

                        {["RECEIVED", "REJECTED"].includes(order.status) ? (
                          <span className="text-sm text-muted-foreground">
                            <CircleCheckBig className="mr-1 inline size-4" />
                            Workflow complete
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
