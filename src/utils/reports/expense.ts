import type { FinanceData, ReportFilter } from '../../types/accounts';
import { filterLedger, mergeLedger } from '../ledger';
import { groupAmounts } from './sales';
import { timeSeries } from './timeSeries';
export function expenseReport(data:FinanceData,range:ReportFilter){const entries=filterLedger(mergeLedger(data),{...range,type:'expense'});const categories=groupAmounts(entries.map(e=>({label:e.category,amount:e.amount})));return {entries,total:entries.reduce((n,e)=>n+e.amount,0),categories,payees:groupAmounts(entries.map(e=>({label:e.payee??e.createdBy??e.reference??'Unspecified',amount:e.amount}))),split:groupAmounts(entries.map(e=>({label:e.sourceType==='manual'?'Manual':e.sourceType==='payroll'?'Salaries':e.sourceType==='refund'?'Refunds':'Supplier payments',amount:e.amount}))),series:categories.map(c=>({name:c.label,data:timeSeries.bucket(entries.filter(e=>e.category===c.label).map(e=>({date:e.date,amount:e.amount})),'day',range)}))};}
