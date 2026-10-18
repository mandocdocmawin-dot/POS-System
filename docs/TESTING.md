# Testing

## Automation

npm run check = strict TypeScript → ESLint/JSX accessibility → Vitest → production/PWA build → recursive initial/per-chunk gzip budgets → built URL scan. Licenses regenerate from installed manifests. Tests do not deliver messages or contact a backend.

Coverage includes fake-indexeddb storage/quota/quarantine, verified/idempotent legacy migration, central migrations/snapshots/rotation/restore, sync exclusions, earlier POS/inventory/finance rules and Phase 6 consistency, Phase 8 permissions/maintenance/calendar/notifications/search/templates/mailto/guide, ownership/numbering/limits, health repairs and backup round-trip/rejection/reset.

Old synchronous fixtures retain a localStorage test backend for rollback regressions. Dedicated fake-indexeddb tests cover the async adapter. Browser quota/offline/installation acceptance remains necessary.

## Manual regression · Phases 1–8

Use a disposable profile for corrupt/reset fixtures. Export JSON and separately download important document files first. These are test procedures, not assertions they have all been executed.

- [ ] Generate demo history, refresh and confirm IndexedDB backends/record persistence.
- [ ] Load old localStorage-only records; verify intact IDB copy/archive and second-run idempotency. Confirm explicit legacy cleanup.
- [ ] Corrupt a store via DevTools; confirm quarantine/Recovery, raw download, snapshot restore, broken-store versus all-data reset.
- [ ] Two tabs: sale updates Orders, auth/branch/cart/UI remain excluded, matching open record gets change notice.
- [ ] POS: barcode/search, quantity/discount/tax, split payment/change, credit, hold/resume, manager approval, refresh/history/receipt print.
- [ ] Catalog/variants/category/brand/unit/image validation; stock in/out/adjustment/history and branch quantities.
- [ ] Orders: collection/cancel/refund allocations/eligibility/restock; customer credit/wallet; supplier receiving/returns/payments and balances.
- [ ] Staff/roles/attendance/shifts/holidays/payroll: ownership/PIN, finalization/payment, historical snapshots, permissions/CSV/print.
- [ ] Account opening/closing/negative balance/transfer/cash flow; Dashboard/Sales/Finance consistency with identical filters.
- [ ] Settings snapshots, coupons, branch access and transfer send/receive/cancel. Old receipt settings preserved.
- [ ] Palette Ctrl/Cmd+K and /: product/order/page, accent/case, arrows/Enter/Esc, recents and permission filtering.
- [ ] Notifications: stock/overdue/backup, read/dismiss, type off, active branch scope.
- [ ] Account: own edits, read-only email/role/staff number, language label/default branch, demo security, local approval PIN and statement/log export.
- [ ] Pricing/billing: yearly saving, plan change/invoice/print, subscribed-plan delete protection, no real card capture.
- [ ] Documents: own/other access, small upload, 10 MB/.exe rejection, expiry, preview/download/delete/re-upload. Notes author/private/managers/pin/color/tags/search.
- [ ] Calendar: recurrence intervals/until/whole series, all-day/overlap/week start, five views, branch/layers and mobile agenda.
- [ ] Email: source/template variables, unknown-variable warning, drafts, Sent demo label, mailto encoding/truncation, trash/restore/delete and ownership.
- [ ] Chat: direct/group membership, search, replies, edit/delete own, read/unread, typing/demo reply, unique names and system #general.
- [ ] Help: create/reply/assign/close/delete/restore/yearly counter; Contact local ticket; Admin FAQ management.
- [ ] Public Landing quick logins, Privacy/Licenses/Roadmap/Blank/About version/build and optional placeholders.
- [ ] Maintenance: Cashier gated, public/auth/errors reachable, Admin banner/off, cart preserved.
- [ ] Activity History: actor/entity/action/date/branch/search, table/timeline/CSV/links; personal logs private.
- [ ] Data Health mismatch fixture, copy report, confirmed/idempotent/logged credit and wallet repairs.
- [ ] Phase 8 JSON export/import all records; invalid references rejected; document metadata File missing; reset clears new records/files and signs out.
- [ ] Guide start/progress/restart/dismiss/show/install; error details/copy/reload/dashboard/raw backup, capped errors/clear and storage notice.
- [ ] Production install/offline POS sale and Products/Orders/Reports, update safety and printer workflow: follow DEPLOYMENT.md.
- [ ] Keyboard-only skip/focus/menu/palette/table/calendar/dialog/drawer/popover/Escape/focus return; axe/Lighthouse if available.
- [ ] Every implemented page at 360/768/1024/1440, both themes/reduced motion/long names/empty-loading-error. No page scroll; tables inside cards; mobile drawers fullscreen.
- [ ] Print receipt, purchase order, report, schedule, payslip, transfer slip, statement and billing invoice in both themes; physical printer separately.
- [ ] Root and non-root VITE_BASE direct refresh/assets/manifest/shortcuts/fallback; real-host headers separately after publication.

See RELEASE-CHECKS.md for actual evidence and outstanding target-environment checks.

## POS reference refinements (2026-10-19)

- Category photos enlarged; desktop sidebar has vertical scrolling and no horizontal overflow.
- Shared customer/user/notification portrait avatars; uploaded staff portraits take priority.
- POS cart dropdown replaces the former store-link button, with product thumbnails and quantity controls. The dropdown stays open while adjusting quantities; stock validation still goes through the POS service.
- Notification All/Unread filters, user-menu links and existing demo role switching retained.
- Invoice opens a wide preview of the actual cart, with saved business/currency settings, line quantities, VAT, discounts and totals. It does not record a sale. Print / Save PDF uses the browser print dialog; Save Invoice downloads a standalone HTML document. HTML exports escape user-provided text.
- Payment Successful is shown only after the existing Complete Sale service returns a saved order; its amount, change and bill ID come from that order. View Receipt opens the historical receipt. Pay Later continues to show its credit-sale receipt.
- An isolated production preview origin was used to complete a sample sale and verify the success dialog and empty cart, keeping the main origin's existing cart intact.
- Actual printer / Save as PDF output remains a manual browser check.
