# TindaPOS

A frontend-only Point of Sale prototype for Filipino businesses. **Phase 1 is complete; Phase 2 has not started.**

## Run locally

Use Node.js 24 LTS (the version used for verification) and npm.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Additional commands:

```sh
npm run build
npm run lint
npm run preview
```

The production build is written to `dist/`. Static hosting must rewrite unknown paths to `index.html` so React Router can handle direct links and its 404 screen.

## Scaffold and installation commands

The workspace already contained a Vite React TypeScript scaffold and one local commit. That baseline was retained rather than overwritten. For a new, empty workspace, the equivalent scaffold command is:

```sh
npm create vite@latest . -- --template react-ts
```

Frontend dependencies added for this phase:

```sh
npm install react-router-dom@6 zustand lucide-react
npm install -D tailwindcss@3 postcss autoprefixer
```

The lockfile records the verified dependency versions. TypeScript strict mode is enabled for both the app and Vite configuration. The font stack uses Inter when locally available, then Segoe UI and system sans-serif; no remote fonts are requested.

## Phase 1 behavior

- Main shell: icon rail, config-driven secondary navigation, accordions, sidebar collapse, responsive mobile drawer with focus containment, topbar, breadcrumb header and footer.
- Topbar: local page search, twelve quick actions, three-branch switcher, language selection UI, density control, Fullscreen API, three mock notifications and user menu.
- Theme: light by default, dark mode using Tailwind classes and a persisted Zustand preference in `localStorage` under `tindapos-theme`.
- Dashboard: six rows of PHP-denominated mock summaries, inventory and customer cards, explicit chart placeholders and 23 recent orders with seven rows per page. Four pages are necessary to show all 23 orders. Selection and pagination work; view/edit/delete show previews without mutating orders.
- POS: separate viewport layout, live local date/time chips, eight product categories, eight products, local search and category/brand filters, customer summary and an empty-cart illustration. Cart, payment and order actions show preview feedback only.
- Authentication: seven static form previews, native validation, password visibility controls, six-digit input with paste support and password-confirmation validation. Submitting Sign In navigates to the dashboard; no credentials are stored or verified.
- Errors: dedicated 404/500 screens and a catch-all with dashboard recovery.
- All other routes use the same reusable placeholder component with three route-specific planned features.

## Data and configuration boundaries

```text
src/
  app/                 Router generation, theme application and providers
  layouts/             MainLayout, AuthLayout, PosLayout
  components/layout/   Shell and navigation components
  components/common/   Shared cards, tables, badges, avatars and placeholders
  config/              Menu, page registry, quick actions, feature status
  services/            Synchronous dashboard, product and order mock services
  store/               Theme, active branch and UI stores
  data/                In-code mock records
  pages/               Lazy-loaded screens and reserved module directories
  types/               Product/order types and Philippine Peso formatting
```

Pages call services and do not import `src/data` directly. Services make no network requests. Only the theme preference persists in this phase; business records and branch selection reset on reload. Branch selection is shared globally and appears in the dashboard; the mock figures are not branch-specific.

The branch store is `useBranchStore`. Menu sections and leaf route metadata come from `src/config/menu.ts`. Duplicate Help Center and Licenses rail destinations share their canonical page routes.

Every page route is lazy-loaded. `src/config/pageRegistry.ts` selects implemented screens; unknown entries use the shared placeholder. `src/config/featureStatus.ts` contains the route status map and planned features. Status `done` means the requested Phase 1 UI is built, not that the future business workflow is implemented.

There is no backend, database, server API, real authentication, payment processing or email delivery. No remote assets or chart libraries are used.

## Route status

**112 destinations: 12 built screens including the catch-all, 100 placeholders.** Built means a Phase 1 UI/skeleton. The complete table below follows the configured menu order.

