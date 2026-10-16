import { routes } from "./menu";
import { implementedPages } from "./pageRegistry";
export type FeatureStatus = "placeholder" | "in-progress" | "done";
export interface FeatureDefinition {
  status: FeatureStatus;
  description: string;
  plannedFeatures: string[];
}
const plannedFeaturesByPath: Record<string, string[]> = {
  "/chat/default": [
    "Start a direct conversation",
    "Search message history",
    "Manage unread messages",
  ],
  "/chat/group": [
    "Create and name a group",
    "Add or remove participants",
    "Review shared messages",
  ],
  "/calendar/default": [
    "Browse events by month",
    "Create a store event",
    "Filter events by calendar",
  ],
  "/calendar/week-view": [
    "Review a weekly schedule",
    "Move events between days",
    "Filter events by staff",
  ],
  "/calendar/day-view": [
    "Review hourly appointments",
    "Add an event time slot",
    "Check daily staff availability",
  ],
  "/calendar/list-view": [
    "Browse upcoming events in a list",
    "Filter events by date range",
    "Open event details",
  ],
  "/calendar/timeline": [
    "View events across a timeline",
    "Adjust the visible date range",
    "Group events by team",
  ],
  "/email/mailbox": [
    "Browse demo inbox and folders",
    "Search and preview messages",
    "Compose a local email draft",
  ],
  "/email/templates": [
    "Browse reusable email templates",
    "Edit template content",
    "Preview a template with sample data",
  ],
  "/products/all-products": [
    "Browse products with price and stock",
    "Search by product name or SKU",
    "Filter by category and brand",
  ],
  "/products/add-product": [
    "Enter product details and SKU",
    "Set price and stock levels",
    "Choose category and product variants",
  ],
  "/products/variants": [
    "Create size and color options",
    "Assign variant SKUs and prices",
    "Review stock by variant",
  ],
  "/products/categories": [
    "Create and edit product categories",
    "Assign products to a category",
    "Review category product counts",
  ],
  "/products/subcategories": [
    "Create subcategories under a category",
    "Move products between subcategories",
    "Review the category hierarchy",
  ],
  "/products/brands": [
    "Create and edit product brands",
    "Assign brands to products",
    "Search the brand directory",
  ],
  "/products/units": [
    "Define product units of measure",
    "Set unit abbreviations",
    "Assign units to products",
  ],
  "/products/reviews": [
    "Review customer product ratings",
    "Filter reviews by product",
    "Manage review visibility",
  ],
  "/products/print-barcode": [
    "Select products and barcode format",
    "Set label size and quantities",
    "Preview printable barcode labels",
  ],
  "/products/bulk-import": [
    "Choose a local CSV file",
    "Map columns and validate rows",
    "Preview products before importing",
  ],
  "/products/bulk-export": [
    "Select product fields to export",
    "Filter the product selection",
    "Download products as a CSV file",
  ],
  "/products/warranty": [
    "Define warranty periods",
    "Attach warranty terms to products",
    "Review warranty coverage",
  ],
  "/inventory/stock-list": [
    "Review stock by product and warehouse",
    "Search by SKU or product name",
    "Filter low and out-of-stock items",
  ],
  "/inventory/stock-in": [
    "Select receiving warehouse",
    "Record incoming quantities",
    "Review stock receipt history",
  ],
  "/inventory/stock-out": [
    "Select items and outgoing quantities",
    "Record the reason for stock removal",
    "Review outgoing stock history",
  ],
  "/inventory/stock-adjustment": [
    "Compare counted and recorded quantities",
    "Record an adjustment reason",
    "Review adjustment history",
  ],
  "/inventory/stock-transfer": [
    "Select source and destination warehouse",
    "Add items and quantities",
    "Transfer history",
  ],
  "/inventory/batch-management": [
    "Record batch numbers and expiry dates",
    "Track quantities by batch",
    "Review expiring inventory",
  ],
  "/inventory/lost-items": [
    "Record damaged or missing items",
    "Assign a loss reason",
    "Review stock loss totals",
  ],
  "/inventory/alerts": [
    "Configure low-stock thresholds",
    "Review products requiring attention",
    "Filter alerts by warehouse",
  ],
  "/inventory/valuation": [
    "Review inventory cost by product",
    "Compare value across warehouses",
    "Export an inventory valuation",
  ],
  "/inventory/warehouse": [
    "Create and edit warehouse details",
    "Assign a warehouse to a branch",
    "Review warehouse stock levels",
  ],
  "/orders/all-orders": [
    "Browse and filter order records",
    "Review order items and totals",
    "Track payment and fulfillment status",
  ],
  "/orders/refunded": [
    "Review refunded orders",
    "Record refund reasons",
    "Compare original and refunded totals",
  ],
  "/orders/invoices": [
    "Browse customer invoices",
    "Preview invoice line items",
    "Download a printable invoice",
  ],
  "/customers/customer-list": [
    "Search the customer directory",
    "Review customer purchase history",
    "Filter by membership level",
  ],
  "/customers/add-customer": [
    "Enter customer contact details",
    "Assign a membership tier",
    "Validate and save the customer locally",
  ],
  "/customers/wallet-balance": [
    "Review customer wallet balances",
    "Record local credit adjustments",
    "Browse wallet transaction history",
  ],
  "/customers/activity-log": [
    "Review customer visits and orders",
    "Filter activity by customer and date",
    "Open related customer records",
  ],
  "/suppliers/supplier-list": [
    "Search the supplier directory",
    "Review supplier contact details",
    "View related purchase records",
  ],
  "/suppliers/add-supplier": [
    "Enter supplier business details",
    "Add contact and payment terms",
    "Validate and save the supplier locally",
  ],
  "/suppliers/payments": [
    "Review supplier payment records",
    "Link a payment to a purchase",
    "Filter by supplier and payment date",
  ],
  "/suppliers/balance-report": [
    "Review outstanding supplier balances",
    "Filter balances by due date",
    "Export a supplier balance summary",
  ],
  "/purchases/purchase": [
    "Browse purchase orders",
    "Review supplier and item details",
    "Filter purchases by status",
  ],
  "/purchases/add-purchase": [
    "Select supplier and warehouse",
    "Add purchase items and costs",
    "Review totals before saving",
  ],
  "/purchases/returns": [
    "Select an original purchase",
    "Record returned items and reasons",
    "Review purchase return history",
  ],
  "/purchases/payments": [
    "Review purchase payments",
    "Filter paid and outstanding amounts",
    "Open the related purchase",
  ],
  "/accounts/income": [
    "Review store income entries",
    "Categorize income sources",
    "Filter income by date and branch",
  ],
  "/accounts/expenses": [
    "Record expense categories and amounts",
    "Review local expense entries",
    "Filter expenses by date and branch",
  ],
  "/accounts/bank-accounts": [
    "Maintain local account labels",
    "Review mock account balances",
    "Browse associated transactions",
  ],
  "/accounts/money-transfer": [
    "Choose source and destination accounts",
    "Enter a mock transfer amount",
    "Review local transfer history",
  ],
  "/reports/sales": [
    "Filter sales by date and branch",
    "Compare revenue and order totals",
    "Export a sales summary",
  ],
  "/reports/product": [
    "Compare product sales and margins",
    "Rank best and slow-selling products",
    "Export product performance data",
  ],
  "/reports/expense": [
    "Summarize expenses by category",
    "Compare expenses across periods",
    "Export an expense summary",
  ],
  "/reports/purchases": [
    "Review purchase totals by supplier",
    "Compare purchase costs across periods",
    "Export a purchase summary",
  ],
  "/reports/finance": [
    "Review income, costs and profit",
    "Compare branch financial summaries",
    "Export a financial summary",
  ],
  "/reports/supplier": [
    "Compare supplier purchases and returns",
    "Review outstanding supplier balances",
    "Export a supplier summary",
  ],
  "/staff/staff-list": [
    "Browse the staff directory",
    "Filter staff by role and branch",
    "Review staff profiles",
  ],
  "/staff/add-staff": [
    "Enter staff profile details",
    "Assign a role and branch",
    "Save the staff record locally",
  ],
  "/staff/role-permission": [
    "Define local role permissions",
    "Review access by module",
    "Preview a role permission matrix",
  ],
  "/staff/attendance": [
    "Record local clock-in and clock-out",
    "Review attendance by date",
    "Summarize late and missing entries",
  ],
  "/staff/payroll": [
    "Review staff pay components",
    "Calculate a mock payroll summary",
    "Preview printable payslips",
  ],
  "/staff/holidays": [
    "Maintain a store holiday calendar",
    "Assign holidays to branches",
    "Review upcoming holidays",
  ],
  "/staff/schedule": [
    "Assign staff shifts",
    "Review weekly staff coverage",
    "Flag overlapping shifts",
  ],
  "/multi-store/store-list": [
    "Browse branches and store details",
    "Review local store status",
    "Choose the active branch",
  ],
  "/multi-store/add-store": [
    "Enter store name and address",
    "Assign a store manager",
    "Save the store record locally",
  ],
  "/settings/tax": [
    "Configure tax names and rates",
    "Choose inclusive or exclusive pricing",
    "Apply tax rules to products",
  ],
  "/settings/coupons": [
    "Define coupon codes and discounts",
    "Set coupon limits and expiry",
    "Preview coupon eligibility",
  ],
  "/settings/general": [
    "Edit store name and contact details",
    "Set default language and date format",
    "Save general preferences locally",
  ],
  "/settings/pos": [
    "Configure the POS product display",
    "Choose receipt and checkout preferences",
    "Preview POS settings",
  ],
  "/settings/payment-gateway": [
    "Browse mock payment options",
    "Toggle display of payment methods",
    "Preview gateway configuration without connections",
  ],
  "/settings/currencies": [
    "Choose a display currency",
    "Maintain mock currency rates",
    "Preview formatted currency amounts",
  ],
  "/settings/invoices": [
    "Customize invoice labels and numbering",
    "Choose invoice fields and footer text",
    "Preview an invoice template",
  ],
  "/settings/manager": [
    "Review manager preferences",
    "Assign a mock supervising staff member",
    "Configure local approval preferences",
  ],
  "/account/account": [
    "Edit personal account details",
    "Update the local profile avatar",
    "Preview account changes",
  ],
  "/account/security": [
    "Review mock sign-in devices",
    "Preview password preferences",
    "Review account security activity",
  ],
  "/account/billing-plans": [
    "Compare subscription plan details",
    "Review mock billing information",
    "Preview a plan selection",
  ],
  "/account/notification": [
    "Choose notification categories",
    "Set local display preferences",
    "Preview notification examples",
  ],
  "/account/statements": [
    "Browse mock account statements",
    "Filter statements by period",
    "Preview a statement export",
  ],
  "/account/logs": [
    "Review account activity entries",
    "Filter by event type and date",
    "Inspect event details",
  ],
  "/profile/overview": [
    "Review the user profile summary",
    "View staff role and branch",
    "Browse profile statistics",
  ],
  "/profile/activity": [
    "Browse profile activity history",
    "Filter activity by event type",
    "Open related records",
  ],
  "/profile/documents": [
    "Browse locally listed documents",
    "Preview document details",
    "Organize documents by category",
  ],
  "/profile/notes": [
    "Create local profile notes",
    "Edit and organize note entries",
    "Search note content",
  ],
  "/pricing/user": [
    "Compare available user plans",
    "Review included features",
    "Preview a plan selection",
  ],
  "/pricing/admin": [
    "Compare administrator plans",
    "Review store and staff limits",
    "Preview administrator billing options",
  ],
  "/landing": [
    "Present a store overview",
    "Highlight the TindaPOS feature set",
    "Link to the POS and dashboard",
  ],
  "/blank": [
    "Add a page-specific content area",
    "Define the module empty state",
    "Connect the page to a local service",
  ],
  "/contact-us": [
    "Review store contact details",
    "Fill a demo contact form",
    "Preview a local submission confirmation",
  ],
  "/faq-s": [
    "Browse common questions",
    "Expand answers by topic",
    "Search the help content",
  ],
  "/licenses": [
    "Review dependency license information",
    "View software attribution",
    "Browse third-party notices",
  ],
  "/coming-soon": [
    "Preview an upcoming release notice",
    "Display a planned launch date",
    "Link back to the dashboard",
  ],
  "/maintenance": [
    "Display a maintenance notice",
    "Preview service availability messaging",
    "Link to the help center",
  ],
  "/privacy-policy": [
    "Review local data usage information",
    "Browse policy sections",
    "View the policy revision date",
  ],
  "/help-center": [
    "Browse help topics by module",
    "Search frequently asked questions",
    "Open getting-started guides",
  ],
  "/activity-history": [
    "Review recent application activity",
    "Filter by module and date",
    "Inspect individual activity entries",
  ],
  "/components": [
    "Review the planned components catalog",
    "Preview accessible component examples",
    "Browse usage guidance",
  ],
  "/forms": [
    "Review the planned forms catalog",
    "Preview accessible component examples",
    "Browse usage guidance",
  ],
  "/tables": [
    "Review the planned tables catalog",
    "Preview accessible component examples",
    "Browse usage guidance",
  ],
  "/charts": [
    "Review the planned charts catalog",
    "Preview accessible component examples",
    "Browse usage guidance",
  ],
  "/maps": [
    "Review the planned maps catalog",
    "Preview accessible component examples",
    "Browse usage guidance",
  ],
};
export const featureStatus: Record<string, FeatureDefinition> =
  Object.fromEntries(
    routes.map((route) => [
      route.path,
      {
        status: implementedPages[route.path] ? "done" : "placeholder",
        description: `Your ${route.title.toLowerCase()} workspace is taking shape. This feature is planned for a future phase.`,
        plannedFeatures: plannedFeaturesByPath[route.path] ?? [
          "Review the demo form",
          "Preview the next step",
          "Return to the dashboard",
        ],
      },
    ]),
  );
