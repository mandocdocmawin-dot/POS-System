# TindaPOS

A frontend-only POS web app for Filipino stores. **Phases 1–6 are complete: POS, inventory, orders, customers, suppliers, purchases, demo roles, Staff/payroll, cash-basis Accounts, six Reports and live Dashboard charts. Phase 7 has not started.** Built with Vite, React, strict TypeScript, React Router v6, Tailwind, lucide-react and Zustand. No backend, API calls or database server.

## Run locally

Use Node.js 24 and npm. From an existing checkout:

```sh
npm install
npm run dev
```

Phase 6 adds only the chart dependencies for an existing checkout:

```sh
npm install apexcharts react-apexcharts
```

See [Phase 6 accounting rules, route summary and acceptance checklist](docs/phase6.md).

`@hookform/resolvers` connects React Hook Form to Zod. The lockfile records the installed versions.

```sh
npm run build
npm run lint
npm run test
npm run test:phase2
npm run preview
```

The build runs TypeScript checking and produces `dist/`. Static hosting must rewrite unknown URLs to `index.html` for direct React Router links. Browser data belongs to the origin, so use the same host and port when checking persistence.

## Working Phase 2 features

- Categories, subcategories, brands and units: searchable/sortable tables, CRUD modals, status controls, product counts, dependent parent categories and in-use deletion protection.
- Products: name/SKU/barcode search; category, brand, status and stock filters; selection and confirmed bulk deletion; CSV export; full details drawer with variants and the last five stock movements.
- Add/edit product: Zod validation, generated SKU, dependent subcategory, pricing and live margin after discount, tax, reorder level, description, status, images, unsaved-change warning and save-and-add-another. Opening quantities create initial movements only during creation.
- Variants: inline editor plus a shared overview with add/edit/remove, unique SKUs, free-text attributes and independent prices/stock. Enter attributes as `Size: L, Color: Red`. New product variants accept their own opening quantities.
- Inventory: product/variant stock list, summary totals and valuation; history drawer; stock in/out with reasons, reference, note, date and date/product history filters; counted stock adjustments with before/after confirmation.
- POS: the Phase 2 product browser now supports the complete Phase 3 cashier workflow described below.
- Dashboard: real low-stock products, sales, customers, product rankings, finance metrics and charts; calculations are shared with Reports.
- Settings → General: Data card for reset and JSON export/import, including images. The remainder of General stays a placeholder.

Reusable components include `DataTable<T>`, native modal dialogs and drawers with focus containment/Escape/focus restoration, confirmation dialogs, labeled form fields, switches, compressed image upload, toasts, page actions and stock badges. Tables scroll horizontally on narrow screens. New components support the existing dark theme.

Reviews, Print Barcode, Bulk Import, Bulk Export, Warranty, Stock Transfer, Batch Management, Lost Items, Alerts, Valuation and Warehouse remain placeholders. JSON backups in Settings and CSV export from All Products do not implement the reserved Bulk Import/Export pages. Orders, Customers, Suppliers and Purchases are implemented in Phase 4. Accounts and Reports are implemented in Phase 6; Staff is implemented in Phase 5. Multi-Store, Settings (apart from the existing Data card), Calendar, Chat and Email remain placeholders. Real authentication is not implemented.

## Data and service boundaries

```text
src/
  types/               Zod-backed catalog, stock, customer, cart, order and payment models
  store/               Persisted catalog, product, stock, POS, order, customer and held-order stores
  services/            Catalog/stock/POS/order/customer/hold/receipt/data services and subscriptions
  data/seed/           Catalog, 25 products, variants, six customers, 12 orders and stock movements
  components/common/   Tables, dialogs, drawers, notifications, images and badges
  components/pos/      Cashier controls, payments, receipts and history
  hooks/               POS shortcuts and search focus
  styles/print.css     Receipt-only thermal print layout
  components/forms/    Accessible fields, upload and Zod form schemas
  pages/products/      Product and catalog screens
  pages/inventory/     Stock list, movement forms and history
  pages/settings/      General placeholder with the working Data card
  utils/               PHP money, dates, IDs, CSV, attributes and compression
  config/              Typed navigation, page loaders, route status and quick actions
```

New pages and components call services, including the `useLocalData` subscription hook; they do not access business stores or browser storage directly. Services wrap the stores so their implementation can later be replaced by a backend.

Structured business data uses Zustand persist and localStorage keys `tindapos:catalog`, `tindapos:products`, `tindapos:stock`, `tindapos:pos`, `tindapos:orders`, `tindapos:customers`, `tindapos:held-orders`, `tindapos:refund`, `tindapos:supplier`, `tindapos:purchase`, `tindapos:wallet` and `tindapos:activity`, plus Phase 6 keys `tindapos:accounts` and `tindapos:report-filters`, and Phase 5 keys `tindapos:auth`, `tindapos:staff`, `tindapos:roles`, `tindapos:attendance`, `tindapos:holidays`, `tindapos:shifts` and `tindapos:payroll`. Product records contain only an `imageId`. JPEG/PNG/WebP uploads are compressed in-browser to JPEG at quality 0.8 with a maximum dimension of 800px, then stored with idb-keyval in IndexedDB `tindapos:images`. Missing/inaccessible images show a neutral placeholder. No remote image requests are made.

The first empty browser is seeded with eight categories and sixteen subcategories, eight brands, six units, 25 products and six variants. Some items have low or zero stock. Empty catalogs saved intentionally are not reseeded on refresh. Reset restores the demo catalog, six customers, 12 dated orders and matching Sale movements, and clears held orders and the open cart; export first to preserve your work. The catalog and stock remain shared, while saved orders and Dashboard figures are filtered by the selected branch.

## Business rules

