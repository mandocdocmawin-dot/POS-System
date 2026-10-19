import {
  Activity,
  ArrowLeftRight,
  BadgeCheck,
  BadgeDollarSign,
  Banknote,
  Barcode,
  Bell,
  Calculator,
  Calendar,
  CalendarClock,
  CalendarHeart,
  CalendarRange,
  ChartPie,
  CircleCheck,
  CircleHelp,
  ClipboardCheck,
  Coins,
  CreditCard,
  Download,
  File,
  FileQuestion,
  FileText,
  Files,
  FolderTree,
  GanttChart,
  Inbox,
  KeyRound,
  Landmark,
  Layers,
  List,
  LockKeyhole,
  LogIn,
  MessageSquare,
  NotebookPen,
  PackageMinus,
  PackagePlus,
  PackageSearch,
  Percent,
  Plus,
  Receipt,
  Rocket,
  Ruler,
  Scale,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Tags,
  Ticket,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  Undo2,
  Upload,
  UserCog,
  UserPlus,
  UserRound,
  UserX,
  Warehouse,
  Wrench,
  Boxes,
  CalendarDays,
  ChartNoAxesCombined,
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
                icon: MessageSquare,
                path: "/chat/default",
              },
              {
                label: "Group",
                icon: MessagesSquare,
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
                icon: CalendarDays,
                path: "/calendar/default",
              },
              {
                label: "Week View",
                icon: CalendarRange,
                path: "/calendar/week-view",
              },
              {
                label: "Day View",
                icon: Calendar,
                path: "/calendar/day-view",
              },
              {
                label: "List View",
                icon: List,
                path: "/calendar/list-view",
              },
              {
                label: "Timeline",
                icon: GanttChart,
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
                icon: Inbox,
                path: "/email/mailbox",
              },
              {
                label: "Templates",
                icon: Mail,
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
                icon: Package,
                path: "/products/all-products",
              },
              {
                label: "Add Product",
                icon: PackagePlus,
                path: "/products/add-product",
              },
              {
                label: "Variants",
                icon: Layers,
                path: "/products/variants",
              },
              {
                label: "Categories",
                icon: Tags,
                path: "/products/categories",
              },
              {
                label: "Subcategories",
                icon: FolderTree,
                path: "/products/subcategories",
              },
              {
                label: "Brands",
                icon: BadgeCheck,
                path: "/products/brands",
              },
              {
                label: "Units",
                icon: Ruler,
                path: "/products/units",
              },
              {
                label: "Reviews",
                icon: Star,
                path: "/products/reviews",
              },
              {
                label: "Print Barcode",
                icon: Barcode,
                path: "/products/print-barcode",
              },
              {
                label: "Bulk Import",
                icon: Upload,
                path: "/products/bulk-import",
              },
              {
                label: "Bulk Export",
                icon: Download,
                path: "/products/bulk-export",
              },
              {
                label: "Warranty",
                icon: ShieldCheck,
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
                icon: Boxes,
                path: "/inventory/stock-list",
              },
              {
                label: "Stock In",
                icon: PackagePlus,
                path: "/inventory/stock-in",
              },
              {
                label: "Stock Out",
                icon: PackageMinus,
                path: "/inventory/stock-out",
              },
              {
                label: "Stock Adjustment",
                icon: SlidersHorizontal,
                path: "/inventory/stock-adjustment",
              },
              {
                label: "Stock Transfer",
                icon: ArrowLeftRight,
                path: "/inventory/stock-transfer",
              },
              {
                label: "Batch Management",
                icon: Layers,
                path: "/inventory/batch-management",
              },
              {
                label: "Lost Items",
                icon: PackageSearch,
                path: "/inventory/lost-items",
              },
              {
                label: "Alerts",
                icon: Bell,
                path: "/inventory/alerts",
              },
              {
                label: "Valuation",
                icon: Calculator,
                path: "/inventory/valuation",
              },
              {
                label: "Warehouse",
                icon: Warehouse,
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
                icon: ClipboardList,
                path: "/orders/all-orders",
              },
              {
                label: "Refunded",
                icon: Undo2,
                path: "/orders/refunded",
              },
              {
                label: "Invoices",
                icon: Receipt,
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
                icon: Users,
                path: "/customers/customer-list",
              },
              {
                label: "Add Customer",
                icon: UserPlus,
                path: "/customers/add-customer",
              },
              {
                label: "Wallet Balance",
                icon: Wallet,
                path: "/customers/wallet-balance",
              },
              {
                label: "Activity Log",
                icon: History,
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
                icon: Truck,
                path: "/suppliers/supplier-list",
              },
              {
                label: "Add Supplier",
                icon: UserPlus,
                path: "/suppliers/add-supplier",
              },
              {
                label: "Payments",
                icon: CreditCard,
                path: "/suppliers/payments",
              },
              {
                label: "Balance Report",
                icon: Scale,
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
                icon: ShoppingBag,
                path: "/purchases/purchase",
              },
              {
                label: "Add Purchase",
                icon: Plus,
                path: "/purchases/add-purchase",
              },
              {
                label: "Returns",
                icon: Undo2,
                path: "/purchases/returns",
              },
              {
                label: "Payments",
                icon: CreditCard,
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
                icon: TrendingUp,
                path: "/accounts/income",
              },
              {
                label: "Expenses",
                icon: TrendingDown,
                path: "/accounts/expenses",
              },
              {
                label: "Bank Accounts",
                icon: Landmark,
                path: "/accounts/bank-accounts",
              },
              {
                label: "Money Transfer",
                icon: ArrowLeftRight,
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
                icon: ChartNoAxesCombined,
                path: "/reports/sales",
              },
              {
                label: "Product",
                icon: Package,
                path: "/reports/product",
              },
              {
                label: "Expense",
                icon: Receipt,
                path: "/reports/expense",
              },
              {
                label: "Purchases",
                icon: ShoppingBag,
                path: "/reports/purchases",
              },
              {
                label: "Finance",
                icon: ChartPie,
                path: "/reports/finance",
              },
              {
                label: "Supplier",
                icon: Truck,
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
                icon: Contact,
                path: "/staff/staff-list",
              },
              {
                label: "Add Staff",
                icon: UserPlus,
                path: "/staff/add-staff",
              },
              {
                label: "Role Permission",
                icon: ShieldUser,
                path: "/staff/role-permission",
              },
              {
                label: "Attendance",
                icon: ClipboardCheck,
                path: "/staff/attendance",
              },
              {
                label: "Payroll",
                icon: Banknote,
                path: "/staff/payroll",
              },
              {
                label: "Holidays",
                icon: CalendarHeart,
                path: "/staff/holidays",
              },
              {
                label: "Schedule",
                icon: CalendarClock,
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
                icon: Store,
                path: "/multi-store/store-list",
              },
              {
                label: "Add Store",
                icon: Plus,
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
                icon: Percent,
                path: "/settings/tax",
              },
              {
                label: "Coupons",
                icon: Ticket,
                path: "/settings/coupons",
              },
              {
                label: "General",
                icon: Settings,
                path: "/settings/general",
              },
              {
                label: "POS",
                icon: ShoppingCart,
                path: "/settings/pos",
              },
              {
                label: "Payment Gateway",
                icon: CreditCard,
                path: "/settings/payment-gateway",
              },
              {
                label: "Currencies",
                icon: Coins,
                path: "/settings/currencies",
              },
              {
                label: "Invoices",
                icon: Receipt,
                path: "/settings/invoices",
              },
              {
                label: "Manager",
                icon: UserCog,
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
            icon: LogIn,
            path: "/auth/sign-in",
          },
          {
            label: "Sign Up",
            icon: UserPlus,
            path: "/auth/sign-up",
          },
          {
            label: "Forgot Password",
            icon: KeyRound,
            path: "/auth/forgot-password",
          },
          {
            label: "Two Step Verification",
            icon: ShieldCheck,
            path: "/auth/two-step-verification",
          },
          {
            label: "Reset Password",
            icon: LockKeyhole,
            path: "/auth/reset-password",
          },
          {
            label: "Successful Password",
            icon: CircleCheck,
            path: "/auth/successful-password",
          },
          {
            label: "Account Deactivation",
            icon: UserX,
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
            icon: File,
            path: "/blank",
          },
          {
            label: "Account",
            icon: UserRound,
            path: "/account/account",
            children: [
              {
                label: "Account",
                icon: UserRound,
                path: "/account/account",
              },
              {
                label: "Security",
                icon: ShieldCheck,
                path: "/account/security",
              },
              {
                label: "Billing & Plans",
                icon: CreditCard,
                path: "/account/billing-plans",
              },
              {
                label: "Notification",
                icon: Bell,
                path: "/account/notification",
              },
              {
                label: "Statements",
                icon: FileText,
                path: "/account/statements",
              },
              {
                label: "Logs",
                icon: History,
                path: "/account/logs",
              },
            ],
          },
          {
            label: "User Profile",
            icon: UserRound,
            path: "/profile/overview",
            children: [
              {
                label: "Overview",
                icon: UserRound,
                path: "/profile/overview",
              },
              {
                label: "Activity",
                icon: Activity,
                path: "/profile/activity",
              },
              { label: "Followers", icon: UserRound, path: "/profile/followers" },
              { label: "Projects", icon: FolderTree, path: "/profile/projects" },
              {
                label: "Documents",
                icon: Files,
                path: "/profile/documents",
              },
              {
                label: "Notes",
                icon: NotebookPen,
                path: "/profile/notes",
              },
            ],
          },
          {
            label: "Pricing",
            icon: Tags,
            path: "/pricing/user",
            children: [
              {
                label: "User",
                icon: Tags,
                path: "/pricing/user",
              },
              {
                label: "Admin",
                icon: BadgeDollarSign,
                path: "/pricing/admin",
              },
            ],
          },
          {
            label: "Contact Us",
            icon: Mail,
            path: "/contact-us",
          },
          {
            label: "FAQ's",
            icon: CircleHelp,
            path: "/faq-s",
          },
          {
            label: "Licenses",
            icon: ScrollText,
            path: "/licenses",
          },
          {
            label: "Coming Soon",
            icon: Rocket,
            path: "/coming-soon",
          },
          {
            label: "Maintenance",
            icon: Wrench,
            path: "/maintenance",
          },
          {
            label: "Privacy Policy",
            icon: ShieldCheck,
            path: "/privacy-policy",
          },
          {
            label: "Help Center",
            icon: Headset,
            path: "/help-center",
          },
          {
            label: "Error Pages",
            icon: FileQuestion,
            path: "/errors/404",
            children: [
              {
                label: "404",
                icon: FileQuestion,
                path: "/errors/404",
              },
              {
                label: "500",
                icon: TriangleAlert,
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
            icon: Headset,
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
            icon: ScrollText,
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
            icon: History,
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
