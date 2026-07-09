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
  title: string;
  href: string;
  icon: DashboardIconKey;
  description: string;
};

export const dashboardNavItems: DashboardNavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: "dashboard",
    description: "Warehouse overview and operational summary surfaces.",
  },
  {
    title: "Products",
    href: "/dashboard/products",
    icon: "products",
    description: "Catalog structure for warehouse products, stock, and labels.",
  },
  {
    title: "Categories",
    href: "/dashboard/categories",
    icon: "categories",
    description: "Classification layer for organizing inventory groups.",
  },
  {
    title: "Transactions",
    href: "/dashboard/transactions",
    icon: "transactions",
    description: "Incoming and outgoing stock movement workflows.",
  },
  {
    title: "Restock Orders",
    href: "/dashboard/restock-orders",
    icon: "restockOrders",
    description: "Purchase order and supplier replenishment coordination.",
  },
  {
    title: "Suppliers",
    href: "/dashboard/suppliers",
    icon: "suppliers",
    description: "Supplier profiles, coordination, and future rating insights.",
  },
  {
    title: "Reports",
    href: "/dashboard/reports",
    icon: "reports",
    description: "Exports, analytics snapshots, and reporting utilities.",
  },
  {
    title: "Activity Logs",
    href: "/dashboard/activity-logs",
    icon: "activityLogs",
    description: "Operational visibility and future audit timeline views.",
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: "settings",
    description: "Workspace configuration and system preferences.",
  },
];

export function getDashboardNavItemsForRole(role: AppRole) {
  return dashboardNavItems.filter((item) => canAccessDashboardPath(role, item.href));
}
