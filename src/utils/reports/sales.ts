import type { FinanceData, LedgerEntry, ReportFilter } from '../../types/accounts';
import { financeSummary,salesRefunds } from '../finance';
import { filterLedger, mergeLedger } from '../ledger';
import { ratioCentavos, toCentavos } from '../pos';
import { inRange, localDay } from './period';
import { timeSeries, type Granularity } from './timeSeries';
export function groupAmounts(rows:{label:string;amount:number}[]){const map=new Map<string,number>();for(const r of rows)map.set(r.label,(map.get(r.label)??0)+r.amount);return [...map].map(([label,amount])=>({label,amount})).sort((a,b)=>b.amount-a.amount);}
export function salesReport(data:FinanceData,range:ReportFilter,granularity:Granularity='day',ledger:LedgerEntry[]=mergeLedger(data)){
 const finance=financeSummary(data,range,ledger),entries=filterLedger(ledger,range),receipts=entries.filter(e=>e.sourceType==='order'||e.sourceType==='collection');
 const orders=data.orders.filter(o=>o.orderStatus!=='cancelled'&&(range.branchId==='all'||o.branchId===range.branchId)&&inRange(o.createdAt,range));
 const allocated=(e:LedgerEntry,field:'subtotal'|'taxTotal'|'discount')=>{const o=data.orders.find(o=>o.id===e.sourceId);if(!o||!toCentavos(o.grandTotal))return 0;const amount=field==='discount'?toCentavos(o.itemDiscountTotal)+toCentavos(o.orderDiscount.amount):toCentavos(o[field]);return ratioCentavos(amount,e.amount,toCentavos(o.grandTotal));};
 const gross=receipts.reduce((n,e)=>n+allocated(e,'subtotal'),0),discounts=receipts.reduce((n,e)=>n+allocated(e,'discount'),0),tax=receipts.reduce((n,e)=>n+allocated(e,'taxTotal'),0);
 const refundsForRange=salesRefunds(data,range);const series=timeSeries.bucket([...receipts.map(e=>({date:e.date,amount:e.amount})),...refundsForRange.map(r=>({date:r.createdAt,amount:-toCentavos(r.refundAmount)}))],granularity,range);
 const daily=timeSeries.bucket([], 'day',range).map(({date})=>{const r=receipts.filter(e=>localDay(e.date)===date),refunds=refundsForRange.filter(r=>localDay(r.createdAt)===date).reduce((n,r)=>n+toCentavos(r.refundAmount),0);return {date,orders:orders.filter(o=>localDay(o.createdAt)===date).length,gross:r.reduce((n,e)=>n+allocated(e,'subtotal'),0),discounts:r.reduce((n,e)=>n+allocated(e,'discount'),0),refunds,net:r.reduce((n,e)=>n+e.amount,0)-refunds,tax:r.reduce((n,e)=>n+allocated(e,'taxTotal'),0)};});
 return {...finance,gross,discounts,tax,orders:orders.length,averageOrderValue:orders.length?Math.round(finance.revenue/orders.length):0,series,daily,payments:groupAmounts(receipts.map(e=>({label:data.accounts.find(a=>a.id===e.accountId)?.name??'Unknown',amount:e.amount}))),hourly:timeSeries.bucket(receipts.map(e=>({date:e.date,amount:e.amount})),'hour',range),cashiers:groupAmounts(receipts.map(e=>({label:e.createdBy??'Unknown',amount:e.amount}))),categories:groupAmounts(receipts.flatMap(e=>{const o=data.orders.find(o=>o.id===e.sourceId);return o?.items.map(l=>({label:data.productCategories.find(c=>c.id===data.products.find(p=>p.id===l.productId)?.categoryId)?.name??'Uncategorized',amount:toCentavos(o.grandTotal)?ratioCentavos(toCentavos(l.lineTotal),e.amount,toCentavos(o.grandTotal)):0}))??[];}))};
}

