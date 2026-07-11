import {
  Boxes,
  ClipboardList,
  FileBarChart2,
  FolderKanban,
  LayoutDashboard,
  Settings,
  Tags,
  Truck,
  UsersRound,
} from "lucide-react";

import { canAccessDashboardPath, type AppRole } from "@/config/role-access";

export const dashboardIconMap = {
  dashboard: LayoutDashboard,
  products: Boxes,
  categories: Tags,
  transactions: ClipboardList,
  restockOrders: Truck,
  suppliers: UsersRound,
  reports: FileBarChart2,
  activityLogs: FolderKanban,
  settings: Settings,
};

export type DashboardIconKey = keyof typeof dashboardIconMap;

export type DashboardNavItem = {
  titleKey: string;
  href: string;
  icon: DashboardIconKey;
  descriptionKey: string;
};

export const dashboardNavItems: DashboardNavItem[] = [
  {
    titleKey: "nav.dashboard",
    href: "/dashboard",
    icon: "dashboard",
    descriptionKey: "navDescription.dashboard",
  },
  {
    titleKey: "nav.products",
    href: "/dashboard/products",
    icon: "products",
    descriptionKey: "navDescription.products",
  },
  {
    titleKey: "nav.categories",
    href: "/dashboard/categories",
    icon: "categories",
    descriptionKey: "navDescription.categories",
  },
  {
    titleKey: "nav.transactions",
    href: "/dashboard/transactions",
    icon: "transactions",
    descriptionKey: "navDescription.transactions",
  },
  {
    titleKey: "nav.restockOrders",
    href: "/dashboard/restock-orders",
    icon: "restockOrders",
    descriptionKey: "navDescription.restockOrders",
  },
  {
    titleKey: "nav.suppliers",
    href: "/dashboard/suppliers",
    icon: "suppliers",
    descriptionKey: "navDescription.suppliers",
  },
  {
    titleKey: "nav.reports",
    href: "/dashboard/reports",
    icon: "reports",
    descriptionKey: "navDescription.reports",
  },
  {
    titleKey: "nav.activityLogs",
    href: "/dashboard/activity-logs",
    icon: "activityLogs",
    descriptionKey: "navDescription.activityLogs",
  },
  {
    titleKey: "nav.settings",
    href: "/dashboard/settings",
    icon: "settings",
    descriptionKey: "navDescription.settings",
  },
];

export function getDashboardNavItemsForRole(role: AppRole) {
  return dashboardNavItems.filter((item) => canAccessDashboardPath(role, item.href));
}
