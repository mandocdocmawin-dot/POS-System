import {requirePermission} from './authService';
import {usePurchaseStore} from '../store/usePurchaseStore';
import {supplierPaymentSchema,type SupplierPayment} from '../types/phase4';
import {toCentavos as c,fromCentavos as p} from '../utils/pos';
import {purchaseFinancials} from '../utils/supplierBalance';
import {localTransaction} from './localTransaction';
import {activityService} from './activityService';
export const supplierPaymentService={
 list:(supplierId?:string)=>structuredClone(usePurchaseStore.getState().payments.filter(x=>!supplierId||x.supplierId===supplierId).toSorted((a,b)=>b.createdAt.localeCompare(a.createdAt))),
 record:(input:Omit<SupplierPayment,'id'>)=>{requirePermission('purchases:create');
  const parsed=supplierPaymentSchema.parse({...input,id:crypto.randomUUID()});if(parsed.method==='wallet')throw new Error('Customer wallet cannot pay suppliers.');
  const orders=usePurchaseStore.getState().purchases.filter(x=>x.supplierId===input.supplierId&&x.receiveStatus!=='cancelled'&&(!input.purchaseId||x.id===input.purchaseId)&&x.balanceDue>0).toSorted((a,b)=>a.date.localeCompare(b.date));
  let remaining=c(parsed.amount);if(!remaining||remaining>orders.reduce((n,x)=>n+c(x.balanceDue),0))throw new Error('Payment must be positive and cannot exceed the remaining purchase balance.');
  const allocations:SupplierPayment[]=[];for(const order of orders){const amount=Math.min(remaining,c(order.balanceDue));if(amount)allocations.push({...parsed,id:crypto.randomUUID(),purchaseId:order.id,amount:p(amount)});remaining-=amount;}
  return localTransaction(()=>{usePurchaseStore.setState(s=>{const payments=[...s.payments,...allocations];return {payments,purchases:s.purchases.map(x=>({...x,...purchaseFinancials(x,s.returns,payments)}))};});for(const pay of allocations){activityService.log('purchase',pay.purchaseId!,'payment',`Payment recorded: ${pay.amount.toFixed(2)}`);activityService.log('supplier',pay.supplierId,'payment',`Payment recorded: ${pay.amount.toFixed(2)}`);}return allocations;});
 },
};