- Stock is derived from movements. `stockService.getStock(productId, variantId?)` returns item stock, or aggregates variants when a variant ID is omitted. Stock List shows each variant as an individual stock item.
- Initial/in/out quantities are positive. An adjustment stores its signed delta. Stock-out and adjustments cannot make current stock negative; a matching counted quantity creates no movement.
- SKU uniqueness is case-insensitive across products and variants. Product and variant IDs must also be unique. Services validate classification references and variant ownership.
- Used categories, subcategories, brands and units cannot be deleted; deactivate them instead. A category containing subcategories must have those moved/removed first.
- Stock tracking mode cannot be changed after movements exist, and variants with history cannot be removed. This preserves historical stock ownership. Unsold product deletion confirms cascading removal of variants and movements. Products referenced by saved sales cannot be deleted; set them inactive to preserve history.
- JSON imports validate version, field types, IDs, SKUs, references, variant tracking and resulting stock before replacing data. Imported image payloads must be JPEGs of at most 800px. Confirmation is required, and failed browser storage writes attempt to restore the previous in-memory and persisted state.
- The browser is the only persistence layer. Clearing site data removes it. JSON export/import is the portable backup and recovery path; it is not a multi-user or multi-tab transactional database.

## Manual test checklist

1. Open `/products/categories`, add **Test Pantry**, then edit it. Check search, sorting and Escape dismissal.
2. Open `/products/add`. Enter **Test Rice**, generate a SKU, choose Test Pantry and kg, set cost **40**, price **55**, reorder level **10**, opening stock **8** and upload an image. Save; verify the thumbnail and low-stock badge.
3. Open its View drawer; confirm classification, pricing and its initial movement. Edit it and verify opening stock is no longer editable. Try leaving with an unsaved name change; cancel or confirm the warning.
4. In `/inventory/stock-in`, select Test Rice, receive **5** with Purchase, a reference and note. Stock becomes **13** and history shows +5.
5. In `/inventory/stock-out`, remove **3** as Damaged. Stock becomes **10**. Attempt more than current stock and confirm no movement is recorded.
6. In `/inventory/adjustment`, count **9**, supply a reason, review **10 → 9 (-1)** and confirm. Check all history filters and the stock drawer.
7. Refresh or reopen the same origin. Verify stock **9**, the uploaded image, category and movements persist. Check POS search/category filtering and its disabled out-of-stock buttons; add an item and verify the open cart persists.
8. Create a second product with variants (for example Regular/Large), distinct SKUs, attributes and separate opening quantities. Check the Variants page and individual Stock List rows. Try a duplicate SKU and deletion of an in-use catalog record.
9. In Settings → General, export JSON. Import the file and confirm replacement; check image and stock preservation. Try malformed JSON, a duplicate SKU or an invalid reference and verify current data is preserved.
10. Export anything you want to keep, then click Reset demo data and confirm. Verify 25 products, six variants and restored opening stock. Check the pages in dark mode and at mobile width; tables should scroll without widening the page.

## Working Phase 3 features

- Persistent cart with merged product/variant lines, whole or kg/liter fractional quantities, available-stock limits, item/order discounts and inclusive VAT. Search supports name, SKU and barcode; an exact SKU/barcode followed by Enter adds the matching product or opens its variant picker.
- Walk-in default, searchable customer selection, quick-add name/phone, points and tier. Walk-in cannot be edited, deleted or used for credit sales.
- Hold/resume/delete with labels and confirmations. Held carts retain their own snapshots and do not reserve or deduct stock. Resume rechecks availability.
- Recorded Cash, GCash, Maya, Card and Bank Transfer, optional references, multiple payment rows, exact/bill tender shortcuts and change. Non-cash overpayment is rejected. Enter completes a valid payment; Escape closes the top native dialog.
- Pay Later with optional down payment, informational due date, pending order, partial/unpaid status and customer credit balance. Stock is deducted for credit sales too. No repayment management is included.
- Receipt dialog after checkout, customer and branch snapshots, discounts/VAT, payments/change, points and BALANCE DUE. Draft invoice previews do not allocate an order number or alter stock. Today's branch-filtered POS history supports search and receipt reprint.
- Desktop/tablet order panel stays on the right. Phones use a floating cart count/total button and a bottom sheet with focus containment. F2 search, F4 customer, F8 payment, F9 hold, F10 confirmed clear, and +/− for the selected or last cart line; typing and open dialogs are protected from conflicting shortcuts. The ? menu lists shortcuts.
- Dashboard Today Sales, Total Orders, Net Profit, Sales Return, Recent Orders, Recent Transactions and Payment Methods read real orders. Today Sales uses retained cash receipts less refunds; Net Profit uses the shared Finance functions, including snapshot COGS, restocked refunds, other income and operating expenses. Today's branch-filtered refund records drive Sales Return. Cancelled orders are excluded from revenue and their refunds are not subtracted twice. Payment shares use amounts actually retained, after cash change, across this branch's recorded orders. Phase 6 replaces all remaining Dashboard chart/card demo values with shared cash-basis report calculations.
- Reset/export/import include customers, orders, held orders, the persisted order counter, open cart and referenced images. Legacy Phase 2 JSON imports remain supported and create no fictional sales. Imports validate protected Walk-in, numbering, totals and relationships before replacing data.

### Money and checkout rules

All calculations enter integer centavos through `src/utils/pos.ts`. Decimal inputs use rational arithmetic and half-up rounding; largest remainders distribute order discounts without losing a cent. Compute line subtotal → item discount → proportional order discount → VAT → grand total. Discounts cap at their applicable base. The pure `calculateTotals` function supports inclusive and exclusive tax; `src/config/pos.ts` is the single configuration point (inclusive by default).

