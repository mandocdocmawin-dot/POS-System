# TindaPOS

A frontend-only POS web app for Filipino stores. **Phase 2 (Products and Inventory) is complete. Phase 3 has not started.** Built with Vite, React, strict TypeScript, React Router v6, Tailwind, lucide-react and Zustand. No backend, API calls or database server.

## Run locally

Use Node.js 24 and npm. From an existing checkout:

```sh
npm install
npm run dev
```

New Phase 2 dependencies only:

```sh
npm install react-hook-form zod idb-keyval @hookform/resolvers
```

`@hookform/resolvers` connects React Hook Form to Zod. The lockfile records the installed versions.

```sh
npm run build
npm run lint
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
- POS: real active products, category/brand filters, name/SKU/barcode search, stored images and disabled out-of-stock preview buttons. Cart and checkout remain Phase 3 work.
- Dashboard: real low-stock products with reorder progress; real names/SKUs for top products while sales numbers remain explicitly mock.
- Settings → General: Data card for reset and JSON export/import, including images. The remainder of General stays a placeholder.

Reusable components include `DataTable<T>`, native modal dialogs and drawers with focus containment/Escape/focus restoration, confirmation dialogs, labeled form fields, switches, compressed image upload, toasts, page actions and stock badges. Tables scroll horizontally on narrow screens. New components support the existing dark theme.

Reviews, Print Barcode, Bulk Import, Bulk Export, Warranty, Stock Transfer, Batch Management, Lost Items, Alerts, Valuation and Warehouse remain placeholders. JSON backups in Settings and CSV export from All Products do not implement the reserved Bulk Import/Export pages. No cart, checkout, orders, customers, suppliers, reports or authentication logic was added.

## Data and service boundaries

```text
src/
  types/               Zod-backed product, variant, catalog and movement models
  store/               Persisted catalog, product and stock stores; toast store
  services/            Product/catalog/stock/image/data services and subscriptions
  data/seed/           Filipino store catalog, 25 products, variants and initial movements
  components/common/   Tables, dialogs, drawers, notifications, images and badges
  components/forms/    Accessible fields, upload and Zod form schemas
  pages/products/      Product and catalog screens
  pages/inventory/     Stock list, movement forms and history
  pages/settings/      General placeholder with the working Data card
  utils/               PHP money, dates, IDs, CSV, attributes and compression
  config/              Typed navigation, page loaders, route status and quick actions
```

New pages and components call services, including the `useLocalData` subscription hook; they do not access business stores or browser storage directly. Services wrap the stores so their implementation can later be replaced by a backend.

Structured business data uses Zustand persist and localStorage keys `tindapos:catalog`, `tindapos:products` and `tindapos:stock`. Product records contain only an `imageId`. JPEG/PNG/WebP uploads are compressed in-browser to JPEG at quality 0.8 with a maximum dimension of 800px, then stored with idb-keyval in IndexedDB `tindapos:images`. Missing/inaccessible images show a neutral placeholder. No remote image requests are made.

The first empty browser is seeded with eight categories and sixteen subcategories, eight brands, six units, 25 products and six variants. Some items have low or zero stock. Empty catalogs saved intentionally are not reseeded on refresh. Reset restores the demo catalog and stock history; export first to preserve your work. Branch switching remains a Phase 1 display control; Phase 2 uses one shared local catalog.

## Business rules

- Stock is derived from movements. `stockService.getStock(productId, variantId?)` returns item stock, or aggregates variants when a variant ID is omitted. Stock List shows each variant as an individual stock item.
- Initial/in/out quantities are positive. An adjustment stores its signed delta. Stock-out and adjustments cannot make current stock negative; a matching counted quantity creates no movement.
- SKU uniqueness is case-insensitive across products and variants. Product and variant IDs must also be unique. Services validate classification references and variant ownership.
- Used categories, subcategories, brands and units cannot be deleted; deactivate them instead. A category containing subcategories must have those moved/removed first.
- Stock tracking mode cannot be changed after movements exist, and variants with history cannot be removed. This preserves historical stock ownership. Product deletion explicitly confirms cascading removal of its variants and movements.
- JSON imports validate version, field types, IDs, SKUs, references, variant tracking and resulting stock before replacing data. Imported image payloads must be JPEGs of at most 800px. Confirmation is required, and failed browser storage writes attempt to restore the previous in-memory and persisted state.
- The browser is the only persistence layer. Clearing site data removes it. JSON export/import is the portable backup and recovery path; it is not a multi-user or multi-tab transactional database.

## Manual test checklist

1. Open `/products/categories`, add **Test Pantry**, then edit it. Check search, sorting and Escape dismissal.
2. Open `/products/add`. Enter **Test Rice**, generate a SKU, choose Test Pantry and kg, set cost **40**, price **55**, reorder level **10**, opening stock **8** and upload an image. Save; verify the thumbnail and low-stock badge.
3. Open its View drawer; confirm classification, pricing and its initial movement. Edit it and verify opening stock is no longer editable. Try leaving with an unsaved name change; cancel or confirm the warning.
4. In `/inventory/stock-in`, select Test Rice, receive **5** with Purchase, a reference and note. Stock becomes **13** and history shows +5.
5. In `/inventory/stock-out`, remove **3** as Damaged. Stock becomes **10**. Attempt more than current stock and confirm no movement is recorded.
6. In `/inventory/adjustment`, count **9**, supply a reason, review **10 → 9 (-1)** and confirm. Check all history filters and the stock drawer.
7. Refresh or reopen the same origin. Verify stock **9**, the uploaded image, category and movements persist. Check POS search/category filtering and its disabled out-of-stock buttons; the cart stays empty.
8. Create a second product with variants (for example Regular/Large), distinct SKUs, attributes and separate opening quantities. Check the Variants page and individual Stock List rows. Try a duplicate SKU and deletion of an in-use catalog record.
9. In Settings → General, export JSON. Import the file and confirm replacement; check image and stock preservation. Try malformed JSON, a duplicate SKU or an invalid reference and verify current data is preserved.
10. Export anything you want to keep, then click Reset demo data and confirm. Verify 25 products, six variants and restored opening stock. Check the pages in dark mode and at mobile width; tables should scroll without widening the page.

## Route status

`done` means implemented for its current phase. Dashboard sales and POS cart behavior retain their documented mock/preview limits. All routes not marked done remain placeholders. Existing menu URLs and the shorter Phase 2 URLs are both supported.

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

- `npm run build`: TypeScript and production build pass.
- `npm run lint`: zero errors and warnings.
- `npm run test:phase2`: 20 isolated service regression checks pass. These use in-memory storage and do not alter browser data. They cover seeding, create-form IDs, uniqueness, references, catalog deletion/deactivation, movement calculations, negative stock, variant ownership/history, import validation, persistence initialization, cascade deletion, JSON round trips, storage failure rollback and reset.
- Browser smoke checks: category creation, product creation with a compressed image, live margin, opening stock, stock in, stock out, confirmed adjustment, persistence after reopening, variant editing, image-inclusive JSON export/import and demo reset. The exported file was inspected for products, movements and its image payload.
- All 32 requested Phase 2 steps have their own local commits on `main`, plus a separate validation fix commit. Each requested step was built before committing. Existing history is preserved; nothing was pushed.

```sh
git log --oneline
git status --short
```

The regression runner uses Rolldown already included by Vite; it does not add a testing framework or backend dependency. Build output and node_modules remain ignored.

## Phase 3 notes

Phase 3 has not started. Cart, variant selection during a sale, checkout, orders and payment behavior require a separate brief. Authentication, customers, suppliers and reports also remain outside this phase. Stop here until instructed to continue.
