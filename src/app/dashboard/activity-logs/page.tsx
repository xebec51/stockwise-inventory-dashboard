import Link from "next/link";
import { FolderKanban } from "lucide-react";

import { DataEmptyState } from "@/components/dashboard/data-empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
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
import {
  translateActivityAction,
  translateActivityModule,
  translateRole,
} from "@/lib/i18n/status";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ACTIVITY_TABLE_LIMIT = 60;

type ActivityLogsPageProps = {
  searchParams?: Promise<{ module?: string }>;
};

function getActionBadgeVariant(action: string) {
  switch (action) {
    case "CREATE":
    case "APPROVE":
      return "default";
    case "REJECT":
    case "DELETE":
      return "destructive";
    case "UPDATE":
      return "secondary";
    default:
      return "outline";
  }
}

function SummaryValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 truncate text-xl font-semibold sm:text-2xl">
        {value}
      </p>
    </div>
  );
}

export default async function ActivityLogsPage({
  searchParams,
}: ActivityLogsPageProps) {
  await requireDashboardPathAccess("/dashboard/activity-logs");
  const { locale, t } = await getServerTranslator();
  const params = await searchParams;
  const activeModule = params?.module;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [totalEvents, eventsToday, userGroups, moduleGroups, logs] =
    await Promise.all([
      prisma.activityLog.count(),
      prisma.activityLog.count({
        where: { createdAt: { gte: todayStart } },
      }),
      prisma.activityLog.groupBy({ by: ["userId"] }),
      prisma.activityLog.groupBy({
        by: ["module"],
        _count: { _all: true },
        orderBy: { _count: { module: "desc" } },
      }),
      prisma.activityLog.findMany({
        where: activeModule ? { module: activeModule } : undefined,
        orderBy: { createdAt: "desc" },
        take: ACTIVITY_TABLE_LIMIT,
        select: {
          id: true,
          action: true,
          module: true,
          description: true,
          ipAddress: true,
          createdAt: true,
          user: { select: { name: true, role: true } },
        },
      }),
    ]);

  const topModule = moduleGroups[0];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("activityLogs.eyebrow")}
        title={t("activityLogs.title")}
        description={t("activityLogs.description")}
      />

      <Card className="border-border bg-card shadow-none">
        <CardContent className="grid gap-6 pt-6 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryValue
            label={t("activityLogs.totalEvents")}
            value={String(totalEvents)}
          />
          <SummaryValue
            label={t("activityLogs.eventsToday")}
            value={String(eventsToday)}
          />
          <SummaryValue
            label={t("activityLogs.activeUsers")}
            value={String(userGroups.length)}
          />
          <SummaryValue
            label={t("activityLogs.topModule")}
            value={
              topModule
                ? translateActivityModule(topModule.module, locale)
                : t("common.notSet")
            }
          />
        </CardContent>
      </Card>

      {totalEvents === 0 ? (
        <DataEmptyState
          icon={FolderKanban}
          title={t("activityLogs.emptyTitle")}
          description={t("activityLogs.emptyDescription")}
          hint={t("activityLogs.tableDescription", { count: 0 })}
        />
      ) : (
        <Card className="stockwise-panel">
          <CardHeader>
            <CardTitle>{t("activityLogs.tableTitle")}</CardTitle>
            <CardDescription>
              {t("activityLogs.tableDescription", { count: logs.length })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={activeModule ? "outline" : "secondary"}
                render={<Link href="/dashboard/activity-logs" />}
                className="cursor-pointer"
              >
                {t("activityLogs.filterAllModules")}
              </Badge>
              {moduleGroups.map((group) => (
                <Badge
                  key={group.module}
                  variant={activeModule === group.module ? "secondary" : "outline"}
                  render={
                    <Link
                      href={{
                        pathname: "/dashboard/activity-logs",
                        query: { module: group.module },
                      }}
                    />
                  }
                  className="cursor-pointer"
                >
                  {translateActivityModule(group.module, locale)} (
                  {group._count._all})
                </Badge>
              ))}
            </div>

            {logs.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {t("activityLogs.emptyFilteredDescription")}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("activityLogs.columnDate")}</TableHead>
                    <TableHead>{t("activityLogs.columnUser")}</TableHead>
                    <TableHead>{t("activityLogs.columnAction")}</TableHead>
                    <TableHead>{t("activityLogs.columnModule")}</TableHead>
                    <TableHead>{t("activityLogs.columnDescription")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDateTime(log.createdAt, { locale })}
                      </TableCell>
                      <TableCell className="min-w-40">
                        <p className="font-medium">{log.user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {translateRole(log.user.role, locale)}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getActionBadgeVariant(log.action)}>
                          {translateActivityAction(log.action, locale)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {translateActivityModule(log.module, locale)}
                        </Badge>
                      </TableCell>
                      <TableCell className="min-w-64 max-w-md whitespace-normal text-sm">
                        {log.description}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