One `posService.complete` call validates every line before writing, then records exactly one out movement per line with reason Sale and reference equal to its sequential `TP-000123` order number. Stock, customer credit/points, order counter/order and cart reset share rollback handling for browser write failures. Old price and cost snapshots are unaffected by subsequent catalogue edits. Loyalty awards one point per ₱100 actually paid; Regular/Silver/Gold/Platinum thresholds are 0/100/500/1000 points. These constants live in the POS config.

GCash/Maya/Card/Bank are cashier labels only. There are no API calls, payment SDKs, real payment processing, server authentication, PDF export or barcode label printing. Refund/cancellation records and demo authentication are implemented locally in Phases 4–5.

### Receipt printing

Print/Reprint calls `window.print()`. The print stylesheet hides the application, dialog controls and overlays and leaves the receipt. Default paper width is 80mm; change `POS_CONFIG.receiptWidth` to 58 for narrow receipts. The print page uses the configured width and a 297mm page length, with longer receipts continuing onto subsequent pages. Select the matching paper, 100% scale, no browser headers/footers and zero margins in the browser/printer dialog. The CSS bars are a decorative order reference, not a scanner-encoded barcode.

Browser verification confirmed receipt rendering and the Print action; the embedded browser did not expose its native print-preview controls to automation. Visually confirm final print preview and the target thermal printer using the checklist below. No PDF download feature is implemented.

### Phase 3 manual test checklist

1. On the same origin, open `/pos`, add Jasmine Rice, Lucky Me Pancit Canton and Century Tuna. Increase rice to 2 kg; verify stock limits and live totals.
2. Apply 10% rice discount and ₱5 order discount. With demo prices, subtotal is ₱188.00, item discount ₱13.60, order discount ₱5.00, included VAT ₱18.16 and total ₱169.40.
3. Preview Invoice: DRAFT appears; the cart, stock and next order number stay unchanged. Close it, enter a note, hold with a label, refresh and resume from View held orders. Check replace/cancel when another cart is open.
4. Pay cash ₱200.00; check ₱30.60 change. Press Enter to complete. Receipt opens, the cart clears, and the next order number advances once. Open Print and check only the receipt is present at 80mm; repeat with the 58mm config. Cancel preview if no printer is available.
5. In Stock List, verify the sold quantities decreased and movements show Sale with that order number. Return to Dashboard; Today Sales rises by ₱169.40 and Total Orders by one without a manual page refresh. Open the order receipt from Recent Orders.
6. Add a ₱16 item; pay ₱5 cash, Add another payment, and record ₱11 GCash plus a demo reference. Complete and verify both methods appear on the receipt; non-cash above ₱11 must be blocked.
7. Choose Pay Later as Walk-in: selection/creation is required. Quick-add a named customer, reopen Pay Later, record an optional down payment and due date, and verify pending/partial or unpaid status, BALANCE DUE and the customer's increased credit balance.
8. Select a customer and complete at least ₱100 of paid sales in one order; confirm earned points and configured tier thresholds. Confirm Walk-in receives no loyalty points.
9. Try a quantity above available stock: a clear toast appears, the quantity is restored and no sale is saved. Fractional pieces/packs must be rejected; positive fractional kg/liter quantities are allowed. Select a variant from the picker and scan its exact SKU followed by Enter.
10. Open History, search an order number, open its immutable receipt and reprint. Edit catalogue prices and verify old receipts and profit cost snapshots do not change. Change branch and verify sales/history/payments filter accordingly.
11. Refresh with an open cart and with a held cart. Verify customer, discounts, notes, cart and held orders persist. Export JSON in the Settings Data card, reset, then import it; verify customers, credit, sales, stock, held orders, open cart and next order number are restored. Malformed backups must leave current data intact.
12. Test F2/F4/F8/F9/F10, Escape, +/−, keyboard focus and the ? help popover. Check dark mode, 390px phone layout, 1024px tablet right panel, and desktop layout.

## Route status

`done` means implemented for its current phase. POS checkout and the specified Dashboard sales metrics use real browser-persisted orders; Staff Performance also reads real cashier orders; all Dashboard cards and charts now use computed data and role visibility. All routes not marked done remain placeholders. Existing menu URLs and the shorter Phase 2 URLs are both supported.

