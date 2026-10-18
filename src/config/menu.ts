import {
  Boxes,
  CalendarDays,
  ChartNoAxesCombined,
  Circle,
  ClipboardList,
  Contact,
  Headset,
  History,
  Home,
  LayoutGrid,
  Mail,
  MessagesSquare,
  Package,
  PanelTop,
  PanelsTopLeft,
  ScrollText,
  Settings,
  ShieldUser,
  ShoppingBag,
  ShoppingCart,
  Store,
  Truck,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
export interface MenuItem {
  label: string;
  icon: LucideIcon;
  path: string;
  children?: MenuItem[];
  breadcrumb?: string[];
}
export interface MenuGroup {
  label?: string;
  items: MenuItem[];
}
export interface MenuSection {
  id: string;
  railIcon: LucideIcon;
  label: string;
  groups: MenuGroup[];
}
export interface RouteDefinition {
  path: string;
  title: string;
  breadcrumb: string[];
  sectionId: string;
  layout: "main" | "auth" | "pos";
}
export const menu: MenuSection[] = [
  {
    id: "dashboard",
    railIcon: Home,
    label: "Dashboard",
    groups: [
      {
        label: "MAIN",
        items: [
          {
            label: "Dashboard",
            icon: Home,
            path: "/",
            breadcrumb: ["Dashboards", "Main"],
          },
          {
            label: "POS",
            icon: ShoppingCart,
            path: "/pos",
          },
          {
            label: "Landing",
            icon: PanelsTopLeft,
            path: "/landing",
          },
        ],
      },
    ],
  },
  {
    id: "apps",
    railIcon: LayoutGrid,
    label: "Apps",
    groups: [
      {
        label: "APPS",
        items: [
          {
            label: "Chat",
            icon: MessagesSquare,
            path: "/chat/default",
            children: [
              {
                label: "Default",
                icon: Circle,
                path: "/chat/default",
              },
              {
                label: "Group",
                icon: Circle,
                path: "/chat/group",
              },
            ],
          },
          {
            label: "Calendar",
            icon: CalendarDays,
            path: "/calendar/default",
            children: [
              {
                label: "Default",
                icon: Circle,
                path: "/calendar/default",
              },
              {
                label: "Week View",
                icon: Circle,
                path: "/calendar/week-view",
              },
              {
                label: "Day View",
                icon: Circle,
                path: "/calendar/day-view",
              },
              {
                label: "List View",
                icon: Circle,
                path: "/calendar/list-view",
              },
              {
                label: "Timeline",
                icon: Circle,
                path: "/calendar/timeline",
              },
            ],
          },
          {
            label: "Email",
            icon: Mail,
            path: "/email/mailbox",
            children: [
              {
                label: "Mailbox",
                icon: Circle,
                path: "/email/mailbox",
              },
              {
                label: "Templates",
                icon: Circle,
                path: "/email/templates",
              },
            ],
          },
        ],
      },
      {
        label: "WEB APPS",
        items: [
          {
            label: "Products",
            icon: Package,
            path: "/products/all-products",
            children: [
              {
                label: "All Products",
                icon: Circle,
                path: "/products/all-products",
              },
              {
                label: "Add Product",
                icon: Circle,
                path: "/products/add-product",
              },
              {
                label: "Variants",
                icon: Circle,
                path: "/products/variants",
              },
              {
                label: "Categories",
                icon: Circle,
                path: "/products/categories",
              },
              {
                label: "Subcategories",
                icon: Circle,
                path: "/products/subcategories",
              },
              {
                label: "Brands",
                icon: Circle,
                path: "/products/brands",
              },
              {
                label: "Units",
                icon: Circle,
                path: "/products/units",
              },
              {
                label: "Reviews",
                icon: Circle,
                path: "/products/reviews",
              },
              {
                label: "Print Barcode",
                icon: Circle,
                path: "/products/print-barcode",
              },
              {
                label: "Bulk Import",
                icon: Circle,
                path: "/products/bulk-import",
              },
              {
                label: "Bulk Export",
                icon: Circle,
                path: "/products/bulk-export",
              },
              {
                label: "Warranty",
                icon: Circle,
                path: "/products/warranty",
              },
            ],
          },
          {
            label: "Inventory",
            icon: Boxes,
            path: "/inventory/stock-list",
            children: [
              {
                label: "Stock List",
                icon: Circle,
                path: "/inventory/stock-list",
              },
              {
                label: "Stock In",
                icon: Circle,
                path: "/inventory/stock-in",
              },
              {
                label: "Stock Out",
                icon: Circle,
                path: "/inventory/stock-out",
              },
              {
                label: "Stock Adjustment",
                icon: Circle,
                path: "/inventory/stock-adjustment",
              },
              {
                label: "Stock Transfer",
                icon: Circle,
                path: "/inventory/stock-transfer",
              },
              {
                label: "Batch Management",
                icon: Circle,
                path: "/inventory/batch-management",
              },
              {
                label: "Lost Items",
                icon: Circle,
                path: "/inventory/lost-items",
              },
              {
                label: "Alerts",
                icon: Circle,
                path: "/inventory/alerts",
              },
              {
                label: "Valuation",
                icon: Circle,
                path: "/inventory/valuation",
              },
              {
                label: "Warehouse",
                icon: Circle,
                path: "/inventory/warehouse",
              },
            ],
          },
          {
            label: "Orders",
            icon: ClipboardList,
            path: "/orders/all-orders",
            children: [
              {
                label: "All Orders",
                icon: Circle,
                path: "/orders/all-orders",
              },
              {
                label: "Refunded",
                icon: Circle,
                path: "/orders/refunded",
              },
              {
                label: "Invoices",
                icon: Circle,
                path: "/orders/invoices",
              },
            ],
          },
          {
            label: "Customers",
            icon: Users,
            path: "/customers/customer-list",
            children: [
              {
                label: "Customer List",
                icon: Circle,
                path: "/customers/customer-list",
              },
              {
                label: "Add Customer",
                icon: Circle,
                path: "/customers/add-customer",
              },
              {
                label: "Wallet Balance",
                icon: Circle,
                path: "/customers/wallet-balance",
              },
              {
                label: "Activity Log",
                icon: Circle,
                path: "/customers/activity-log",
              },
            ],
          },
          {
            label: "Suppliers",
            icon: Truck,
            path: "/suppliers/supplier-list",
            children: [
              {
                label: "Supplier List",
                icon: Circle,
                path: "/suppliers/supplier-list",
              },
              {
                label: "Add Supplier",
                icon: Circle,
                path: "/suppliers/add-supplier",
              },
              {
                label: "Payments",
                icon: Circle,
                path: "/suppliers/payments",
              },
              {
                label: "Balance Report",
                icon: Circle,
                path: "/suppliers/balance-report",
              },
            ],
          },
          {
            label: "Purchases",
            icon: ShoppingBag,
            path: "/purchases/purchase",
            children: [
              {
                label: "Purchase",
                icon: Circle,
                path: "/purchases/purchase",
              },
              {
                label: "Add Purchase",
                icon: Circle,
                path: "/purchases/add-purchase",
              },
              {
                label: "Returns",
                icon: Circle,
                path: "/purchases/returns",
              },
              {
                label: "Payments",
                icon: Circle,
                path: "/purchases/payments",
              },
            ],
          },
          {
            label: "Accounts",
            icon: Wallet,
            path: "/accounts/income",
            children: [
              {
                label: "Income",
                icon: Circle,
                path: "/accounts/income",
              },
              {
                label: "Expenses",
                icon: Circle,
                path: "/accounts/expenses",
              },
              {
                label: "Bank Accounts",
                icon: Circle,
                path: "/accounts/bank-accounts",
              },
              {
                label: "Money Transfer",
                icon: Circle,
                path: "/accounts/money-transfer",
              },
            ],
          },
          {
            label: "Reports",
            icon: ChartNoAxesCombined,
            path: "/reports/sales",
            children: [
              {
                label: "Sales",
                icon: Circle,
                path: "/reports/sales",
              },
              {
                label: "Product",
                icon: Circle,
                path: "/reports/product",
              },
              {
                label: "Expense",
                icon: Circle,
                path: "/reports/expense",
              },
              {
                label: "Purchases",
                icon: ShoppingBag,
                path: "/reports/purchases",
              },
              {
                label: "Finance",
                icon: Circle,
                path: "/reports/finance",
              },
              {
                label: "Supplier",
                icon: Circle,
                path: "/reports/supplier",
              },
            ],
          },
        ],
      },
      {
        label: "STAFF",
        items: [
          {
            label: "Staff",
            icon: Contact,
            path: "/staff/staff-list",
            children: [
              {
                label: "Staff List",
                icon: Circle,
                path: "/staff/staff-list",
              },
              {
                label: "Add Staff",
                icon: Circle,
                path: "/staff/add-staff",
              },
              {
                label: "Role Permission",
                icon: Circle,
                path: "/staff/role-permission",
              },
              {
                label: "Attendance",
                icon: Circle,
                path: "/staff/attendance",
              },
              {
                label: "Payroll",
                icon: Circle,
                path: "/staff/payroll",
              },
              {
                label: "Holidays",
                icon: Circle,
                path: "/staff/holidays",
              },
              {
                label: "Schedule",
                icon: Circle,
                path: "/staff/schedule",
              },
            ],
          },
        ],
      },
      {
        label: "MULTI-STORE",
        items: [
          {
            label: "Multi-Store",
            icon: Store,
            path: "/multi-store/store-list",
            children: [
              {
                label: "Store List",
                icon: Circle,
                path: "/multi-store/store-list",
              },
              {
                label: "Add Store",
                icon: Circle,
                path: "/multi-store/add-store",
              },
            ],
          },
        ],
      },
      {
        label: "SETTINGS",
        items: [
          {
            label: "Settings",
            icon: Settings,
            path: "/settings/tax",
            children: [
              {
                label: "Tax",
                icon: Circle,
                path: "/settings/tax",
              },
              {
                label: "Coupons",
                icon: Circle,
                path: "/settings/coupons",
              },
              {
                label: "General",
                icon: Circle,
                path: "/settings/general",
              },
              {
                label: "POS",
                icon: ShoppingCart,
                path: "/settings/pos",
              },
              {
                label: "Payment Gateway",
                icon: Circle,
                path: "/settings/payment-gateway",
              },
              {
                label: "Currencies",
                icon: Circle,
                path: "/settings/currencies",
              },
              {
                label: "Invoices",
                icon: Circle,
                path: "/settings/invoices",
              },
              {
                label: "Manager",
                icon: Circle,
                path: "/settings/manager",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "authentication",
    railIcon: ShieldUser,
    label: "Authentication",
    groups: [
      {
        label: "AUTHENTICATION",
        items: [
          {
            label: "Sign In",
            icon: Circle,
            path: "/auth/sign-in",
          },
          {
            label: "Sign Up",
            icon: Circle,
            path: "/auth/sign-up",
          },
          {
            label: "Forgot Password",
            icon: Circle,
            path: "/auth/forgot-password",
          },
          {
            label: "Two Step Verification",
            icon: Circle,
            path: "/auth/two-step-verification",
          },
          {
            label: "Reset Password",
            icon: Circle,
            path: "/auth/reset-password",
          },
          {
            label: "Successful Password",
            icon: Circle,
            path: "/auth/successful-password",
          },
          {
            label: "Account Deactivation",
            icon: Circle,
            path: "/auth/account-deactivation",
          },
        ],
      },
    ],
  },
  {
    id: "pages",
    railIcon: PanelTop,
    label: "Pages",
    groups: [
      {
        label: "PAGES",
        items: [
          {
            label: "Blank",
            icon: Circle,
            path: "/blank",
          },
          {
            label: "Account",
            icon: Circle,
            path: "/account/account",
            children: [
              {
                label: "Account",
                icon: Circle,
                path: "/account/account",
              },
              {
                label: "Security",
                icon: Circle,
                path: "/account/security",
              },
              {
                label: "Billing & Plans",
                icon: Circle,
                path: "/account/billing-plans",
              },
              {
                label: "Notification",
                icon: Circle,
                path: "/account/notification",
              },
              {
                label: "Statements",
                icon: Circle,
                path: "/account/statements",
              },
              {
                label: "Logs",
                icon: Circle,
                path: "/account/logs",
              },
            ],
          },
          {
            label: "User Profile",
            icon: Circle,
            path: "/profile/overview",
            children: [
              {
                label: "Overview",
                icon: Circle,
                path: "/profile/overview",
              },
              {
                label: "Activity",
                icon: Circle,
                path: "/profile/activity",
              },
              {
                label: "Documents",
                icon: Circle,
                path: "/profile/documents",
              },
              {
                label: "Notes",
                icon: Circle,
                path: "/profile/notes",
              },
            ],
          },
          {
            label: "Pricing",
            icon: Circle,
            path: "/pricing/user",
            children: [
              {
                label: "User",
                icon: Circle,
                path: "/pricing/user",
              },
              {
                label: "Admin",
                icon: Circle,
                path: "/pricing/admin",
              },
            ],
          },
          {
            label: "Contact Us",
            icon: Circle,
            path: "/contact-us",
          },
          {
            label: "FAQ's",
            icon: Circle,
            path: "/faq-s",
          },
          {
            label: "Licenses",
            icon: Circle,
            path: "/licenses",
          },
          {
            label: "Coming Soon",
            icon: Circle,
            path: "/coming-soon",
          },
          {
            label: "Maintenance",
            icon: Circle,
            path: "/maintenance",
          },
          {
            label: "Privacy Policy",
            icon: Circle,
            path: "/privacy-policy",
          },
          {
            label: "Help Center",
            icon: Circle,
            path: "/help-center",
          },
          {
            label: "Error Pages",
            icon: Circle,
            path: "/errors/404",
            children: [
              {
                label: "404",
                icon: Circle,
                path: "/errors/404",
              },
              {
                label: "500",
                icon: Circle,
                path: "/errors/500",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "support",
    railIcon: Headset,
    label: "Support",
    groups: [
      {
        label: "SUPPORT",
        items: [
          {
            label: "Support",
            icon: Circle,
            path: "/help-center",
          },
        ],
      },
    ],
  },
  {
    id: "licenses",
    railIcon: ScrollText,
    label: "Licenses",
    groups: [
      {
        label: "LICENSES",
        items: [
          {
            label: "Licenses",
            icon: Circle,
            path: "/licenses",
          },
        ],
      },
    ],
  },
  {
    id: "activity-history",
    railIcon: History,
    label: "Activity History",
    groups: [
      {
        label: "ACTIVITY HISTORY",
        items: [
          {
            label: "Activity History",
            icon: Circle,
            path: "/activity-history",
          },
        ],
      },
    ],
  },
];
const entries: RouteDefinition[] = menu.flatMap((section) =>
  section.groups.flatMap((group) =>
    group.items.flatMap((item) =>
      (item.children ?? [item]).map((child) => ({
        path: child.path,
        title: child.label,
        breadcrumb:
          child.breadcrumb ??
          (item.children
            ? [section.label, item.label, child.label]
            : [section.label, child.label]),
        sectionId: section.id,
        layout:
          section.id === "authentication"
            ? ("auth" as const)
            : child.path === "/pos"
              ? ("pos" as const)
              : ("main" as const),
      })),
    ),
  ),
);
export const routes = entries.filter(
  (entry, index) =>
    entries.findIndex((other) => other.path === entry.path) === index,
);
export function resolveMenuPath(path: string): string {
  const aliases: Record<string, string> = {
    '/accounts/bank':'/accounts/bank-accounts',
    '/accounts/transfer':'/accounts/money-transfer',
    "/staff":"/staff/staff-list",
    "/staff/add":"/staff/add-staff",
    "/staff/roles":"/staff/role-permission",
    "/orders": "/orders/all-orders",
    "/customers": "/customers/customer-list",
    "/customers/add": "/customers/add-customer",
    "/customers/wallet": "/customers/wallet-balance",
    "/customers/activity": "/customers/activity-log",
    "/suppliers": "/suppliers/supplier-list",
    "/suppliers/add": "/suppliers/add-supplier",
    "/suppliers/balance": "/suppliers/balance-report",
    "/purchases": "/purchases/purchase",
    "/purchases/add": "/purchases/add-purchase",
    "/products": "/products/all-products",
    "/products/add": "/products/add-product",
    "/inventory/stock": "/inventory/stock-list",
    "/inventory/adjustment": "/inventory/stock-adjustment",
  };
  if (/^\/staff\/[^/]+\/edit$/.test(path)) return "/staff/add-staff";
  if (/^\/products\/[^/]+\/edit$/.test(path)) return "/products/add-product";
  for(const [prefix,list,add] of [['orders','all-orders','all-orders'],['customers','customer-list','add-customer'],['suppliers','supplier-list','add-supplier'],['purchases','purchase','add-purchase']]){
   if(new RegExp(`^/${prefix}/[^/]+/edit$`).test(path))return `/${prefix}/${add}`;
   if(new RegExp(`^/${prefix}/[^/]+$`).test(path)&&!routes.some(r=>r.path===path)&&!aliases[path])return `/${prefix}/${list}`;
  }
  return aliases[path] ?? path;
}
export function findRoute(path: string) {
  return routes.find((route) => route.path === resolveMenuPath(path));
}
