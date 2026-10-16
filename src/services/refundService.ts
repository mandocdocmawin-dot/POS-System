import {useRefundStore} from '../store/useRefundStore';
import {useOrderStore} from '../store/useOrderStore';
import {useCustomerStore} from '../store/useCustomerStore';
import {refundSchema,type Refund} from '../types/phase4';
import {orderService,tierFor} from './orderService';
import {stockService} from './stockService';
import {walletService} from './walletService';
import {activityService} from './activityService';
import {localTransaction} from './localTransaction';
import {refundLine,reversedPoints} from '../utils/refund';
import {toCentavos as c,fromCentavos as p} from '../utils/pos';
export interface RefundInput {orderId:string;lines:{id:string;quantity:number}[];reason:string;refundMethod:Refund['refundMethod'];restock:boolean;note?:string}
export const refundService={
 list:(orderId?:string)=>structuredClone(useRefundStore.getState().refunds.filter(x=>!orderId||x.orderId===orderId).toSorted((a,b)=>b.createdAt.localeCompare(a.createdAt))),
 preview:(input:RefundInput)=>{
  const o=orderService.get(input.orderId);if(!o||o.orderStatus==='cancelled')throw new Error('This order cannot be refunded.');
  const customer=useCustomerStore.getState().customers.find(x=>x.id===o.customerId);
  if(input.refundMethod==='wallet'&&(!customer||customer.isWalkIn))throw new Error('Wallet refund requires a named customer.');
  if(!input.lines.length||new Set(input.lines.map(l=>l.id)).size!==input.lines.length)throw new Error('Choose distinct order lines.');
  const history=refundService.list(o.id).flatMap(x=>x.items);
  const items=input.lines.map(selection=>{const l=o.items.find(x=>x.id===selection.id);if(!l)throw new Error('Order line not found.');return refundLine(l,selection.quantity,history);});
  const total=items.reduce((n,l)=>n+c(l.lineRefund),0);
  if(!total||total+c(o.refundedTotal)>c(o.amountPaid))throw new Error('Refund cannot exceed the amount paid. Collect the balance or select fewer items.');
  if(input.restock)for(const l of items)if(!stockService.items().some(x=>x.product.id===l.productId&&x.variant?.id===l.variantId))throw new Error('Restore the original product before restocking.');
  return refundSchema.parse({id:crypto.randomUUID(),refundNo:`RF-${String(useRefundStore.getState().counter+1).padStart(6,'0')}`,orderId:o.id,items,reason:input.reason,refundAmount:p(total),refundMethod:input.refundMethod,restock:input.restock,note:input.note,createdAt:new Date().toISOString(),createdBy:'Demo Admin'});
 },
 create:(input:RefundInput)=>{
  const r=refundService.preview(input),o=orderService.get(r.orderId)!;
  return localTransaction(()=>{
   if(r.restock)for(const l of r.items)stockService.record({productId:l.productId,variantId:l.variantId,type:'in',quantity:l.quantity,reason:'Customer return',reference:r.refundNo,createdAt:r.createdAt});
   if(r.refundMethod==='wallet')walletService.change({customerId:o.customerId,type:'refund',amount:r.refundAmount,orderId:o.id,note:r.reason});
   const total=p(c(o.refundedTotal)+c(r.refundAmount));
   const reversed=reversedPoints(o.pointsEarned,total,o.amountPaid)-reversedPoints(o.pointsEarned,o.refundedTotal,o.amountPaid);
   useCustomerStore.setState(s=>({customers:s.customers.map(x=>x.id===o.customerId?{...x,points:Math.max(0,x.points-reversed),tier:tierFor(Math.max(0,x.points-reversed))}:x)}));
   useOrderStore.setState(s=>({orders:s.orders.map(x=>x.id===o.id?{...x,refundedTotal:total,orderStatus:c(total)===c(o.grandTotal)?'refunded':'partially_refunded'}:x)}));
   useRefundStore.setState(s=>({refunds:[...s.refunds,r],counter:s.counter+1}));
   activityService.log('order',o.id,'refund',`${r.refundNo}: ${r.refundAmount.toFixed(2)} (${r.refundMethod})`);activityService.log('refund',r.id,'create',r.reason);activityService.log('customer',o.customerId,'refund',`${r.refundNo}: ${r.refundAmount.toFixed(2)}`);return r;
  });
 },
};