| Route | Screen | Layout | Status |
| --- | --- | --- | --- |
| `/` | Dashboards > Main | main | done |
| `/pos` | Dashboard > POS | pos | done |
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
| `/products/all-products` | Apps > Products > All Products | main | done |
| `/products/add-product` | Apps > Products > Add Product | main | done |
| `/products/variants` | Apps > Products > Variants | main | done |
| `/products/categories` | Apps > Products > Categories | main | done |
| `/products/subcategories` | Apps > Products > Subcategories | main | done |
| `/products/brands` | Apps > Products > Brands | main | done |
| `/products/units` | Apps > Products > Units | main | done |
| `/products/reviews` | Apps > Products > Reviews | main | placeholder |
| `/products/print-barcode` | Apps > Products > Print Barcode | main | placeholder |
| `/products/bulk-import` | Apps > Products > Bulk Import | main | placeholder |
| `/products/bulk-export` | Apps > Products > Bulk Export | main | placeholder |
| `/products/warranty` | Apps > Products > Warranty | main | placeholder |
| `/inventory/stock-list` | Apps > Inventory > Stock List | main | done |
| `/inventory/stock-in` | Apps > Inventory > Stock In | main | done |
| `/inventory/stock-out` | Apps > Inventory > Stock Out | main | done |
| `/inventory/stock-adjustment` | Apps > Inventory > Stock Adjustment | main | done |
| `/inventory/stock-transfer` | Apps > Inventory > Stock Transfer | main | placeholder |
| `/inventory/batch-management` | Apps > Inventory > Batch Management | main | placeholder |
| `/inventory/lost-items` | Apps > Inventory > Lost Items | main | placeholder |
| `/inventory/alerts` | Apps > Inventory > Alerts | main | placeholder |
| `/inventory/valuation` | Apps > Inventory > Valuation | main | placeholder |
| `/inventory/warehouse` | Apps > Inventory > Warehouse | main | placeholder |
| `/orders/all-orders` | Apps > Orders > All Orders | main | done |
| `/orders/refunded` | Apps > Orders > Refunded | main | done |
| `/orders/invoices` | Apps > Orders > Invoices | main | done |
| `/customers/customer-list` | Apps > Customers > Customer List | main | done |
| `/customers/add-customer` | Apps > Customers > Add Customer | main | done |
| `/customers/wallet-balance` | Apps > Customers > Wallet Balance | main | done |
| `/customers/activity-log` | Apps > Customers > Activity Log | main | done |
| `/suppliers/supplier-list` | Apps > Suppliers > Supplier List | main | done |
| `/suppliers/add-supplier` | Apps > Suppliers > Add Supplier | main | done |
| `/suppliers/payments` | Apps > Suppliers > Payments | main | done |
| `/suppliers/balance-report` | Apps > Suppliers > Balance Report | main | done |
| `/purchases/purchase` | Apps > Purchases > Purchase | main | done |
| `/purchases/add-purchase` | Apps > Purchases > Add Purchase | main | done |
| `/purchases/returns` | Apps > Purchases > Returns | main | done |
| `/purchases/payments` | Apps > Purchases > Payments | main | done |
| `/accounts/income` | Apps > Accounts > Income | main | done |
| `/accounts/expenses` | Apps > Accounts > Expenses | main | done |
| `/accounts/bank-accounts` | Apps > Accounts > Bank Accounts | main | done |
| `/accounts/money-transfer` | Apps > Accounts > Money Transfer | main | done |
| `/reports/sales` | Apps > Reports > Sales | main | done |
| `/reports/product` | Apps > Reports > Product | main | done |
| `/reports/expense` | Apps > Reports > Expense | main | done |
| `/reports/purchases` | Apps > Reports > Purchases | main | done |
| `/reports/finance` | Apps > Reports > Finance | main | done |
| `/reports/supplier` | Apps > Reports > Supplier | main | done |
| `/staff/staff-list` | Apps > Staff > Staff List | main | done |
| `/staff/add-staff` | Apps > Staff > Add Staff | main | done |
| `/staff/role-permission` | Apps > Staff > Role Permission | main | done |
| `/staff/attendance` | Apps > Staff > Attendance | main | done |
| `/staff/payroll` | Apps > Staff > Payroll | main | done |
| `/staff/holidays` | Apps > Staff > Holidays | main | done |
| `/staff/schedule` | Apps > Staff > Schedule | main | done |
| `/multi-store/store-list` | Apps > Multi-Store > Store List | main | placeholder |
| `/multi-store/add-store` | Apps > Multi-Store > Add Store | main | placeholder |
| `/settings/tax` | Apps > Settings > Tax | main | placeholder |
| `/settings/coupons` | Apps > Settings > Coupons | main | placeholder |
| `/settings/general` | Apps > Settings > General (Data card done) | main | placeholder |
| `/settings/pos` | Apps > Settings > POS | main | placeholder |
| `/settings/payment-gateway` | Apps > Settings > Payment Gateway | main | placeholder |
| `/settings/currencies` | Apps > Settings > Currencies | main | placeholder |
| `/settings/invoices` | Apps > Settings > Invoices | main | placeholder |
| `/settings/manager` | Apps > Settings > Manager | main | placeholder |
| `/auth/sign-in` | Authentication > Sign In | auth | done |
| `/auth/sign-up` | Authentication > Sign Up | auth | done |
| `/auth/forgot-password` | Authentication > Forgot Password | auth | done |
| `/auth/two-step-verification` | Authentication > Two Step Verification | auth | done |
| `/auth/reset-password` | Authentication > Reset Password | auth | done |
| `/auth/successful-password` | Authentication > Successful Password | auth | done |
| `/auth/account-deactivation` | Authentication > Account Deactivation | auth | done |
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
| `/errors/404` | Pages > Error Pages > 404 | main | done |
| `/errors/500` | Pages > Error Pages > 500 | main | done |
| `/components` | Components > Components | main | placeholder |
| `/forms` | Forms > Forms | main | placeholder |
| `/tables` | Tables > Tables | main | placeholder |
| `/charts` | Charts > Charts | main | placeholder |
| `/maps` | Maps > Maps | main | placeholder |
| `/activity-history` | Activity History > Activity History | main | placeholder |
| `*` | Unknown route (404) | main | done |
| `/products` | All Products alias | main | done |
| `/products/add` | Add Product alias | main | done |
| `/products/:id/edit` | Edit Product | main | done |
| `/inventory/stock` | Stock List alias | main | done |
| `/inventory/adjustment` | Stock Adjustment alias | main | done |
| `/orders` | All Orders alias | main | done |
| `/orders/:id` | Order Details | main | done |
| `/customers` | Customer List alias | main | done |
| `/customers/add` | Add Customer alias | main | done |
| `/customers/:id` | Customer Profile | main | done |
| `/customers/:id/edit` | Edit Customer | main | done |
| `/customers/wallet` | Wallet Balance alias | main | done |
| `/customers/activity` | Customer Activity alias | main | done |
| `/suppliers` | Supplier List alias | main | done |
| `/suppliers/add` | Add Supplier alias | main | done |
| `/suppliers/:id` | Supplier Profile drawer | main | done |
| `/suppliers/:id/edit` | Edit Supplier | main | done |
| `/suppliers/balance` | Supplier Balance alias | main | done |
| `/purchases` | Purchases alias | main | done |
| `/purchases/add` | Add Purchase alias | main | done |
| `/purchases/:id` | Purchase Details | main | done |

