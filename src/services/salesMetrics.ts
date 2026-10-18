import {formatDateTime as displayDateTime} from '../utils/date';
import {refundService} from './refundService';
import {PAYMENT_METHODS} from '../config/pos';
import type {PaymentMethod} from '../types/pos';
import {orderService} from './orderService';
import {toCentavos,fromCentavos,sumCentavos,multiplyCentavos} from '../utils/pos';
export function salesOrders(today=false) {
 return orderService.list({today}).filter(o=>o.orderStatus!=='cancelled');
}
export function salesMetrics() {
 const all=salesOrders(),today=salesOrders(true);
 const revenue=sumCentavos(today.map(o=>toCentavos(o.grandTotal)));
 const cost=sumCentavos(today.flatMap(o=>o.items.map(l=>multiplyCentavos(toCentavos(l.costPrice),l.quantity))));
 const branchOrders=orderService.list();
 const refunds=refundService.list().filter(r=>branchOrders.some(o=>o.id===r.orderId)&&new Date(r.createdAt).toDateString()===new Date().toDateString());
 const refundTotal=sumCentavos(refunds.map(r=>toCentavos(r.refundAmount)));
 const activeRefunds=refunds.filter(r=>all.some(o=>o.id===r.orderId));
 const costReturned=sumCentavos(activeRefunds.filter(r=>r.restock).flatMap(r=>r.items.map(l=>{const line=all.find(o=>o.id===r.orderId)?.items.find(x=>x.id===l.orderLineId);return multiplyCentavos(toCentavos(line?.costPrice??0),l.quantity);}))); 
 return {todaySales:fromCentavos(revenue),totalOrders:all.length,netProfit:fromCentavos(revenue-cost-activeRefunds.reduce((n,r)=>n+toCentavos(r.refundAmount),0)+costReturned),salesReturn:fromCentavos(refundTotal)};
}
export function recordedPayments() {
 return salesOrders().flatMap(o=>{
  let change=toCentavos(o.change);
  return o.payments.map(p=>({...p})).reverse().map(p=>{const tender=toCentavos(p.amount);const returned=p.method==='cash'?Math.min(change,tender):0;change-=returned;return {id:p.id,orderNo:o.orderNo,method:p.method,time:displayDateTime(new Date(p.createdAt)),createdAt:p.createdAt,cents:tender-returned};}).reverse().filter(p=>p.cents>0);
 }).toSorted((a,b)=>b.createdAt.localeCompare(a.createdAt));
}
export function paymentShares() {
 const payments=recordedPayments();
 const amounts=new Map<PaymentMethod,number>(PAYMENT_METHODS.map(m=>[m.id,sumCentavos(payments.filter(p=>p.method===m.id).map(p=>p.cents))]));
 const total=sumCentavos([...amounts.values()]);
 const rows=PAYMENT_METHODS.map((m,i)=>{const numerator=BigInt(amounts.get(m.id)??0)*100n;return {...m,percent:total?Number(numerator/BigInt(total)):0,remainder:total?numerator%BigInt(total):0n,index:i,color:['bg-indigo-500','bg-teal-500','bg-sky-500','bg-amber-500','bg-rose-500','bg-violet-500'][i]};});
 if(total){const extra=100-rows.reduce((n,r)=>n+r.percent,0);const ranked=[...rows].sort((a,b)=>a.remainder===b.remainder?a.index-b.index:a.remainder>b.remainder?-1:1);for(let i=0;i<extra;i++)ranked[i].percent++;}
 return rows.map(({id,label,percent,color})=>({id,label,percent,color}));
}