| Route | Screen | Layout | Status |
| --- | --- | --- | --- |
| `/` | Dashboards > Main | main | built |
| `/pos` | Dashboard > POS | pos | built |
| `/landing` | Dashboard > Landing | main | placeholder |
| `/chat/default` | Apps > Chat > Default | main | placeholder |
| `/chat/group` | Apps > Chat > Group | main | placeholder |
| `/calendar/default` | Apps > Calendar > Default | main | placeholder |
| `/calendar/week-view` | Apps > Calendar > Week View | main | placeholder |
| `/calendar/day-view` | Apps > Calendar > Day View | main | placeholder |
| `/calendar/list-view` | Apps > Calendar > List View | main | placeholder |
| `/calendar/timeline` | Apps > Calendar > Timeline | main | placeholder |
| `/email/mailbox` | Apps > Email > Mailbox | main | placeholder |
| `/email/templates` | Apps > Email > Templates | main | placeholder |
| `/products/all-products` | Apps > Products > All Products | main | placeholder |
| `/products/add-product` | Apps > Products > Add Product | main | placeholder |
| `/products/variants` | Apps > Products > Variants | main | placeholder |
| `/products/categories` | Apps > Products > Categories | main | placeholder |
| `/products/subcategories` | Apps > Products > Subcategories | main | placeholder |
| `/products/brands` | Apps > Products > Brands | main | placeholder |
| `/products/units` | Apps > Products > Units | main | placeholder |
| `/products/reviews` | Apps > Products > Reviews | main | placeholder |
| `/products/print-barcode` | Apps > Products > Print Barcode | main | placeholder |
| `/products/bulk-import` | Apps > Products > Bulk Import | main | placeholder |
| `/products/bulk-export` | Apps > Products > Bulk Export | main | placeholder |
| `/products/warranty` | Apps > Products > Warranty | main | placeholder |
| `/inventory/stock-list` | Apps > Inventory > Stock List | main | placeholder |
| `/inventory/stock-in` | Apps > Inventory > Stock In | main | placeholder |
| `/inventory/stock-out` | Apps > Inventory > Stock Out | main | placeholder |
| `/inventory/stock-adjustment` | Apps > Inventory > Stock Adjustment | main | placeholder |
| `/inventory/stock-transfer` | Apps > Inventory > Stock Transfer | main | placeholder |
| `/inventory/batch-management` | Apps > Inventory > Batch Management | main | placeholder |
| `/inventory/lost-items` | Apps > Inventory > Lost Items | main | placeholder |
| `/inventory/alerts` | Apps > Inventory > Alerts | main | placeholder |
| `/inventory/valuation` | Apps > Inventory > Valuation | main | placeholder |
| `/inventory/warehouse` | Apps > Inventory > Warehouse | main | placeholder |
| `/orders/all-orders` | Apps > Orders > All Orders | main | placeholder |
| `/orders/refunded` | Apps > Orders > Refunded | main | placeholder |
| `/orders/invoices` | Apps > Orders > Invoices | main | placeholder |
| `/customers/customer-list` | Apps > Customers > Customer List | main | placeholder |
| `/customers/add-customer` | Apps > Customers > Add Customer | main | placeholder |
| `/customers/wallet-balance` | Apps > Customers > Wallet Balance | main | placeholder |
| `/customers/activity-log` | Apps > Customers > Activity Log | main | placeholder |
| `/suppliers/supplier-list` | Apps > Suppliers > Supplier List | main | placeholder |
| `/suppliers/add-supplier` | Apps > Suppliers > Add Supplier | main | placeholder |
| `/suppliers/payments` | Apps > Suppliers > Payments | main | placeholder |
| `/suppliers/balance-report` | Apps > Suppliers > Balance Report | main | placeholder |
| `/purchases/purchase` | Apps > Purchases > Purchase | main | placeholder |
| `/purchases/add-purchase` | Apps > Purchases > Add Purchase | main | placeholder |
| `/purchases/returns` | Apps > Purchases > Returns | main | placeholder |
| `/purchases/payments` | Apps > Purchases > Payments | main | placeholder |
| `/accounts/income` | Apps > Accounts > Income | main | placeholder |
| `/accounts/expenses` | Apps > Accounts > Expenses | main | placeholder |
| `/accounts/bank-accounts` | Apps > Accounts > Bank Accounts | main | placeholder |
| `/accounts/money-transfer` | Apps > Accounts > Money Transfer | main | placeholder |
| `/reports/sales` | Apps > Reports > Sales | main | placeholder |
| `/reports/product` | Apps > Reports > Product | main | placeholder |
| `/reports/expense` | Apps > Reports > Expense | main | placeholder |
| `/reports/purchases` | Apps > Reports > Purchases | main | placeholder |
| `/reports/finance` | Apps > Reports > Finance | main | placeholder |
| `/reports/supplier` | Apps > Reports > Supplier | main | placeholder |
| `/staff/staff-list` | Apps > Staff > Staff List | main | placeholder |
| `/staff/add-staff` | Apps > Staff > Add Staff | main | placeholder |
| `/staff/role-permission` | Apps > Staff > Role Permission | main | placeholder |
| `/staff/attendance` | Apps > Staff > Attendance | main | placeholder |
| `/staff/payroll` | Apps > Staff > Payroll | main | placeholder |
| `/staff/holidays` | Apps > Staff > Holidays | main | placeholder |
| `/staff/schedule` | Apps > Staff > Schedule | main | placeholder |
| `/multi-store/store-list` | Apps > Multi-Store > Store List | main | placeholder |
| `/multi-store/add-store` | Apps > Multi-Store > Add Store | main | placeholder |
| `/settings/tax` | Apps > Settings > Tax | main | placeholder |
| `/settings/coupons` | Apps > Settings > Coupons | main | placeholder |
| `/settings/general` | Apps > Settings > General | main | placeholder |
| `/settings/pos` | Apps > Settings > POS | main | placeholder |
| `/settings/payment-gateway` | Apps > Settings > Payment Gateway | main | placeholder |
| `/settings/currencies` | Apps > Settings > Currencies | main | placeholder |
| `/settings/invoices` | Apps > Settings > Invoices | main | placeholder |
| `/settings/manager` | Apps > Settings > Manager | main | placeholder |
| `/auth/sign-in` | Authentication > Sign In | auth | built |
| `/auth/sign-up` | Authentication > Sign Up | auth | built |
| `/auth/forgot-password` | Authentication > Forgot Password | auth | built |
| `/auth/two-step-verification` | Authentication > Two Step Verification | auth | built |
| `/auth/reset-password` | Authentication > Reset Password | auth | built |
| `/auth/successful-password` | Authentication > Successful Password | auth | built |
| `/auth/account-deactivation` | Authentication > Account Deactivation | auth | built |
| `/blank` | Pages > Blank | main | placeholder |
| `/account/account` | Pages > Account > Account | main | placeholder |
| `/account/security` | Pages > Account > Security | main | placeholder |
| `/account/billing-plans` | Pages > Account > Billing & Plans | main | placeholder |
| `/account/notification` | Pages > Account > Notification | main | placeholder |
| `/account/statements` | Pages > Account > Statements | main | placeholder |
| `/account/logs` | Pages > Account > Logs | main | placeholder |
| `/profile/overview` | Pages > User Profile > Overview | main | placeholder |
| `/profile/activity` | Pages > User Profile > Activity | main | placeholder |
| `/profile/documents` | Pages > User Profile > Documents | main | placeholder |
| `/profile/notes` | Pages > User Profile > Notes | main | placeholder |
| `/pricing/user` | Pages > Pricing > User | main | placeholder |
| `/pricing/admin` | Pages > Pricing > Admin | main | placeholder |
| `/contact-us` | Pages > Contact Us | main | placeholder |
| `/faq-s` | Pages > FAQ's | main | placeholder |
| `/licenses` | Pages > Licenses | main | placeholder |
| `/coming-soon` | Pages > Coming Soon | main | placeholder |
| `/maintenance` | Pages > Maintenance | main | placeholder |
| `/privacy-policy` | Pages > Privacy Policy | main | placeholder |
| `/help-center` | Pages > Help Center | main | placeholder |
| `/errors/404` | Pages > Error Pages > 404 | main | built |
| `/errors/500` | Pages > Error Pages > 500 | main | built |
| `/components` | Components > Components | main | placeholder |
| `/forms` | Forms > Forms | main | placeholder |
| `/tables` | Tables > Tables | main | placeholder |
| `/charts` | Charts > Charts | main | placeholder |
| `/maps` | Maps > Maps | main | placeholder |
| `/activity-history` | Activity History > Activity History | main | placeholder |
| `*` | Unknown route (404) | main | built |