| `/staff` | Staff List alias | main | done |
| `/staff/add` | Add Staff alias | main | done |
| `/staff/:id/edit` | Edit Staff | main | done |
| `/staff/roles` | Role Permission alias | main | done |
| `/sign-in` | Sign In alias | auth | done |
| `/sign-up` | Sign Up alias | auth | done |
| `/forgot-password` | Forgot Password alias | auth | done |
| `/two-step-verification` | Two Step Verification alias | auth | done |
| `/reset-password` | Reset Password alias | auth | done |
| `/successful-password` | Successful Password alias | auth | done |
| `/account-deactivation` | Account Deactivation alias | auth | done |
| `/403` | No access | standalone | done |

## Verification and local history

- Phase 3: `npm run test` passes 28 Vitest tests covering centavos, VAT modes, mixed taxes, discount caps/distribution, rounding, splits/change, atomic checkout/rollback, stock and unit validation, immutable snapshots, credit, hold/resume, backup round trips, legacy imports, draft invariants and branch-filtered Dashboard calculations.
- Browser checks: three-product discounts, draft invoice, hold/resume, cash/change with Enter, split Cash + GCash/reference, Walk-in credit rejection, quick customer creation, partial credit receipt, history/reprint, barcode variant entry, overselling rejection, refresh persistence, Dashboard figures, desktop/tablet and 390px phone layout. No browser console errors were observed.
- All 33 requested Phase 3 steps have individual local commits on `main`, plus focused fixes and additional integration-test coverage. Build and tests ran before each Phase 3 commit once tests were introduced. No history was rewritten and nothing was pushed.

- `npm run build`: TypeScript and production build pass.
- `npm run lint`: zero errors and warnings.
- `npm run test:phase2`: 20 isolated service regression checks pass. These use in-memory storage and do not alter browser data. They cover seeding, create-form IDs, uniqueness, references, catalog deletion/deactivation, movement calculations, negative stock, variant ownership/history, import validation, persistence initialization, cascade deletion, JSON round trips, storage failure rollback and reset.
- Browser smoke checks: category creation, product creation with a compressed image, live margin, opening stock, stock in, stock out, confirmed adjustment, persistence after reopening, variant editing, image-inclusive JSON export/import and demo reset. The exported file was inspected for products, movements and its image payload.
- All 32 requested Phase 2 steps have their own local commits on `main`, plus a separate validation fix commit. Each requested step was built before committing. Existing history is preserved; nothing was pushed.

```sh
git log --oneline
git status --short
```

The Phase 2 regression runner uses Rolldown already included by Vite. Phase 3 adds Vitest as a development dependency; no runtime or backend dependency was added. Build output and node_modules remain ignored.

## Phase 4 completed

- Orders: all orders, branch/date/customer/status/method filters, CSV, detail pages, receipt printing, pending-order cancellation, balance collection, three-step partial refunds, refund slips and invoices with overdue filtering.
- Customers: list and profile tabs, create/edit forms with PH mobile validation, duplicate phone warnings, opening wallet funds, unsaved-change warnings, save-and-add-another, top-up/adjustment records, history and customer-related activity filters. Walk-in is protected; customers with orders or balances cannot be deleted.
- Suppliers: list and validated forms, profile drawer, recorded payments allocated to a purchase or oldest first, derived balances/credits and aging report with CSS bars and CSV.
- Purchases: list/filters, editable product/variant lines, centavo totals, optional initial payment and immediate receiving, partial receiving with optional latest-cost update, returns with stock-impact confirmation, purchase-order printing and purchase-linked payment history.
- Connections: wallet split payments at POS, View order in POS history, real quick-action destinations, refund-aware Dashboard metrics, real Recent Orders actions and configured sidebar count selectors.
- Every monetary or stock operation validates inputs in services. Transactions restore in-memory and persisted store snapshots on a failed write. Supplier payments and customer refunds are demo records only; they move no real money.
- Refunds use immutable line totals and cumulative centavo allocations, including decimal quantities and final-unit remainders. Loyalty reversals use a cumulative floor and recompute the customer tier.
- Purchase return credit uses the returned quantity times its snapshot unit cost. Discounts, shipping and tax remain purchase-level charges; this keeps the requested supplier credit model simple.
- JSON export/import/reset includes refunds, suppliers, purchases, purchase returns, supplier payments, wallet transactions, customer payments and activity logs. Zod plus relational/financial checks reject corrupt imports before writing. Older Phase 2/3 backups receive empty Phase 4 ledgers and defaults for extended records.
- First-run/reset demo data includes 6 suppliers, 8 purchases with mixed receiving/payment statuses, 2 purchase returns, 3 refunds, 3 wallet top-ups and 23 activity entries, with matching stock movements.

## Phase 4 manual checklist

Use one origin throughout; browser storage is separate for each host/port. Export existing data before resetting a browser you use for real demonstrations. The checklist is repeatable; unchecked boxes describe manual verification steps, not missing features.

