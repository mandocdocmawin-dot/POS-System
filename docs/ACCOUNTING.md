# Demo accounting rules

Source formulas are in src/utils/finance.ts, ledger.ts and utils/reports. This is the demo's reporting model, not a statutory accounting system. Calculations use centavos after converting legacy peso values.

| Measure | Formula/recognition |
| --- | --- |
| Sales received | Cash-account order payments plus collected balances on payment dates |
| Net revenue | Sales received minus period refunds |
| COGS | Sale-date quantities × cost snapshots, less cost of restocked returns |
| Gross profit | Net revenue − COGS |
| Operating expenses | Manual operating expenses plus paid salaries, excluding inventory purchases |
| Other income | Manual income excluding liabilities |
| Net profit | Gross profit + other income − operating expenses |
| Account balance | Opening + income + transfer-in − expense − transfer-out |
| Period closing | Period opening + inflows − outflows |
| Customer credit | Outstanding balances of non-cancelled orders |
| Wallet balance | Last chronological transaction balanceAfter |

Credit sales become revenue when collected. Cash change is removed from received totals. Wallet top-ups are liabilities; wallet spending does not create cash. Wallet refunds reduce revenue and increase liabilities without moving cash. Transfers/supplier payments do not increase profit; cash flow includes actual cash movements.

Purchases are not operating expenses; stock costs become COGS when sold. COGS uses sale dates while revenue uses collection dates, so periods with uncollected sales may show unusual profit. Historical costs and receipt settings are snapshots. Cancelled orders do not contribute sale revenue/costs.

Branch filters apply to source records. Older purchases/wallet top-ups lacking branch metadata fall back to Main Branch; payroll uses the staff's first branch. Bank balances/transfers are shared. Dashboard/Sales/Finance use common formulas, guarded by consistency tests.

Data Health detects stock/total/payment/refund/reference/duplicate/purchase/transfer/account/settings issues. Only customer credit and wallet recomputation are confirmed safe repairs; other issues are report-only.
