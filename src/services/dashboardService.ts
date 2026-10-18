import {branchService} from './branchService';
import { ShoppingBag, ShoppingCart, Wallet, RotateCcw } from 'lucide-react';
import { staffPerformance } from '../utils/staffPerformance';
import { weekStart } from '../utils/schedule';
import { authService } from './authService';
import { reportService } from './reportService';
import { financeData } from './financeData';
import { mergeLedger,filterLedger } from '../utils/ledger';
import { fromCentavos } from '../utils/pos';
import { payrollMoney } from '../utils/money';
import { localDay, inRange, presetRange, period } from '../utils/reports/period';
import { productService } from './productService';
import { stockService } from './stockService';
import { orderService } from './orderService';
const range=(preset='30d')=>({...presetRange(preset),branchId:reportService.activeBranch(),compare:false});
const delta=(value:number,previous:number)=>previous?`${Math.abs(Math.round((value-previous)/Math.abs(previous)*1000)/10)}%`:value?'New':'0%';
function branchCustomers(){const d=financeData(),branch=reportService.activeBranch();return d.customers.filter(c=>!c.isWalkIn&&d.orders.some(o=>o.customerId===c.id&&o.branchId===branch&&o.orderStatus!=='cancelled'));}
export const dashboardService={
 getOverview:()=>{const r=range('7d'),a=reportService.dashboard(r).finance,b=reportService.dashboard(period.previous(r)).finance;return {ownerName:authService.getCurrentUser()?.name??'Guest',salesGrowth:delta(a.revenue,b.revenue),grossProfitTrend:delta(a.grossProfit,b.grossProfit)};},
 getStats:()=>{const today=reportService.dashboard(range('today')),weekRange=range('7d'),w=reportService.dashboard(weekRange),p=reportService.dashboard(period.previous(weekRange));return [
 {title:'Today Sales',value:payrollMoney(today.sales.revenue),current:w.sales.revenue,previous:p.sales.revenue,icon:ShoppingBag,color:'bg-indigo-50 text-indigo-500 dark:bg-indigo-500/15'},
 {title:'Total Orders',value:String(today.sales.orders),current:w.sales.orders,previous:p.sales.orders,icon:ShoppingCart,color:'bg-teal-50 text-teal-600 dark:bg-teal-500/15'},
 {title:'Net Profit',value:payrollMoney(today.finance.netProfit),current:w.finance.netProfit,previous:p.finance.netProfit,icon:Wallet,color:'bg-amber-50 text-amber-500 dark:bg-amber-500/15'},
 {title:'Sales Return',value:payrollMoney(today.finance.refunds),current:w.finance.refunds,previous:p.finance.refunds,icon:RotateCcw,color:'bg-rose-50 text-rose-500 dark:bg-rose-500/15'},
 ].map(s=>({...s,trend:delta(s.current,s.previous),up:s.current>=s.previous,caption:'Today · week-over-week change'}));},
 getSummary:()=>{const customers=branchCustomers().filter(c=>c.status==='active'),r=range('7d'),current=customers.filter(c=>inRange(c.createdAt,r)).length,previous=customers.filter(c=>inRange(c.createdAt,period.previous(r))).length,orders=orderService.list().filter(o=>o.orderStatus!=='cancelled'),repeat=customers.filter(c=>orders.filter(o=>o.customerId===c.id).length>1).length,sales=reportService.dashboard(range()).sales;return {total:String(customers.length),trend:delta(current,previous),mini:[{label:'Repeat rate',value:`${customers.length?Math.round(repeat/customers.length*100):0}%`},{label:'New today',value:String(customers.filter(c=>localDay(c.createdAt)===localDay()).length)},{label:'Avg spend',value:payrollMoney(sales.averageOrderValue)}]};},
 getStaff:(selected:'today'|'week'='today',now=new Date())=>{const end=localDay(now);return staffPerformance(orderService.list(),selected==='week'?weekStart(end):end,end);},
 getGrossProfit:()=>{const f=reportService.dashboard(range()).finance;const bars=[['Revenue',f.revenue],['COGS',f.cogs],['Gross profit',f.grossProfit],['Expenses',f.operatingExpenses],['Net profit',f.netProfit],['Refunds',f.refunds]] as const;const max=Math.max(1,...bars.map(([,v])=>Math.abs(v)));return {value:payrollMoney(f.grossProfit),bars:bars.map(([label,v])=>({label,value:payrollMoney(v),percent:Math.round(Math.abs(v)/max*100)}))};},
 getLowStock:()=>productService.list().filter(p=>p.status==='active').map(p=>({...p,stock:stockService.getStock(p.id,undefined,branchService.activeId()),percent:p.reorderLevel>0?Math.min(100,Math.round(stockService.getStock(p.id,undefined,branchService.activeId())/p.reorderLevel*100)):0})).filter(p=>p.stock<=p.reorderLevel).sort((a,b)=>a.stock-b.stock).slice(0,5),
 getTopProducts:()=>{const r=range(),previous=reportService.dashboard(period.previous(r)).products;return reportService.dashboard(r).products.filter(p=>p.quantity>0).slice(0,5).map(p=>{const before=previous.find(x=>x.id===p.id)?.quantity??0;return {...p,sales:String(p.quantity),trend:delta(p.quantity,before),up:p.quantity>=before};});},
 getCustomers:()=>{const customers=branchCustomers(),newCount=customers.filter(c=>inRange(c.createdAt,range())).length,loyal=customers.filter(c=>c.points>0).length,current=customers.filter(c=>inRange(c.createdAt,range('7d'))).length,previous=customers.filter(c=>inRange(c.createdAt,period.previous(range('7d')))).length;return {total:String(customers.length),trend:delta(current,previous),names:customers.slice(0,4).map(c=>c.name),rows:[{label:'New customers (30 days)',count:String(newCount),percent:customers.length?Math.round(newCount/customers.length*100):0,color:'#6366f1'},{label:'Loyalty customers',count:String(loyal),percent:customers.length?Math.round(loyal/customers.length*100):0,color:'#14b8a6'}]};},
 getPayments:()=>{const s=reportService.dashboard(range()).sales;return s.payments.map((p,i)=>({label:p.label,percent:s.salesReceived?Math.round(p.amount/s.salesReceived*100):0,color:['bg-indigo-500','bg-teal-500','bg-amber-500','bg-rose-500'][i%4]}));},
 getTransactions:()=>{const d=financeData();return filterLedger(mergeLedger(d),{branchId:reportService.activeBranch()}).filter(e=>e.sourceType==='order'||e.sourceType==='collection').reverse().slice(0,5).map(e=>({id:e.reference+' · '+e.id.slice(-6),method:d.accounts.find(a=>a.id===e.accountId)?.name??'Unknown',time:new Date(e.date).toLocaleString(),amount:fromCentavos(e.amount)}));},
 getCategories:()=>{const r=reportService.dashboard(range()),categories=r.sales.categories;return {total:r.products.reduce((n,p)=>n+p.quantity,0).toLocaleString(),segments:categories.map((c,i)=>({name:c.label,percent:r.sales.salesReceived?Math.round(c.amount/r.sales.salesReceived*100):0,color:['bg-indigo-500','bg-teal-400','bg-amber-400','bg-rose-400'][i%4]})),rows:categories.slice(0,3).map(c=>({name:c.label,subtitle:'Received sales · last 30 days',value:payrollMoney(c.amount)}))};},
 getRecentOrders:()=>orderService.list(),
};
