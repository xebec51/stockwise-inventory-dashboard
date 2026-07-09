import {
  ArrowDownToLine,
  ArrowUpFromLine,
  CircleCheckBig,
  ClipboardList,
  Clock3,
} from "lucide-react";

import { DataEmptyState } from "@/components/dashboard/data-empty-state";
import { ExportButtons } from "@/components/dashboard/export-buttons";
import { PageHeader } from "@/components/dashboard/page-header";
import { TransactionFormDialog } from "@/components/dashboard/transaction-form-dialog";
import { TransactionReviewDialog } from "@/components/dashboard/transaction-review-dialog";
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
import { formatDateTime, formatStatusLabel } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "PENDING":
      return "secondary";
    case "APPROVED":
    case "COMPLETED":
      return "default";
    case "REJECTED":
      return "destructive";
    default:
      return "outline";
  }
}

function getTypeBadgeVariant(type: string) {
  return type === "INCOMING" ? "default" : "outline";
}

export default async function TransactionsPage() {
  const [transactions, creators, approvers, products] = await Promise.all([
    prisma.transaction.findMany({
      select: {
        id: true,
        transactionNumber: true,
        type: true,
        status: true,
        destination: true,
        notes: true,
        transactionDate: true,
        approvedAt: true,
        creator: {
          select: {
            name: true,
            role: true,
          },
        },
        approver: {
          select: {
            name: true,
            role: true,
          },
        },
        items: {
          select: {
            id: true,
            quantity: true,
            stockBefore: true,
            stockAfter: true,
            product: {
              select: {
                name: true,
                sku: true,
                unit: true,
              },
            },
          },
        },
      },
      orderBy: [{ transactionDate: "desc" }, { createdAt: "desc" }],
    }),
    prisma.user.findMany({
      where: {
        status: "ACTIVE",
        role: {
          in: ["ADMIN", "MANAGER", "STAFF"],
        },
      },
      select: {
        id: true,
        name: true,
        role: true,
      },
      orderBy: [{ name: "asc" }],
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
    prisma.product.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        currentStock: true,
        unit: true,
      },
      orderBy: [{ name: "asc" }],
    }),
  ]);

  const summary = transactions.reduce(
    (accumulator, transaction) => {
      if (transaction.status === "PENDING") {
        accumulator.pending += 1;
      }

      if (
        transaction.status === "APPROVED" ||
        transaction.status === "COMPLETED"
      ) {
        accumulator.approvedOrCompleted += 1;
      }

      if (transaction.status === "REJECTED") {
        accumulator.rejected += 1;
      }

      accumulator.itemLines += transaction.items.length;

      return accumulator;
    },
    {
      pending: 0,
      approvedOrCompleted: 0,
      rejected: 0,
      itemLines: 0,
    }
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Transactions"
        title="Stock movement workflow area"
        description="Incoming and outgoing transactions now run through a pending approval workflow with stock-safe updates, item-level audit fields, and Prisma-backed operational history."
        action={
          <div className="flex flex-wrap justify-end gap-2">
            <ExportButtons
              filenamePrefix="stockwise-transactions"
              rows={transactions.flatMap((transaction) =>
                transaction.items.map((item) => ({
                  transactionNumber: transaction.transactionNumber,
                  type: transaction.type,
                  status: transaction.status,
                  transactionDate: transaction.transactionDate.toISOString(),
                  creator: transaction.creator.name,
                  approver: transaction.approver?.name ?? "",
                  destination: transaction.destination ?? "",
                  product: item.product.name,
                  sku: item.product.sku,
                  quantity: item.quantity,
                  stockBefore: item.stockBefore,
                  stockAfter: item.stockAfter,
                  notes: transaction.notes ?? "",
                }))
              )}
              sheetName="Transactions"
            />
            <TransactionFormDialog creators={creators} products={products} />
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/70 bg-background/80 shadow-sm shadow-black/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <CardDescription>Awaiting manager or admin action</CardDescription>
            </div>
            <Clock3 className="size-5 text-muted-foreground" />
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
              <CardTitle className="text-sm font-medium">Approved / Done</CardTitle>
              <CardDescription>Stock-applied movements</CardDescription>
            </div>
            <CircleCheckBig className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">
              {summary.approvedOrCompleted}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-background/80 shadow-sm shadow-black/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <CardDescription>Requests that kept stock unchanged</CardDescription>
            </div>
            <ArrowUpFromLine className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">
              {summary.rejected}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-background/80 shadow-sm shadow-black/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">Item Lines</CardTitle>
              <CardDescription>Tracked across all transactions</CardDescription>
            </div>
            <ArrowDownToLine className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">
              {summary.itemLines}
            </p>
          </CardContent>
        </Card>
      </div>

      {transactions.length === 0 ? (
        <DataEmptyState
          icon={ClipboardList}
          title="No transactions recorded yet"
          description="The transaction workflow is connected, but there are no stock movement records in the database to review."
          hint="Create the first pending incoming or outgoing transaction to start the approval flow."
        />
      ) : (
        <Card className="border-border/70 bg-background/80 shadow-sm shadow-black/5">
          <CardHeader>
            <CardTitle>Transaction queue</CardTitle>
            <CardDescription>
              {transactions.length} stock movement
              {transactions.length === 1 ? "" : "s"} with item-level audit
              records and approval state.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction</TableHead>
                  <TableHead>Workflow</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Reviewed</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="min-w-64">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">
                            {transaction.transactionNumber}
                          </p>
                          <Badge variant={getTypeBadgeVariant(transaction.type)}>
                            {formatStatusLabel(transaction.type)}
                          </Badge>
                          <Badge variant={getStatusBadgeVariant(transaction.status)}>
                            {formatStatusLabel(transaction.status)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(transaction.transactionDate)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {transaction.destination ?? "No destination recorded"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-52">
                      <p className="font-medium">
                        {transaction.type === "INCOMING"
                          ? "Incoming receipt"
                          : "Outgoing shipment"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Pending transactions do not change stock until approval.
                      </p>
                    </TableCell>
                    <TableCell className="min-w-52">
                      <div className="space-y-1">
                        <p className="font-medium">
                          {transaction.creator.name} ({transaction.creator.role})
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {transaction.approver
                            ? `${transaction.approver.name} (${transaction.approver.role})`
                            : "Awaiting approver"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-80">
                      <div className="space-y-2">
                        {transaction.items.map((item) => (
                          <div
                            key={item.id}
                            className="rounded-xl border border-border/60 px-3 py-2"
                          >
                            <p className="text-sm font-medium">
                              {item.product.name} ({item.product.sku})
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Qty {item.quantity} {item.product.unit} | Audit{" "}
                              {item.stockBefore} -&gt; {item.stockAfter}
                            </p>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="min-w-56 whitespace-normal text-sm leading-6 text-muted-foreground">
                      {transaction.notes ?? "No notes recorded."}
                    </TableCell>
                    <TableCell>
                      {transaction.approvedAt
                        ? formatDateTime(transaction.approvedAt)
                        : "Not reviewed yet"}
                    </TableCell>
                    <TableCell className="text-right">
                      {transaction.status === "PENDING" ? (
                        <div className="flex justify-end gap-2">
                          <TransactionReviewDialog
                            approvers={approvers}
                            mode="approve"
                            transaction={{
                              id: transaction.id,
                              transactionNumber: transaction.transactionNumber,
                              type: transaction.type,
                            }}
                          />
                          <TransactionReviewDialog
                            approvers={approvers}
                            mode="reject"
                            transaction={{
                              id: transaction.id,
                              transactionNumber: transaction.transactionNumber,
                              type: transaction.type,
                            }}
                          />
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Review complete
                        </span>
                      )}
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
