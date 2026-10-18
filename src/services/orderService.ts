import {approvalService} from './approvalService';
import {validatePaymentAccount} from './financeData';
import {authService} from './authService';
import {requirePermission} from './authService';
import {POS_CONFIG} from '../config/pos';
import type {Customer} from '../types/pos';
import {useCustomerStore} from '../store/useCustomerStore';
import {useWalletStore} from '../store/useWalletStore';
import {useRefundStore} from '../store/useRefundStore';
import {customerPaymentSchema,type CustomerPayment} from '../types/phase4';
import {toCentavos as c,fromCentavos as p} from '../utils/pos';
import {stockService} from './stockService';
import {localTransaction} from './localTransaction';
import {walletService} from './walletService';
import {activityService} from './activityService';
import {useOrderStore} from '../store/useOrderStore';
import {useBranchStore} from '../store/useBranchStore';
import {usePosStore} from '../store/usePosStore';
import {orderSchema,type Order} from '../types/pos';
import {formatOrderNo} from '../utils/orderNo';
export const orderService={
 list:(options:{today?:boolean;search?:string;branchId?:string}={})=>structuredClone(useOrderStore.getState().orders.filter(o=>(options.branchId==='all'||o.branchId===(options.branchId??useBranchStore.getState().branch))&&(!options.today||new Date(o.createdAt).toDateString()===new Date().toDateString())&&(!options.search||o.orderNo.toLowerCase().includes(options.search.toLowerCase()))).toSorted((a,b)=>b.createdAt.localeCompare(a.createdAt))),
 get:(id:string)=>structuredClone(useOrderStore.getState().orders.find(o=>o.id===id)),
 payments:(customerId?:string)=>structuredClone(useWalletStore.getState().customerPayments.filter(x=>!customerId||x.customerId===customerId)),
 cancel:(id:string,reason:string)=>{requirePermission('orders:cancel');
  const o=orderService.get(id);if(!o||o.orderStatus!=='pending'||o.refundedTotal>0||useRefundStore.getState().refunds.some(r=>r.orderId===id))throw new Error('Only pending orders without refunds can be cancelled.');
  if(!reason.trim())throw new Error('A cancellation reason is required.');
  for(const line of o.items){if(!stockService.items().some(x=>x.product.id===line.productId&&x.variant?.id===line.variantId))throw new Error('Restore the original product before cancelling.');}
  return localTransaction(()=>{
   approvalService.ensure('cancel',0,JSON.stringify(['cancel',id,reason]));
   const createdAt=new Date().toISOString();
   for(const line of o.items)stockService.record({productId:line.productId,variantId:line.variantId,type:'in',quantity:line.quantity,reason:'Order cancelled',reference:o.orderNo,createdAt});
   if(o.amountPaid>0){const n=useRefundStore.getState().counter+1;useRefundStore.setState(s=>({counter:n,refunds:[...s.refunds,{id:crypto.randomUUID(),refundNo:`RF-${String(n).padStart(6,'0')}`,orderId:id,items:[],reason:'Order cancelled',refundAmount:o.amountPaid,refundMethod:'cash',restock:false,note:reason,createdAt,createdBy:authService.getCurrentUser()?.name??'System'}]}));}
   useOrderStore.setState(s=>({orders:s.orders.map(x=>x.id===id?{...x,orderStatus:'cancelled',cancelReason:reason,cancelledAt:createdAt,balanceDue:0,refundedTotal:o.amountPaid}:x)}));
   useCustomerStore.setState(s=>({customers:s.customers.map(x=>x.id===o.customerId?{...x,creditBalance:p(Math.max(0,c(x.creditBalance)-c(o.balanceDue))),points:Math.max(0,x.points-o.pointsEarned),tier:tierFor(Math.max(0,x.points-o.pointsEarned))}:x)}));
   activityService.log('order',id,'cancel',`${o.orderNo} cancelled: ${reason}. Paid amount recorded as cash refund.`);
  });
 },
 collect:(id:string,input:Pick<CustomerPayment,'amount'|'method'|'reference'|'note'>)=>{requirePermission('customers:manage');
  validatePaymentAccount(input.method);const o=orderService.get(id);if(!o||o.orderStatus==='cancelled'||!o.balanceDue)throw new Error('Order has no collectible balance.');
  const payment=customerPaymentSchema.parse({...input,id:crypto.randomUUID(),customerId:o.customerId,orderId:id,createdAt:new Date().toISOString()});
  if(c(payment.amount)<=0||c(payment.amount)>c(o.balanceDue))throw new Error('Payment must be positive and no greater than the balance.');
  if(payment.method==='wallet'&&c(useCustomerStore.getState().customers.find(x=>x.id===o.customerId)?.walletBalance??0)<c(payment.amount))throw new Error('Insufficient wallet balance.');
  return localTransaction(()=>{
   if(payment.method==='wallet')walletService.change({customerId:o.customerId,type:'spend',amount:-payment.amount,orderId:id});
   const due=c(o.balanceDue)-c(payment.amount);
   useOrderStore.setState(s=>({orders:s.orders.map(x=>x.id===id?{...x,payments:[...x.payments,payment],amountPaid:p(c(x.amountPaid)+c(payment.amount)),balanceDue:p(due),paymentStatus:due?'partial':'paid',orderStatus:!due&&x.orderStatus==='pending'?'completed':x.orderStatus}:x)}));
   useCustomerStore.setState(s=>({customers:s.customers.map(x=>x.id===o.customerId?{...x,creditBalance:p(Math.max(0,c(x.creditBalance)-c(payment.amount)))}:x)}));
   useWalletStore.setState(s=>({customerPayments:[...s.customerPayments,payment]}));activityService.log('order',id,'payment',`Collected ${payment.amount.toFixed(2)} for ${o.orderNo}`);activityService.log('customer',o.customerId,'payment',`Collected ${payment.amount.toFixed(2)} for ${o.orderNo}`);return payment;
  });
 },
 collectAll:(customerId:string,input:Pick<CustomerPayment,'amount'|'method'|'reference'|'note'>)=>{
  const orders=orderService.list({branchId:'all'}).filter(x=>x.customerId===customerId&&x.orderStatus!=='cancelled'&&x.balanceDue>0).toSorted((a,b)=>a.createdAt.localeCompare(b.createdAt));
  let remaining=c(input.amount);if(!remaining||remaining>orders.reduce((n,o)=>n+c(o.balanceDue),0))throw new Error('Payment exceeds customer balances.');
  if(input.method==='wallet'&&remaining>c(useCustomerStore.getState().customers.find(x=>x.id===customerId)?.walletBalance??0))throw new Error('Insufficient wallet balance.');
  return localTransaction(()=>{for(const o of orders){const amount=Math.min(remaining,c(o.balanceDue));if(amount)orderService.collect(o.id,{...input,amount:p(amount)});remaining-=amount;}});
 },
 nextOrderNo:()=>formatOrderNo(useOrderStore.getState().counter+1),
 save:(input:Order)=>{requirePermission('pos:use');const order=orderSchema.parse(input);const state=useOrderStore.getState();if(order.orderNo!==orderService.nextOrderNo())throw new Error('Order number changed. Please retry.');if(state.orders.some(o=>o.id===order.id))throw new Error('Sale already saved.');useOrderStore.setState({orders:[...state.orders,order],counter:state.counter+1});usePosStore.setState({activeOrderNo:orderService.nextOrderNo()});activityService.log("order",order.id,"create",`Created ${order.orderNo}`);return order;},
};

export function tierFor(points:number):Customer['tier']{return ([...Object.entries(POS_CONFIG.tiers)] as [Customer['tier'],number][]).reverse().find(([,n])=>points>=n)![0];}

