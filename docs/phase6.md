# TindaPOS Phase 6

Phase 6 is complete. Phase 7 has not started. All changes stay on local `main`; nothing is pushed.

## New dependencies

```sh
npm install apexcharts react-apexcharts
```

No other chart, reporting or PDF dependency was added. Use `npm run dev`, `npm run build`, `npm run test` and `npm run lint`.

## Accounts and reporting

Income and Expenses combine read-only automatic entries with editable manual entries. Filters cover dates, categories, accounts, branches, sources and search. Manual entry forms use React Hook Form and Zod, support save-and-add-another, and save compressed receipt images in IndexedDB. Category management locks system categories and protects categories in use.

Bank accounts show derived balances and monthly inflows/outflows. Statements show the opening balance and each running balance, with CSV export and print. Transfers have previews, deposit/withdraw presets, persistent TF numbers and balance checks on create/edit/delete.

All six reports share persisted filters, previous-period comparisons, responsive charts, chart/table toggles, detail tables, CSV and print layouts. Sales rows drill down to filtered orders. Supplier reporting reuses the Phase 4 aging helper. The existing Supplier Balance Report remains available.

Dashboard charts and cards use the same pure reporting and finance functions. Subscriptions update the screen after a sale, collection, refund, expense, transfer or payroll payment. Chart code and report pages load lazily. The production entry bundle remains separate from the deferred ApexCharts bundle.

## Accounting rules

All Phase 6 amounts are integer centavos. Existing peso-denominated snapshots are converted once with the existing money helpers. No backend or API is used.

| Source | Cash ledger treatment | Profit treatment |
| --- | --- | --- |
| Order payment | Inflow to its mapped account, less cash change | Sales received |
| Customer balance collection | Inflow, counted once using the payment already attached to its order | Sales received on collection date |
| Unpaid Pay Later balance | No cash entry | Receivable; excluded from income |
| Refund to cash/bank/e-wallet | Outflow to the refund method's account | Reduces revenue |
| Refund to customer wallet | No cash outflow; customer wallet liability increases | Reduces revenue |
| Wallet top-up | Inflow marked as a liability | Excluded from income and profit |
| Wallet spending | No cash movement | Excluded from cash receipts |
| Supplier payment | Purchase outflow | Excluded from operating expenses; inventory cost becomes COGS when sold |
| Paid payroll | Derived Salaries outflow on `paidAt` | Operating expense |
| Manual income/expense | Stored manual entry | Other income / operating expense, excluding inventory Purchases |
| Transfer | Equal account-level transfer-out and transfer-in | Excluded from income and expenses |
| Cancelled order | No derived order/refund entries | Excluded |

- Revenue = sales received + collected balances − refunds.
- COGS = order-line cost snapshots × units sold − cost of restocked refund lines.
- Gross profit = Revenue − COGS.
- Operating expenses = manual operating expenses + paid salaries. Inventory Purchases are excluded.
- Net profit = Gross profit + other income − operating expenses.
- Account balance = opening balance + inflows − outflows + transfers in − transfers out.
- Cash-flow closing = cash-flow opening + inflows − outflows. Wallet refunds adjust revenue without affecting this cash equation.

Cash sales are recognized on payment dates; COGS follows sale and restock dates as specified for this phase. A collected balance can therefore be in a different reporting period from its COGS. The Finance report's “How is this computed?” popover explains these definitions.

Automatic entries are derived, never persisted. Marking payroll paid records its payment timestamp, account and branch snapshots; the ledger creates its Salaries view on demand. Automatic rows link to the related order, customer, supplier or payroll screen.

Payment mapping: cash → Cash Drawer; GCash → GCash; Maya → Maya; card and bank transfer → Bank Account. Payment-method charts distinguish card from bank transfer even though both share an account.

New purchases and wallet top-ups retain their branch. Legacy purchases/top-ups and unlinked inventory movements use Main Branch. Salaries use the recorded staff branch snapshot, with a first-branch fallback for older payroll. Inventory charts attribute linked movements using their source order, refund or purchase. Stock itself remains shared; full multi-store stock separation is out of scope. Accounts and transfers span branches, so Finance labels account cash flow accordingly. Receivables, wallets and stock in the balance snapshot are current; cash and payables use the selected end date.

## Permissions and persistence

| Role | Accounts view | Accounts manage | General reports | Finance report | Dashboard |
| --- | --- | --- | --- | --- | --- |
| Admin | Yes | Yes | Yes | Yes | All cards |
| Manager | Yes | No | Yes | No | Finance cards hidden |
| Cashier | No | No | No | No | Sales basics; login still opens POS |

Route guards, menu filtering and service PermissionErrors enforce the new keys. Existing system roles migrate; custom roles are unchanged. Mapped inactive accounts reject new payments, entries and transfers. Account/category history is protected; deactivate records in use. Expenses and transfers cannot overdraw their source account, and edits/deletions revalidate affected balances. New income can replenish an account even if an earlier automatic outflow has made it negative.

`tindapos:accounts` contains bank accounts, finance categories, manual entries, transfers, the transfer counter and history-generator flag. `tindapos:report-filters` remembers report filters. JSON backups include these records and receipt images. Zod and relationship checks validate imports before replacing state. Reset restores all phases' seeds and signs out. Legacy backups receive Phase 6 seed data.

## Manual test checklist

Use a disposable demo browser origin for the full reset/import workflow. These are manual acceptance steps; native printing is not claimed as automated coverage.

