import { ClipboardList } from "lucide-react";

import { DataEmptyState } from "@/components/dashboard/data-empty-state";
import { ExportButtons } from "@/components/dashboard/export-buttons";
import { PageHeader } from "@/components/dashboard/page-header";
import { TransactionFormSheet } from "@/components/dashboard/transaction-form-sheet";
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
import { requireDashboardPathAccess } from "@/lib/auth";
import { formatDateTime } from "@/lib/formatters";
import { getServerTranslator } from "@/lib/i18n/server";
import { translateRole, translateTransactionStatus } from "@/lib/i18n/status";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const TRANSACTION_TABLE_LIMIT = 20;

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
  const currentUser = await requireDashboardPathAccess("/dashboard/transactions");
  const { locale, t } = await getServerTranslator();
  const transactionWhere =
    currentUser?.role === "STAFF"
      ? {
          createdById: currentUser.id,
        }
      : undefined;

  const [
    transactions,
    products,
    pendingCount,
    approvedOrCompletedCount,
    rejectedCount,
    itemLineCount,
  ] = await Promise.all([
    prisma.transaction.findMany({
      where: transactionWhere,
      take: TRANSACTION_TABLE_LIMIT,
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
    prisma.transaction.count({
      where: {
        ...transactionWhere,
        status: "PENDING",
      },
    }),
    prisma.transaction.count({
      where: {
        ...transactionWhere,
        status: {
          in: ["APPROVED", "COMPLETED"],
        },
      },
    }),
    prisma.transaction.count({
      where: {
        ...transactionWhere,
        status: "REJECTED",
      },
    }),
    prisma.transactionItem.count({
      where:
        currentUser?.role === "STAFF"
          ? {
              transaction: {
                createdById: currentUser.id,
              },
            }
          : undefined,
    }),
  ]);

  const canCreateTransactions =
    currentUser?.role === "ADMIN" || currentUser?.role === "STAFF";
  const canReviewTransactions =
    currentUser?.role === "ADMIN" || currentUser?.role === "MANAGER";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("transactions.eyebrow")}
        title={t("transactions.title")}
        description={t("transactions.description")}
        action={
          <div className="flex flex-wrap justify-end gap-2">
            <ExportButtons
              filenamePrefix="stockwise-transactions"
              rows={transactions.flatMap((transaction) =>
                transaction.items.map((item) => ({
                  transactionNumber: transaction.transactionNumber,
                  type: translateTransactionStatus(transaction.type, locale),
                  status: translateTransactionStatus(transaction.status, locale),
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
            {canCreateTransactions && currentUser ? (
              <TransactionFormSheet currentUser={currentUser} products={products} />
            ) : null}
          </div>
        }
      />

      <Card className="border-border bg-card shadow-none">
        <CardContent className="grid gap-6 pt-6 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryValue label={t("transactions.pendingReview")} value={pendingCount} warning />
          <SummaryValue label={t("transactions.approvedDone")} value={approvedOrCompletedCount} />
          <SummaryValue label={t("transactions.rejected")} value={rejectedCount} />
          <SummaryValue label={t("transactions.itemLines")} value={itemLineCount} />
        </CardContent>
      </Card>

      {transactions.length === 0 ? (
        <DataEmptyState
          icon={ClipboardList}
          title={t("transactions.emptyTitle")}
          description={t("transactions.emptyDescription")}
          hint={t("transactions.emptyHint")}
        />
      ) : (
        <Card className="stockwise-panel">
          <CardHeader>
            <CardTitle>{t("transactions.tableTitle")}</CardTitle>
            <CardDescription>
              {t("transactions.tableDescription", { count: transactions.length })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("transactions.transaction")}</TableHead>
                  <TableHead>{t("transactions.owner")}</TableHead>
                  <TableHead>{t("transactions.items")}</TableHead>
                  <TableHead>{t("transactions.reviewed")}</TableHead>
                  <TableHead className="text-right">{t("common.actions")}</TableHead>
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
                            {translateTransactionStatus(transaction.type, locale)}
                          </Badge>
                          <Badge variant={getStatusBadgeVariant(transaction.status)}>
                            {translateTransactionStatus(transaction.status, locale)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(transaction.transactionDate, { locale })}
                        </p>
                        <details className="text-xs text-muted-foreground">
                          <summary className="cursor-pointer font-medium text-foreground">{t("common.details")}</summary>
                          <div className="mt-2 space-y-2 whitespace-normal">
                            <p>{transaction.destination ?? t("common.noDestination")}</p>
                            <p>{transaction.notes ?? t("common.noNotes")}</p>
                            {transaction.items.map((item) => (
                              <p key={item.id}>
                                {item.product.name}: {t("transactions.quantityAudit", { quantity: item.quantity, unit: item.product.unit, before: item.stockBefore, after: item.stockAfter })}
                              </p>
                            ))}
                          </div>
                        </details>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-52">
                      <div className="space-y-1">
                        <p className="font-medium">
                          {transaction.creator.name} ({translateRole(transaction.creator.role, locale)})
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {transaction.approver
                            ? `${transaction.approver.name} (${translateRole(transaction.approver.role, locale)})`
                            : t("transactions.awaitingApprover")}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{transaction.items.length}</TableCell>
                    <TableCell>
                      {transaction.approvedAt
                        ? formatDateTime(transaction.approvedAt, { locale })
                        : t("transactions.notReviewedYet")}
                    </TableCell>
                    <TableCell className="text-right">
                      {transaction.status === "PENDING" && canReviewTransactions && currentUser ? (
                        <div className="flex justify-end gap-2">
                          <TransactionReviewDialog
                            currentUser={currentUser}
                            mode="approve"
                            transaction={{
                              id: transaction.id,
                              transactionNumber: transaction.transactionNumber,
                              type: transaction.type,
                            }}
                          />
                          <TransactionReviewDialog
                            currentUser={currentUser}
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
                          {transaction.status === "PENDING"
                            ? t("transactions.awaitingManagerReview")
                            : t("transactions.reviewComplete")}
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

function SummaryValue({ label, value, warning = false }: { label: string; value: number; warning?: boolean }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={warning && value > 0 ? "mt-2 text-2xl font-semibold text-amber-600" : "mt-2 text-2xl font-semibold"}>{value}</p>
    </div>
  );
}
