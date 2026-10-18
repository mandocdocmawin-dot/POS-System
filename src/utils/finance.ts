import type { BankAccount, FinanceData, LedgerEntry, ReportFilter } from '../types/accounts';
import { filterLedger, mergeLedger, statement } from './ledger';
import { inRange } from './reports/period';
import { multiplyCentavos, toCentavos } from './pos';
export function salesRefunds(data:FinanceData,range:ReportFilter){const orders=new Set(data.orders.filter(o=>o.orderStatus!=='cancelled'&&(range.branchId==='all'||o.branchId===range.branchId)).map(o=>o.id));return data.refunds.filter(r=>orders.has(r.orderId)&&inRange(r.createdAt,range));}
export function financeSummary(data:FinanceData,range:ReportFilter,allEntries=mergeLedger(data)) {
 const entries=filterLedger(allEntries,range), salesReceived=entries.filter(e=>e.sourceType==='order'||e.sourceType==='collection').reduce((n,e)=>n+e.amount,0),refunds=salesRefunds(data,range).reduce((n,r)=>n+toCentavos(r.refundAmount),0);
 const orders=data.orders.filter(o=>o.orderStatus!=='cancelled'&&(range.branchId==='all'||o.branchId===range.branchId));
 const costSold=orders.filter(o=>inRange(o.createdAt,range)).flatMap(o=>o.items).reduce((n,l)=>n+multiplyCentavos(toCentavos(l.costPrice),l.quantity),0);
 const costRestocked=data.refunds.filter(r=>r.restock&&inRange(r.createdAt,range)).reduce((n,r)=>{const o=orders.find(o=>o.id===r.orderId);return n+(o?r.items.reduce((sum,l)=>sum+multiplyCentavos(toCentavos(o.items.find(x=>x.id===l.orderLineId)?.costPrice??0),l.quantity),0):0);},0);
 const operatingEntries=entries.filter(e=>e.type==='expense'&&(e.sourceType==='manual'||e.sourceType==='payroll')&&e.category!=='Purchases');
 const operatingExpenses=operatingEntries.reduce((n,e)=>n+e.amount,0),otherIncome=entries.filter(e=>e.type==='income'&&e.sourceType==='manual'&&!e.isLiability).reduce((n,e)=>n+e.amount,0);
 const revenue=salesReceived-refunds,cogs=costSold-costRestocked,grossProfit=revenue-cogs,netProfit=grossProfit+otherIncome-operatingExpenses;
 return {salesReceived,refunds,revenue,cogs,grossProfit,operatingExpenses,otherIncome,netProfit,operatingEntries};
}
export function cashFlow(accounts:BankAccount[],entries:LedgerEntry[],range:{from:string;to:string}){const rows=accounts.map(account=>{const s=statement(account,entries,range);const inflows=s.rows.filter(e=>e.type==='income'||e.type==='transfer_in').reduce((n,e)=>n+e.amount,0),outflows=s.rows.filter(e=>e.type==='expense'||e.type==='transfer_out').reduce((n,e)=>n+e.amount,0);return {id:account.id,name:account.name,opening:s.opening,inflows,outflows,closing:s.closing,entries:s.rows};});return {rows,total:rows.reduce((n,r)=>({opening:n.opening+r.opening,inflows:n.inflows+r.inflows,outflows:n.outflows+r.outflows,closing:n.closing+r.closing}),{opening:0,inflows:0,outflows:0,closing:0})};}
export const financeDefinitions = [
 'Revenue (net sales) = cash sales received + collected balances − refunds. Wallet refunds reduce revenue and increase wallet liabilities without moving cash. Wallet spending does not move cash.',
 'COGS = cost snapshots of items sold − cost of restocked returns. Costs are recognized on the sale date; cash sales are recognized on payment dates.',
 'Gross profit = Revenue − COGS.',
 'Operating expenses = manual expenses + paid salaries. Inventory purchases are excluded; they become COGS when sold.',
 'Net profit = Gross profit + other manual income − operating expenses.',
 'Wallet top-ups are liabilities. Transfers and supplier payments are excluded from income and profit. Cash flow includes all actual cash movements.',
 'Purchases, payroll, and wallet top-ups without historical branch metadata use Main Branch (payroll uses the staff’s first branch). Account balances and transfers are shared across branches.',
];
