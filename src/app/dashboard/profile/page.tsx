import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Mail,
  Pencil,
  Phone,
  Plus,
  Trash2,
  XCircle,
} from "lucide-react";
import { redirect } from "next/navigation";

import { ChangePasswordForm } from "@/components/dashboard/change-password-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireDashboardPathAccess } from "@/lib/auth";
import { formatDate, formatDateTime } from "@/lib/formatters";
import { getServerTranslator } from "@/lib/i18n/server";
import {
  translateActivityModule,
  translateRole,
  translateUserStatus,
} from "@/lib/i18n/status";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const RECENT_ACTIVITY_LIMIT = 8;

const activityIcons: Record<string, LucideIcon> = {
  CREATE: Plus,
  UPDATE: Pencil,
  APPROVE: CheckCircle2,
  REJECT: XCircle,
  DELETE: Trash2,
};

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

export default async function ProfilePage() {
  const currentUser = await requireDashboardPathAccess("/dashboard/profile");
  const { locale, t } = await getServerTranslator();

  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatarUrl: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      supplierProfile: {
        select: {
          id: true,
          companyName: true,
          supplierCategory: true,
          _count: { select: { restockOrders: true } },
        },
      },
      _count: {
        select: {
          createdTransactions: true,
          approvedTransactions: true,
          managedRestockOrders: true,
          supplierRatingsGiven: true,
          activityLogs: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const [recentActivity, supplierRatingAggregate] = await Promise.all([
    prisma.activityLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: RECENT_ACTIVITY_LIMIT,
      select: {
        id: true,
        action: true,
        module: true,
        description: true,
        createdAt: true,
      },
    }),
    user.supplierProfile
      ? prisma.supplierRating.aggregate({
          where: { supplierId: user.supplierProfile.id },
          _avg: { rating: true },
        })
      : Promise.resolve(null),
  ]);

  const stats: { label: string; value: string }[] = [];

  if (user.role === "STAFF" || user.role === "ADMIN") {
    stats.push({
      label: t("profile.stats.transactionsCreated"),
      value: String(user._count.createdTransactions),
    });
  }

  if (user.role === "MANAGER" || user.role === "ADMIN") {
    stats.push({
      label: t("profile.stats.transactionsApproved"),
      value: String(user._count.approvedTransactions),
    });
    stats.push({
      label: t("profile.stats.restockOrdersManaged"),
      value: String(user._count.managedRestockOrders),
    });
    stats.push({
      label: t("profile.stats.supplierRatingsGiven"),
      value: String(user._count.supplierRatingsGiven),
    });
  }

  stats.push({
    label: t("profile.stats.activityEvents"),
    value: String(user._count.activityLogs),
  });

  const averageRating = supplierRatingAggregate?._avg.rating;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("profile.eyebrow")}
        title={t("profile.title")}
        description={t("profile.description")}
      />

      <Card className="stockwise-ink stockwise-signal overflow-hidden rounded-3xl">
        <CardContent className="relative flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <Avatar size="lg" className="size-16 text-base">
              <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
              <AvatarFallback className="text-lg">
                {user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-xl font-semibold">{user.name}</h2>
                <Badge variant="secondary">
                  {translateRole(user.role, locale)}
                </Badge>
                <Badge variant={getStatusBadgeVariant(user.status)}>
                  {translateUserStatus(user.status, locale)}
                </Badge>
              </div>
              <p className="flex items-center gap-1.5 truncate text-sm text-white/70">
                <Mail className="size-3.5 shrink-0" />
                <span className="truncate">{user.email}</span>
              </p>
              {user.phone ? (
                <p className="flex items-center gap-1.5 text-sm text-white/70">
                  <Phone className="size-3.5 shrink-0" />
                  {user.phone}
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-1.5 text-sm text-white/60 sm:text-right">
            <span className="inline-flex items-center gap-1.5 sm:justify-end">
              <Calendar className="size-3.5" />
              {t("profile.memberSince", {
                date: formatDate(user.createdAt, { locale }),
              })}
            </span>
            <span className="inline-flex items-center gap-1.5 sm:justify-end">
              <Clock className="size-3.5" />
              {t("profile.lastUpdated", {
                date: formatDate(user.updatedAt, { locale }),
              })}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <ProfileForm
            user={{
              name: user.name,
              email: user.email,
              phone: user.phone,
              avatarUrl: user.avatarUrl,
            }}
          />
          <ChangePasswordForm />
        </div>

        <div className="space-y-6">
          <Card className="stockwise-panel">
            <CardHeader>
              <CardTitle>{t("profile.statsTitle")}</CardTitle>
              <CardDescription>{t("profile.statsDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <span className="text-sm text-muted-foreground">
                    {stat.label}
                  </span>
                  <span className="text-sm font-semibold">{stat.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {user.supplierProfile ? (
            <Card className="stockwise-panel">
              <CardHeader>
                <CardTitle>{t("profile.supplierTitle")}</CardTitle>
                <CardDescription>
                  {t("profile.supplierDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Building2 className="size-4 shrink-0 text-primary" />
                  <span className="min-w-0 truncate font-medium">
                    {user.supplierProfile.companyName}
                  </span>
                </div>
                {user.supplierProfile.supplierCategory ? (
                  <p className="text-sm text-muted-foreground">
                    {user.supplierProfile.supplierCategory}
                  </p>
                ) : null}
                <div className="grid grid-cols-2 gap-3 pt-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">
                      {t("profile.supplierRestocks")}
                    </p>
                    <p className="mt-1 font-semibold">
                      {user.supplierProfile._count.restockOrders}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">
                      {t("profile.supplierRating")}
                    </p>
                    <p className="mt-1 font-semibold">
                      {averageRating
                        ? averageRating.toFixed(1)
                        : t("profile.supplierNoRating")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Card className="stockwise-panel">
            <CardHeader>
              <CardTitle>{t("profile.activityTitle")}</CardTitle>
              <CardDescription>
                {t("profile.activityDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              {recentActivity.map((log) => {
                const Icon = activityIcons[log.action] ?? Activity;

                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/8 text-primary ring-1 ring-primary/10">
                      <Icon className="size-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-6 break-words">
                        {log.description}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {translateActivityModule(log.module, locale)} ·{" "}
                        {formatDateTime(log.createdAt, { locale })}
                      </p>
                    </div>
                  </div>
                );
              })}
              {recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("profile.activityEmpty")}
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