featureStatus["*"] = {
  status: "done",
  description: "Unknown route recovery",
  plannedFeatures: [],
};
// Short URLs and existing menu URLs share the same implemented screens.
export const phase2Paths = [
  "/products",
  "/products/all-products",
  "/products/add",
  "/products/add-product",
  "/products/:id/edit",
  "/products/variants",
  "/products/categories",
  "/products/subcategories",
  "/products/brands",
  "/products/units",
  "/inventory/stock",
  "/inventory/stock-list",
  "/inventory/stock-in",
  "/inventory/stock-out",
  "/inventory/adjustment",
  "/inventory/stock-adjustment",
] as const;
for (const path of phase2Paths)
  featureStatus[path] = {
    status: "done",
    description: "Working with browser-persisted local data.",
    plannedFeatures: [],
  };
// General settings are still planned; only its local Data card is implemented.
featureStatus["/settings/general"].status = "placeholder";
// Phase 3 POS remains complete; Phase 4 management routes are registered below.
featureStatus['/pos'] = {
  status: 'done',
  description: 'Working local POS: cart, VAT and discounts, customers, held orders, split payments, credit sales, receipts and history.',
  plannedFeatures: [],
};
featureStatus['/'].description = 'Live branch-filtered sales, order history, transactions and payment methods. Other analytics remain demo placeholders.';

export const phase4Paths=Object.keys(implementedPages).filter(path=>['/orders','/customers','/suppliers','/purchases'].some(prefix=>path===prefix||path.startsWith(prefix+'/')));
for(const path of phase4Paths)featureStatus[path]={status:'done',description:'Working Phase 4 module with browser-persisted records, validated financial and stock actions, and activity history.',plannedFeatures:[]};
