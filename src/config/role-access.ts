export const appRoles = ["ADMIN", "MANAGER", "STAFF", "SUPPLIER"] as const;

export type AppRole = (typeof appRoles)[number];

type RoleAccessMap = Record<AppRole, string[]>;

const roleAccessMap: RoleAccessMap = {
  ADMIN: [
    "/dashboard",
    "/dashboard/products",
    "/dashboard/categories",
    "/dashboard/transactions",
    "/dashboard/restock-orders",
    "/dashboard/suppliers",
    "/dashboard/reports",
    "/dashboard/activity-logs",
    "/dashboard/settings",
  ],
  MANAGER: [
    "/dashboard",
    "/dashboard/products",
    "/dashboard/transactions",
    "/dashboard/restock-orders",
    "/dashboard/suppliers",
    "/dashboard/reports",
    "/dashboard/settings",
  ],
  STAFF: [
    "/dashboard",
    "/dashboard/products",
    "/dashboard/transactions",
    "/dashboard/settings",
  ],
  SUPPLIER: ["/dashboard", "/dashboard/restock-orders", "/dashboard/settings"],
};

export function canAccessDashboardPath(role: AppRole, pathname: string) {
  const allowedPrefixes = roleAccessMap[role];

  return allowedPrefixes.some((prefix) =>
    prefix === "/dashboard"
      ? pathname === prefix
      : pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}
