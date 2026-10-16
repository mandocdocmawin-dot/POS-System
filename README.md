# TindaPOS

A frontend-only POS web app for Filipino stores. **Phase 3 is complete: working local POS, checkout, credit sales, receipts and live Dashboard sales. Phase 4 has not started.** Built with Vite, React, strict TypeScript, React Router v6, Tailwind, lucide-react and Zustand. No backend, API calls or database server.

## Run locally

Use Node.js 24 and npm. From an existing checkout:

```sh
npm install
npm run dev
```

New Phase 3 dependency only (development):

```sh
npm install -D vitest
```

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
- Dashboard: real low-stock products with reorder progress; real names/SKUs for top products while sales numbers remain explicitly mock.
- Settings → General: Data card for reset and JSON export/import, including images. The remainder of General stays a placeholder.

Reusable components include `DataTable<T>`, native modal dialogs and drawers with focus containment/Escape/focus restoration, confirmation dialogs, labeled form fields, switches, compressed image upload, toasts, page actions and stock badges. Tables scroll horizontally on narrow screens. New components support the existing dark theme.

Reviews, Print Barcode, Bulk Import, Bulk Export, Warranty, Stock Transfer, Batch Management, Lost Items, Alerts, Valuation and Warehouse remain placeholders. JSON backups in Settings and CSV export from All Products do not implement the reserved Bulk Import/Export pages. Full Orders and Customers management, suppliers, reports and real authentication remain outside the implemented scope. POS history and quick customer creation are available inside `/pos`.

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

Structured business data uses Zustand persist and localStorage keys `tindapos:catalog`, `tindapos:products`, `tindapos:stock`, `tindapos:pos`, `tindapos:orders`, `tindapos:customers` and `tindapos:held-orders`. Product records contain only an `imageId`. JPEG/PNG/WebP uploads are compressed in-browser to JPEG at quality 0.8 with a maximum dimension of 800px, then stored with idb-keyval in IndexedDB `tindapos:images`. Missing/inaccessible images show a neutral placeholder. No remote image requests are made.

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
- Dashboard Today Sales, Total Orders, Net Profit, Sales Return (zero), Recent Orders, Recent Transactions and Payment Methods read real orders. Today Sales includes completed and pending credit-sale totals; Net Profit is today's grand totals minus snapshot cost of goods. Payment shares use amounts actually retained, after cash change, across this branch's recorded orders. Other cards/charts remain demo placeholders.
- Reset/export/import include customers, orders, held orders, the persisted order counter, open cart and referenced images. Legacy Phase 2 JSON imports remain supported and create no fictional sales. Imports validate protected Walk-in, numbering, totals and relationships before replacing data.

### Money and checkout rules

All calculations enter integer centavos through `src/utils/pos.ts`. Decimal inputs use rational arithmetic and half-up rounding; largest remainders distribute order discounts without losing a cent. Compute line subtotal → item discount → proportional order discount → VAT → grand total. Discounts cap at their applicable base. The pure `calculateTotals` function supports inclusive and exclusive tax; `src/config/pos.ts` is the single configuration point (inclusive by default).

One `posService.complete` call validates every line before writing, then records exactly one out movement per line with reason Sale and reference equal to its sequential `TP-000123` order number. Stock, customer credit/points, order counter/order and cart reset share rollback handling for browser write failures. Old price and cost snapshots are unaffected by subsequent catalogue edits. Loyalty awards one point per ₱100 actually paid; Regular/Silver/Gold/Platinum thresholds are 0/100/500/1000 points. These constants live in the POS config.

GCash/Maya/Card/Bank are cashier labels only. There are no API calls, payment SDKs, real payment processing, refunds, cancellation, PDF export, barcode label printing or authentication.

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

`done` means implemented for its current phase. POS checkout and the specified Dashboard sales metrics use real browser-persisted orders; unrelated Dashboard cards and charts retain their demo/placeholder status. All routes not marked done remain placeholders. Existing menu URLs and the shorter Phase 2 URLs are both supported.

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

## Phase 4 notes

Phase 4 has not started. Full Orders (All Orders, Refunded, Invoices), Customers management, suppliers, purchases, accounts, reports, staff and general Settings remain placeholders as shown in the route table. Future scope may add repayment management, refunds/returns, cancellation and broader reporting only after a new instruction. Real authentication, online payment processing and PDF export are not included. Stop at Phase 3.