1. [ ] At POS, select a named customer, add at least two units, pay, then follow View order from history. Find the same sale in All Orders; inspect totals, receipt and activity.
2. [ ] Refund one unit with Return items to stock enabled. Confirm the review amount, stock impact, RF number and slip. Check Stock List and Dashboard Sales Return/Net Profit.
3. [ ] Refund a remaining unit to Wallet. Check customer wallet/history, loyalty points and order status. Try excess quantity and amount-paid limits; neither may change any record.
4. [ ] Make a partially paid Pay Later sale with a due date. Cancel it with a reason and confirmation; verify stock restoration, credit reduction and the refund record for its down payment. Completed orders expose Refund instead of Cancel.
5. [ ] Create two Pay Later orders for one customer. Collect part of the first, then Collect all balances on the profile. Verify oldest-first allocation, payment records, unpaid → partial → paid and pending → completed.
6. [ ] Add/edit a customer with a PH phone number, email, notes and opening wallet funds. Try a duplicate phone, invalid phone, unsaved navigation and Save and add another. Walk-in cannot be edited.
7. [ ] Top up a wallet and make a signed adjustment with a required reason. Inspect balanceAfter records. Spend wallet funds in a POS split payment; excess spending and Walk-in wallet use must be blocked.
8. [ ] Open customer Overview, Orders, Payments, Wallet and Activity tabs; filter the Customer Activity Log. Deactivate a customer and inspect retained history.
9. [ ] Add a supplier, edit it, then inspect its profile tabs. Add a purchase as pending with quantities, costs, tax, discount, shipping and an optional down payment. Confirm the live totals and saved balance.
10. [ ] Receive part of a purchase; verify remaining quantity, stock movements and the latest-cost checkbox. Receive the rest; status becomes received. Attempts to over-receive must leave all stores unchanged.
11. [ ] Record a partial supplier payment, then use oldest-first allocation across purchases. Check before/after balance preview and both payment history screens. Excess payments must be blocked.
12. [ ] Return some received items. Check stock-impact confirmation, out movements and balance reduction; a return on a fully paid purchase becomes supplier credit. Reject quantities beyond received-minus-returned or available stock.
13. [ ] Inspect Supplier Balance Report totals, credits, last purchase and 0–30 / 31–60 / 60+ aging; download its CSV. Cancel an unpaid/unreceived purchase; receiving or payment prevents cancellation.
14. [ ] Open invoices; filter paid/unpaid/overdue, preview/print, and confirm Send only shows the demo email toast. Check order/refund CSVs and quick actions.
15. [ ] Refresh and reopen the browser at the same origin. Export JSON, reset, import it and compare all ledgers. Try a corrupt wallet balance or refund reference; import must reject it without changing data. Reset again and verify 8 purchases, 6 suppliers and 3 refunds.
16. [ ] Check dialogs, tables and forms with keyboard navigation, dark theme and a narrow viewport. Preview a receipt, refund slip and purchase order before printing.

## Phase 4 verification and local history

- `npm run build`: strict TypeScript and production build pass.
- `npm run test`: 48 tests pass, including refund rounding/limits, loyalty reversal, cancellation, credit collection/oldest-first allocation, wallet rules, partial receiving, return limits, negative-stock protection, supplier credits/payment caps/aging, rollback and full-ledger backup round trips/corruption rejection.
- `npm run lint`: zero errors or warnings.
- `npm run test:phase2`: all 20 previous service regression checks pass.
- `npm run dev -- --host 127.0.0.1`: Vite served successfully. Browser smoke checks on the isolated test origin covered a restocked wallet refund and slip, customer wallet/profile, opening wallet customer creation, pending purchase creation with initial payment, partial receipt, supplier payment, supplier return, derived report, refresh and demo reset. These complement the automated financial tests; the checklist above covers the wider manual pass, including print preview.
- All 42 requested steps have individual local commits on `main`, plus separate focused fixes found by tests and browser QA. Nothing is pushed and existing commits are preserved. The Phase 5 additions are documented below.

```sh
git log --oneline b31dd44..HEAD
git status --short
```

## Phase 5 completed

No new dependencies or installation commands are needed for an existing checkout. Use `npm run dev`, `npm run build` and `npm run test` as before.

### Demo accounts and authentication

Open `/sign-in` or `/auth/sign-in`. The form starts with the Admin demo email. **Any password, including an empty password, works; empty or unknown email signs in as an Admin.** A matching staff email signs in as that staff member. Sign In never checks credentials or expires a session.

| Quick login | Email | Default access |
| --- | --- | --- |
| Admin | `admin@tindapos.demo` | All permissions, including staff management and payroll. Admin permissions are locked. |
| Manager | `manager@tindapos.demo` | Every configured permission except `staff:manage`, `payroll:view`, `settings:manage`, `accounts:manage` and `reports:finance`. This includes attendance, schedules, holidays and editable non-Admin roles. |
| Cashier | `cashier@tindapos.demo` | Sales-only Dashboard, POS/hold, order history, product viewing, customer creation, own attendance and own read-only schedule. Refund, cancellation, inventory adjustment and existing-customer edits are unavailable by default. |

The user dropdown shows the actual name and role, a DEMO chip, a minimal profile drawer, Switch role and Logout. The POS Workspace menu links to permitted orders, customers, products and own attendance/schedule screens. Switching roles keeps the demo convenient without logging out; the first accessible route is selected after a switch or login. Access changes apply immediately to menus, route guards and service mutations. A forbidden direct URL renders 403.

- `useAuthStore` persists only `currentUserId` under `tindapos:auth`. Refresh keeps the session; logout clears it and goes to `/sign-in`.
- Sign Up creates an active Cashier staff record and signs in. Unique staff email and profile shape remain business validations; passwords are never checked or stored.
- Forgot Password → six verification boxes (any code accepted) → Reset Password → Successful Password → Sign In is a UI flow. No messages are sent and no credentials are changed.
- Account Deactivation marks the signed-in staff inactive, logs out and displays confirmation. Inactive demo staff can still sign in; protected pages show an inactive-account banner. The last active Admin cannot be deactivated, deleted or demoted.
- No JWT, cookies, password hashes, authentication APIs, captcha, rate limiting or lockouts are implemented.

### Staff and operations

