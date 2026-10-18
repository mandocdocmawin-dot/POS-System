import type { ReportFilter } from '../types/accounts';
import { useReportFilterStore } from '../store/useReportFilterStore';
import { useBranchStore } from '../store/useBranchStore';
import { financeData } from './financeData';
import { requirePermission } from './authService';
import { mergeLedger, filterLedger, accountBalance } from '../utils/ledger';
import { financeSummary, cashFlow } from '../utils/finance';
import { salesReport, groupAmounts } from '../utils/reports/sales';
import { productReport } from '../utils/reports/product';
import { expenseReport } from '../utils/reports/expense';
import { purchasesReport } from '../utils/reports/purchases';
import { supplierReport } from '../utils/reports/supplier';
import { defaultReportFilter, localDay, period, presetRange, shiftDay } from '../utils/reports/period';
import { timeSeries, type Granularity } from '../utils/reports/timeSeries';
import { toCentavos, multiplyCentavos } from '../utils/pos';
import { stockService } from './stockService';
let previousRefs:unknown[]=[];
const cache=new Map<string,unknown>();
function memo<T>(key:string,compute:(data:ReturnType<typeof financeData>)=>T):T {const data=financeData(),refs=Object.values(data);if(refs.length!==previousRefs.length||refs.some((r,i)=>r!==previousRefs[i])){cache.clear();previousRefs=refs;}if(!cache.has(key)){if(cache.size>40)cache.clear();cache.set(key,compute(data));}return cache.get(key) as T;}
function financialReport(data:ReturnType<typeof financeData>,range:ReportFilter){const ledger=mergeLedger(data),summary=financeSummary(data,range,ledger),previous=financeSummary(data,period.previous(range),ledger);const flow=cashFlow(data.accounts,ledger,range);const days=timeSeries.bucket([],'day',range);const trends=days.map(d=>({date:d.date,...financeSummary(data,{...range,from:d.date,to:d.date},ledger)}));const entries=filterLedger(ledger,range);return {...summary,previous,flow,trends,operatingCategories:groupAmounts(summary.operatingEntries.map(e=>({label:e.category,amount:e.amount}))),flowCategories:flow.rows.flatMap(a=>[...groupAmounts(a.entries.filter(e=>["income","transfer_in"].includes(e.type)).map(e=>({label:e.category,amount:e.amount}))).map(c=>({...c,account:a.name,direction:"Inflow"})),...groupAmounts(a.entries.filter(e=>["expense","transfer_out"].includes(e.type)).map(e=>({label:e.category,amount:e.amount}))).map(c=>({...c,account:a.name,direction:"Outflow"}))]),inflows:groupAmounts(entries.filter(e=>e.type==='income').map(e=>({label:e.category,amount:e.amount}))),outflows:groupAmounts(entries.filter(e=>e.type==='expense').map(e=>({label:e.category,amount:e.amount}))),snapshot:{receivables:data.customers.reduce((n,c)=>n+toCentavos(c.creditBalance),0),payables:supplierReport(data,{...range,from:'2020-01-01'}).reduce((n,s)=>n+s.balance,0),walletLiabilities:data.customers.reduce((n,c)=>n+toCentavos(c.walletBalance),0),inventoryValue:stockService.items().reduce((n,p)=>n+multiplyCentavos(toCentavos(p.cost),Math.max(0,p.stock)),0),cashBank:data.accounts.reduce((n,a)=>n+accountBalance(a,ledger,range.to),0)}};}
export const reportService={
 filters:()=>structuredClone(useReportFilterStore.getState().filter),
 setFilters:(filter:ReportFilter)=>{if(!filter.from||!filter.to||filter.from>filter.to)throw new Error('Choose a valid date range.');if(new Date(filter.to).getTime()-new Date(filter.from).getTime()>366*86400000*5)throw new Error('Choose a range of five years or less.');useReportFilterStore.setState({filter});},
 sales:(r:ReportFilter,g:Granularity='day')=>{requirePermission('reports:view');return memo(`sales:${JSON.stringify(r)}:${g}`,d=>salesReport(d,r,g));},
 product:(r:ReportFilter,slowDays=30)=>{requirePermission('reports:view');return memo(`product:${JSON.stringify(r)}:${slowDays}`,d=>productReport(d,r,slowDays));},
 productSummary:(r:ReportFilter,slowDays=30)=>{const rows=reportService.product(r,slowDays);return {revenue:rows.reduce((n,p)=>n+p.revenue,0),profit:rows.reduce((n,p)=>n+p.profit,0),quantity:rows.reduce((n,p)=>n+p.quantity,0),slow:rows.filter(p=>p.slow).length,topRevenue:[...rows].sort((a,b)=>b.revenue-a.revenue).slice(0,10),categories:groupAmounts(rows.map(p=>({label:p.category,amount:p.revenue})))};},
 expense:(r:ReportFilter)=>{requirePermission('reports:view');return memo(`expense:${JSON.stringify(r)}`,d=>expenseReport(d,r));},
 purchases:(r:ReportFilter)=>{requirePermission('reports:view');return memo(`purchases:${JSON.stringify(r)}`,d=>purchasesReport(d,r));},
 supplier:(r:ReportFilter)=>{requirePermission('reports:view');return memo(`supplier:${JSON.stringify(r)}`,d=>supplierReport(d,r));},
 supplierSummary:(r:ReportFilter)=>reportService.supplier(r).reduce((n,s)=>({purchases:n.purchases+s.purchases,returns:n.returns+s.returns,payments:n.payments+s.payments,balance:n.balance+s.balance}),{purchases:0,returns:0,payments:0,balance:0}),
 finance:(r:ReportFilter)=>{requirePermission('reports:finance');return memo(`finance:${JSON.stringify(r)}`,d=>financialReport(d,r));},
 dashboard:(r:ReportFilter={...defaultReportFilter(),branchId:useBranchStore.getState().branch},g:Granularity='day')=>memo(`dashboard:${JSON.stringify(r)}:${g}`,d=>({sales:salesReport(d,r,g),products:productReport(d,r),finance:financeSummary(d,r),customers:d.customers.filter(c=>!c.isWalkIn&&d.orders.some(o=>o.customerId===c.id&&(r.branchId==='all'||o.branchId===r.branchId))),inventory:{in:timeSeries.bucket(d.movements.filter(m=>m.type==='in'||m.type==='initial').map(m=>({date:m.createdAt,amount:m.quantity})),'month',r),out:timeSeries.bucket(d.movements.filter(m=>m.type==='out').map(m=>({date:m.createdAt,amount:m.quantity})),'month',r)},monthly:timeSeries.bucket([],'month',r).map(m=>{const from=`${m.date}-01`,to=shiftDay(localDay(new Date(Number(m.date.slice(0,4)),Number(m.date.slice(5,7)),1)),-1);return {date:m.date,...financeSummary(d,{...r,from:from<r.from?r.from:from,to:to>r.to?r.to:to})};})})),
 activeBranch:()=>useBranchStore.getState().branch,
 range:presetRange, previous:period.previous,
};