1. [ ] Sign in as Admin. Open Settings → General → Data → Generate demo history and confirm. Expect 315 additional orders across roughly 90 days, purchases as stock is replenished, payments, returns and expenses. Repeat generation: no duplicate history.
2. [ ] Open Dashboard and select Recent / This week / This month / This year. Verify real sales/order charts, monthly profit, inventory movements, categories and top products. Switch branches and verify scoped figures.
3. [ ] Make a POS sale using GCash. GCash balance increases by the retained payment. Cash change must not inflate receipts. Check the same-range, same-branch Sales and Finance revenue against Dashboard.
4. [ ] Refund a named customer's order to their wallet. Wallet liability increases; no cash ledger outflow appears. Revenue reflects the refund, and restocked items reverse COGS.
5. [ ] Top up a customer wallet. The mapped account increases and Income shows a Liability badge. Finance income/profit must exclude the top-up. Spend from that wallet: no second cash receipt.
6. [ ] Create Pay Later and collect part of its balance later. Unpaid amounts remain receivables; the collection is counted once on its payment date. Cancel a pending order and check cancelled orders produce no ledger entries.
7. [ ] Add a Rent expense with a receipt, reference, payee and branch. Edit it, refresh, preview the receipt and test Save and add another. Try an expense larger than Cash Drawer: blocked with the current balance in the error. Check filters, CSV, manual deletion and automatic read-only source links.
8. [ ] Manage categories: add, rename and deactivate a custom category. Reject deleting an in-use category and editing system categories. Create/edit/deactivate accounts; reject deleting a mapped or used account. Reject new entries/payments/transfers using an inactive account.
9. [ ] Deposit Cash Drawer → Bank using a quick preset. Check the live after-transfer preview, TF number, both statements and unchanged total cash. Reject overdraw and identical accounts. Edit/delete and verify balance protection.
10. [ ] Finalize a payroll and Mark as paid. Salaries expenses appear with the actual payment date, account, staff branch and payroll source link. Paying the same run again is blocked; manual entries contain no duplicated salary record.
11. [ ] Pay a supplier. The purchase/supplier balance updates and Accounts shows an automatic purchase outflow. Operating expenses and net profit must not treat that payment as a second cost.
12. [ ] Open every report, change date/branch filters, toggle comparisons, sort/search tables, toggle charts to tables, and export both report and chart CSVs. Click a Sales daily date to open filtered orders. Confirm Supplier Report links to the original balance report.
13. [ ] Check Finance P&L and the computation popover. For all branches, cash opening + inflows − outflows = closing; cash closing agrees with the account total for the same end date. Compare Dashboard net sales = Sales Report net sales = Finance revenue for the same period/branch.
14. [ ] Login as Manager: Accounts and general Reports are readable, Add/Edit/Delete controls are absent, and Finance is hidden/direct access returns 403. Login as Cashier: Accounts/Reports are hidden and denied; Dashboard shows sales basics without finance/team analytics.
15. [ ] Test dark mode, keyboard access, empty ranges, chart table views, narrow layouts and horizontal table scrolling. Print a report and account statement: navigation/filters are hidden, store/branch/range remain, and all detail rows print rather than just the visible page.
16. [ ] Refresh to verify persistence. Export JSON, reset, sign in and import it. Verify accounts, categories, entries, transfers, payroll, filters and receipt images. Reject malformed or broken-reference imports without changing current data. Finish by resetting disposable demo data.

## Verification

Automated tests cover ledger mapping, change/collection deduplication, wallet liabilities and refunds, cancelled/unpaid orders, account balances and cash reconciliation, transfer/entry constraints, snapshot COGS, paid salary derivation, report consistency, local calendar buckets, previous periods, product ranking/slow movers, supplier aging reuse, role migration, the complete demo generator and JSON round trips/corruption rejection.

Browser smoke checks confirmed Dashboard/Finance/Expenses rendering, the manual expense form, current-balance overdraw rejection, Manager read-only Expenses and Manager 403 on Finance. Follow the checklist for native printer output and the remaining interactive acceptance flows.

The requested 40 feature commits are preserved individually, followed where needed by focused fix/test commits. Inspect the full history with:

```sh
git log --oneline 3fcbdbd^..HEAD
git status --short
```

## Route status

The full route inventory is maintained in the README. Phase 6 routes and their aliases are:

| Route | Status |
| --- | --- |
| `/accounts/income` | done |
| `/accounts/expenses` | done |
| `/accounts/bank`, `/accounts/bank-accounts` | done |
| `/accounts/transfer`, `/accounts/money-transfer` | done |
| `/reports/sales` | done |
| `/reports/product` | done |
| `/reports/expense` | done |
| `/reports/purchases` | done |
| `/reports/finance` | done; `reports:finance` required |
| `/reports/supplier` | done |
| `/` Dashboard | done; role-aware real charts/cards |
| `/settings/general` | placeholder; existing Data card includes history/reset/import/export |
| Other Settings, Multi-Store, Calendar, Chat, Email, Pages | placeholder |
| Reviews, Print Barcode, Bulk Import/Export, Warranty | placeholder |
| Stock Transfer, Batch Management, Lost Items, Alerts, Valuation, Warehouse | placeholder |
| Components, Forms, Tables, Charts, Maps demos | placeholder |

## Phase 7 boundary

Wait for explicit instructions. No Phase 7 code was started. Double-entry accounting, tax filing, statutory payroll, bank reconciliation, multi-currency, PDF exports, scheduled/emailed reports, full Settings and multi-store separation remain out of scope.