- Staff List has search, role/status/branch filters, total/active/on-duty/late summary cards, role/status/attendance chips and view/edit/deactivate actions. The profile drawer has Overview, the last 30 days of Attendance, permission-protected Payroll history, Schedule, Activity and real order/refund performance.
- Add/Edit Staff uses Zod and React Hook Form, unique email, branch multi-select, hire date, hourly/monthly rates entered in PHP and stored as centavos, status and compressed avatar upload. It includes unsaved-change protection and Save and add another.
- A staff member cannot change their own role or delete themselves. Staff referenced by attendance, payroll, shifts or orders must be deactivated instead of deleted. Renaming preserves stored historical cashier/actor names and retains identity links to their records.
- Role Permission supports custom roles, search, module selection, an added/removed diff and confirmation before saving. Admin is locked; assigned custom roles cannot be deleted. System roles can reset to defaults.
- Attendance has the current user's live clock and clock-in/out panel, Today and Records views, date/staff/status filters, worked-hour/late/absence summaries, CSV and a per-staff month calendar. Cashiers see only their own records. Manual corrections require a note and use source `manual`; duplicate staff/date records, double clock-in/out and invalid clock order are blocked.
- Schedule has a staff-by-seven-days grid, week navigation, Morning 08:00–16:00, Mid 12:00–20:00 and Evening 14:00–22:00 templates, custom same-day times, branch/note, copy previous week, confirmed clear week and print styling. Overlaps block the entire operation. Holidays and leave show warnings without blocking shifts. Cashiers have read-only own schedules.
- Holidays has searchable list and year calendar views, colored types, paid flags and CRUD. Date/name duplicates are blocked. The 2026 seed contains 12 regular and 8 special non-working nationwide holidays; EDSA's special working day is intentionally excluded. Sources: [Proclamation 1006 via NIA](https://omcrs.nia.gov.ph/?q=system/files/mc/2025_089.pdf), [Eid’l Fitr proclamation via Customs](https://customs.gov.ph/wp-content/uploads/2026/03/2026-31-OCOM-MEMO.pdf), and [Eid’l Adha declaration via PCO](https://pco.gov.ph/news_releases/palace-declares-may-27-as-a-regular-holiday-for-eidl-adha-observance/).

### Demo payroll

Payroll is labeled **demo computation, not statutory-compliant**. The defaults live in `src/config/payroll.ts`: regular hours up to 8/day, overtime at 1.25x, regular-holiday work at 2.0x, special-holiday work at 1.3x, and proportional late deductions. A configured paid holiday not worked receives a regular daily allowance. Monthly base is monthlyRate/2 per run, with a simple 26-day divisor for explicit unpaid absence/leave; custom periods do not introduce statutory proration.

New payroll → semi-monthly 1–15 / 16–end or custom period → compute preview → optional additions/deductions → review totals → Save as Draft → Finalize → Mark as paid. Preview is not persisted until Save as Draft. Overlapping periods are rejected. Saving rejects a stale preview if attendance or rates changed. Finalized/paid runs are locked; later staff-rate changes do not rewrite snapshots. Late deductions are computed and locked; manual adjustments remain separately labeled. All money uses integer centavos and the existing rational rounding helpers.

Payslips show employee, period/status, snapshot rates, attendance totals, earnings breakdown, additions/deductions and net pay. Draft slips are marked DRAFT. Print uses `window.print()` and a dedicated stylesheet; choose the printer and verify its native print preview. Mark as paid records a status/activity event only, with no transfer, accounting or expenses integration. SSS, PhilHealth, Pag-IBIG and taxes remain unimplemented.

### Connections, persistence and migration

- New activity records, orders/receipts, refunds and stock movements use the signed-in user. Activity timelines display actor names. Historical names stay stored on existing records.
- Cashier discounts above the configurable 10% threshold require selecting a Manager/Admin demo approver, with no password. Checks cover per-item discounts and combined item/order discounts. The approver name is logged; approval stays tied to the cashier and exact cart, persists with that cart and is rechecked against current role permissions. Failed writes roll back both approval and its activity entry.
- Dashboard Staff Performance uses actual branch-filtered orders, a Today/This week selector, refund-adjusted ranking, order count, net sales and active cashier count. Other placeholder analytics/charts stay unchanged.
- The config-driven Staff sidebar badge counts active current-branch staff who are late or absent; missing attendance is not flagged before the shift grace period.
- First-run/migration creates Admin/Manager/Cashier roles, 3 matching demo staff plus 5 other staff, 30 days of attendance, this week's shifts, 2026 holidays, one finalized run and one draft. An old state without Staff/auth data is logged out without replacing its Phase 2–4 business records.
- JSON backups now include a `phase5` object: staff, roles, attendance records, holidays, shifts, payroll runs and demo session. Staff avatars are included and their IDs are remapped on import. The existing POS snapshot also includes any current discount approval.
- Zod plus relational checks reject missing staff/roles/branches, duplicate emails/attendance, invalid shifts, overlapping runs, inconsistent payroll totals, a missing last active Admin or modified Admin permissions before writing. Legacy Phase 2–4 backups receive fresh Phase 5 seed data and a logged-out session.
- Reset restores every phase's demo records, restores default roles, clears the cart and logs out. Import and reset require `settings:manage`; the existing General Settings Data card remains the entry point. The rest of Settings is still a placeholder.

### Phase 5 route summary

The full route table above remains the inventory for Phases 1–5.

| Route(s) | Status | Default access |
| --- | --- | --- |
| `/sign-in`, `/auth/sign-in` | done | Public demo login |
| `/sign-up`, `/forgot-password`, `/two-step-verification`, `/reset-password`, `/successful-password`, `/account-deactivation` and matching `/auth/*` routes | done | Public UI flow; deactivation requires a signed-in staff record |
| `/staff`, `/staff/staff-list` | done | Admin, Manager |
| `/staff/add`, `/staff/add-staff`, `/staff/:id/edit` | done | Admin |
| `/staff/roles`, `/staff/role-permission` | done | Admin, Manager; Admin role locked |
| `/staff/attendance` | done | Admin, Manager; Cashier own only |
| `/staff/schedule` | done | Admin, Manager; Cashier own read only |
| `/staff/holidays` | done | Admin, Manager |
| `/staff/payroll` | done | Admin |
| `/403` and forbidden protected URLs | done | No-access recovery |
| `/` | done | Admin, Manager; Cashier sales basics only |
| `/pos`, implemented Products/Inventory/Orders/Customers/Suppliers/Purchases routes | done | Existing modules with role guards and action checks |
| Multi-Store, Calendar, Chat, Email, Pages/Profile/Account/Pricing | placeholder | Permission-filtered planned pages |
| Settings routes, including `/settings/general` | placeholder | Existing Data backup/reset card only |
| Previously unbuilt product/inventory pages | placeholder | As listed in the full route table |