## Verification

- `npm run build`: passes TypeScript project builds and Vite production bundling without application warnings.
- `npm run lint`: passes with zero lint errors or warnings.
- Local Vite development server: starts successfully and serves the app.
- Configuration audit: 12 rail sections, 111 unique menu routes, one catch-all, 12 valid quick actions, complete status coverage and 3–6 planned features for every placeholder.
- Browser checks: desktop and mobile rendering, active sidebar accordions, branch propagation, quick-action navigation, dropdown bounds and Escape dismissal, mobile drawer, persisted dark mode, order pagination, POS filtering with an unchanged empty cart, demo sign-in, verification inputs and both error screens.
- Browser console: no application warnings or errors after the React Router transition flag correction.

## Local Git history

All 30 requested steps are separate commits on `main`. The pre-existing `TindaPOS` commit is preserved. Corrections discovered during validation are separate `fix(...)` commits, and source formatting is a separate `style` commit. An initial HTML encoding failure was corrected in its own fix commit; no history was rewritten. No remote was added and nothing was pushed.

```sh
git log --oneline
git status --short
```

`node_modules/`, `dist/` and `.env` files are ignored. The existing Vite scaffold dependencies were installed in step 1 so subsequent steps could be built independently. The dashboard service boundary was introduced alongside the first dashboard row and finalized with product and order services in step 23.

## Phase 2 notes — planning only

No Phase 2 implementation is included. Choose a route from the table before proceeding.

For a selected feature:

1. Define its domain types and a small service contract.
2. Add localStorage/IndexedDB persistence behind the service layer; keep pages independent of storage and mock files.
3. Implement the screen and its loading, validation, empty and error states.
4. Register its lazy loader and route in `src/config/pageRegistry.ts`; update the central feature status and planned feature checklist.
5. Verify the chosen workflow, responsive behavior and keyboard access, then update this route table.

Potential next modules include Products, Inventory, Customers or the POS cart. Authentication, payments and email remain UI-only unless a later brief explicitly changes the frontend-only scope.
