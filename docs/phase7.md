# Phase 7 — settings and multi-store

No dependencies were added. Use `npm run dev`, `npm run build`, and `npm run test`.
All data remains in this browser: versioned `tindapos:` localStorage stores and IndexedDB images. No payment or map SDK is used. The Google Maps address link opens only when clicked. Tax, receipts, approvals and payroll are demo features, not BIR-accredited or statutory-compliant.

## Settings guide

General edits business information, formats, logo and staff defaults. Section saves validate the complete section and write readable activity diffs. Manager can view settings; Admin can save. Coupons are managed by Admin and Manager. Data & Demo exports, imports, resets and generates history locally.

Tax sets VAT registration, inclusive/exclusive treatment, rates and receipt breakdown. Currencies changes formatting without converting stored values; foreign rates are manual references. Invoices configures numbering and receipt presentation. POS configures checkout, quick cash, loyalty, rounding and coupon stacking. Payment Gateway configures enabled payment methods, references, limits and accounts; its optional gateway is a local simulation. Manager configures approval thresholds and optional plain demo PINs.

Money is calculated through integer-centavo helpers. Completed sales snapshot tax, receipt settings, coupon amounts, rounding and payment accounts. Payroll snapshots staff defaults and earnings. Changing settings preserves existing records.

## Branches and transfers

Products, customers, suppliers, wallet balances and loyalty points are shared. Stock movements and held orders belong to branches. The active branch is independent of report scope. Cash drawers belong to selling branches; other accounts are shared. Receipt/cancel stock returns follow the original order branch; purchase returns follow the receiving branch.

Draft transfers reserve no stock. Sending deducts the source; receiving adds the received quantities to the destination. A partial receipt closes the transfer and logs the shortage as a writeoff. Cancelling an in-transit transfer returns its quantities to the source. Received transfers are locked.

## Manual test checklist

- [ ] General: save business information and formats, upload a logo, refresh and verify persistence. Change staff defaults; verify finalized payroll is unchanged.
- [ ] Tax: switch to exclusive and create a sale. Verify an earlier receipt is unchanged and the new receipt has the correct tax. Disable VAT and verify NON-VAT.
- [ ] Currencies: test symbol position, 0–3 decimals and separators; verify stored amounts do not change.
- [ ] Invoices: change prefix/paper/content and inspect the live receipt. Try lowering next number below a used number.
- [ ] POS: require a customer, disable decimal quantities, change quick cash, stock-card visibility and loyalty settings.
- [ ] Round cash to 0.25. Make an all-cash sale, check the signed Rounding receipt line and compare Dashboard, Sales and Finance totals. Repeat with split cash/noncash: no rounding.
- [ ] Coupons: create 10%, min 500 pesos, max 200 pesos. Test below minimum, expired/scheduled, wrong tier/branch, item eligibility and usage limits. Check code and amount in the receipt/order. Cancel an eligible pending order and verify usage is freed; refunds must not free it.
- [ ] Apply a coupon over an existing manual order discount and confirm replacement. Edit the cart/customer until the coupon is invalid; verify removal with a reason.
- [ ] Enable simulated gateway and pay with GCash, Maya or Card. Test failure, expiry and success with SIM reference. Verify no external request.
- [ ] Manager: set a 5% discount limit; Cashier attempts 8%, then approve using Manager. Enable PIN, save a staff PIN and test wrong/correct values. Test refund/cancel/adjustment/held-delete thresholds with a custom role.
- [ ] Stores: add a selling branch and verify its zero-opening cash drawer. Add a warehouse and verify POS is blocked there. Open all six profile tabs.
- [ ] Switch branches with a nonempty cart: confirm auto-hold under the old branch. Verify held carts are isolated and source stock changes only after sale.
- [ ] Inventory: compare branch stock; perform stock in/out/adjustment in each branch.
- [ ] Transfer Main to Branch 2: draft, send, partially receive, verify shortage/activity and locked final state. Send another and cancel, verifying stock returns. Inspect the printable slip.
- [ ] Receive a purchase into Branch 2; return part of it. Refund a Branch 2 order while Main is active: restock must go to Branch 2.
- [ ] Deactivate a branch with stock/in-transit transfers and review warnings. Try deleting a branch with history or deactivating the last active selling branch.
- [ ] Check branch-matched manual cash entries; compare individual branch charts with All branches. Inactive branches retain history.
- [ ] Manager sees read-only Settings and no store management. Cashier sees no Settings, Stores or Transfer navigation.
- [ ] Export, reset, import; check settings, coupons, branches, transfers, images and financial/stock snapshots.
- [ ] Check keyboard navigation, narrow layouts, dark mode and native receipt/transfer print previews.

## Validation and boundaries

Final verification:

- `npm run build`: passes strict TypeScript and the production build.
- `npm run test`: 291 tests pass across 20 files, including Phase 1–6 regressions and Phase 7 integration tests.
- `npm run test:phase2`: all 20 isolated legacy service checks pass with explicit branch arguments.
- `npm run lint`: zero errors and warnings.
- Local Chrome: all eight Settings pages, Stores/Add Store, Stock Transfer and POS load without runtime errors or external requests.
- Browser interactions: Tax save/diff confirmation, staff-default dirty/route warnings, adding a store and its cash drawer, simulated GCash checkout with SIM reference, Manager read-only settings and Cashier access denial pass.
- Mobile at 390px in dark mode: General, Tax, Currencies, Coupons, Store List, Add Store and Stock Transfer stay inside the viewport. All six Store Profile tabs open successfully.
- No dependencies were added. The existing Vite large-chart chunk advisory remains a build warning; there are no build errors.
- All 48 required commit messages were checked against the request in their exact order. Follow-up fixes are separate commits on `main`; no history was rewritten and nothing was pushed. See [the recorded Git log](phase7-history.txt).


The build and full Vitest suite are run before each required commit; additional integration fixes use new commits. Existing permission tests were updated only where Phase 7 intentionally changes role access. Native printer output requires manual verification. See `phase7-routes.md` for the full done/placeholder inventory.

Phase 8 has not started. Calendar, Chat, Email, Pages, Reviews, Barcode, Bulk Import/Export, Warranty, Batches, Lost Items, Alerts, Valuation, Warehouse and all component/form/table/chart/map demo routes remain placeholders. No real payment processing, map embedding, translation, loyalty redemption, register shifts, BIR compliance, messaging or PDF export is implemented.