### Phase 5 manual checklist

Use one origin throughout. Older phase checklists can be run as Admin. The following are repeatable manual steps, not a claim that native printing has been automated.

1. [ ] Open Sign In. Submit blank credentials, then any random email/password: both sign in as Admin. Refresh, confirm the session remains, then Logout and confirm `/sign-in`.
2. [ ] Click Login as Cashier. Check the visible name and Workspace destinations. Open `/staff` and `/staff/payroll` directly: both show 403. Refund/Cancel and product creation/deletion are unavailable.
3. [ ] Add a product, apply a 20% discount: Manager approval required appears. Choose Demo Manager and approve without a password. Complete the sale; receipt says Demo Cashier and includes the approved discount. Refreshing an approved unchanged cart retains its approval.
4. [ ] Switch to Manager using the DEMO role switcher. Open the Cashier's order and refund a permitted quantity. Check the refund actor, slip, stock, wallet/loyalty effects and activity. Existing refund/stock/discount limits still apply.
5. [ ] Switch to Admin, open Role Permission, grant Cashier `orders:refund`, review the diff and confirm. Switch to Cashier and confirm access immediately. Restore defaults; confirm the action disappears without refresh. Admin permissions remain locked.
6. [ ] Add/edit staff with branches, rates and avatar; try duplicate email, invalid fields, unsaved navigation and Save and add another. Your own role is locked. Create a custom role, assign it and confirm deletion is blocked until reassigned.
7. [ ] Try deactivating the last active Admin: blocked. Deactivate another staff member, sign in using that email and confirm the inactive banner. Historical orders/attendance/payroll remain.
8. [ ] As Cashier, open My attendance from Workspace. Clock In, try Clock In again, then Clock Out. Only own records are visible. As Manager/Admin, add/edit a manual record with a required note, filter ranges, inspect the calendar and export CSV.
9. [ ] Open Schedule. Add template/custom shifts, test overlap and end-before-start rejection, copy a previous week, clear with confirmation and navigate weeks. Add a shift on a holiday or leave date: a warning appears but save is allowed. Cashier sees only their own read-only row. Check print preview.
10. [ ] Open Holidays in list and calendar modes. Create/edit/delete a store holiday, reject a duplicate date/name, toggle paid and inspect attendance holiday status and subsequent payroll computation.
11. [ ] Create a payroll for an unused period. Preview, add a labeled bonus/deduction, review totals and Save as Draft. Finalize, confirm adjustments are gone/locked, then Mark as paid. A duplicate/overlapping period must be rejected. Inspect/print a staff payslip with snapshot earnings and rates.
12. [ ] Check Staff profile tabs, activity actor names and real sales/refund counts. In Dashboard, select Today and This week and compare top cashier/net sales with the current branch's real orders.
13. [ ] Export JSON as Admin. Reset: session clears. Log in as Admin and import the backup; compare staff, roles, attendance, shifts, holidays, payroll, cart, avatars and the saved session. Corrupt a staff reference or payroll total and confirm import rejects it without changing data.
14. [ ] Walk Forgot Password → any verification code → any reset-password values → Successful Password → Sign In. No credentials are changed and no mail is sent. Sign Up creates and signs in an active Cashier.
15. [ ] As a non-last-Admin user, use Profile → Deactivate account, confirm the success page and logout, then sign in again and check the inactive banner. Finish by resetting demo data as Admin.
16. [ ] Check keyboard access, empty states, dark mode, narrow layouts, scrolling tables/dialogs and native payslip/schedule/receipt print previews.

### Phase 5 verification and local history

- `npm run build`: strict TypeScript and production build pass.
- `npm run test`: 219 tests pass across 11 files. Coverage includes default/custom roles and route mapping, last-admin/self-role/custom-role protections, clock/late/worked hours, shift overlaps, exact-centavo regular/overtime/holiday/monthly payroll and period locking, staff history after rename, discount approval/revocation/rollback, real staff performance and Phase 5 backup migration/round trips/corruption rejection.
- `npm run lint`: zero errors and warnings.
- `npm run test:phase2`: all 20 legacy isolated service checks pass.
- `npm run dev -- --host 127.0.0.1 --port 5175 --strictPort`: served successfully for an isolated browser smoke pass. Verified payroll preview, PHP bonus, saved draft, finalization/locked controls, paid status/activity, payslip earnings, saving the current Admin's profile, blocked last-admin deactivation, Cashier quick login, 20% approval picker, approved checkout/receipt name and Cashier 403 on Staff. The earlier Step 27 browser pass verified the weekly grid, overlap error and Cashier own read-only schedule. Native printer output remains a manual checklist step.
- All 35 requested steps have individual Conventional Commits on `main`. Additional focused `fix` commits preserve the original history. No commits are rewritten and nothing is pushed.

```sh
git log --oneline ca567bc..HEAD
git status --short
```

## Phase 6

Accounts, six Reports and all Dashboard charts are complete. See [the Phase 6 guide](docs/phase6.md) for accounting formulas, role access, persistence, the manual test checklist, validation notes and Phase 7 boundaries. Phase 7 remains unstarted.

