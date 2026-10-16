import {supplierPaymentService} from './supplierPaymentService';
import {paymentSchema,type PaymentMethod} from '../types/pos';
import {useProductStore} from '../store/useProductStore';
import {purchaseReturnSchema} from '../types/phase4';
import {purchaseFinancials} from '../utils/supplierBalance';
import {stockService} from './stockService';
import {usePurchaseStore} from '../store/usePurchaseStore';
import {purchaseSchema,type PurchaseLine} from '../types/phase4';
import {toCentavos as c,fromCentavos as p,multiplyCentavos,ratioCentavos} from '../utils/pos';
import {productService} from './productService';
import {supplierService} from './supplierService';
import {localTransaction} from './localTransaction';
import {activityService} from './activityService';
export interface PurchaseInput {supplierId:string;date:string;items:PurchaseLine[];discount:number;shipping:number;referenceNo?:string;note?:string}
export function purchaseTotals(input:Pick<PurchaseInput,'items'|'discount'|'shipping'>){
 const items=input.items.map(l=>{const base=multiplyCentavos(c(l.unitCost),l.orderedQty);const tax=ratioCentavos(base,Math.round(l.taxRate*100),10000);return {...l,lineTotal:p(base+tax)};});
 const subtotal=items.reduce((n,l)=>n+multiplyCentavos(c(l.unitCost),l.orderedQty),0),total=items.reduce((n,l)=>n+c(l.lineTotal),0);
 if(c(input.discount)>total)throw new Error('Discount exceeds purchase subtotal.');
 return {items,subtotal:p(subtotal),taxTotal:p(total-subtotal),grandTotal:p(total-c(input.discount)+c(input.shipping))};
}
export const purchaseService={
 list:()=>structuredClone(usePurchaseStore.getState().purchases.toSorted((a,b)=>b.date.localeCompare(a.date))),
 get:(id:string)=>structuredClone(usePurchaseStore.getState().purchases.find(p=>p.id===id)),
 returns:(id?:string)=>structuredClone(usePurchaseStore.getState().returns.filter(r=>!id||r.purchaseId===id)),
 createComplete:(input:PurchaseInput,options:{receiveNow:boolean;initialPayment:number;method:PaymentMethod})=>{
  const totals=purchaseTotals(input);paymentSchema.parse({id:'preview',method:options.method,amount:options.initialPayment,createdAt:new Date().toISOString()});if(options.method==='wallet'||c(options.initialPayment)>c(totals.grandTotal))throw new Error('Initial payment exceeds total or uses an invalid method.');
  return localTransaction(()=>{const purchase=purchaseService.create(input);if(options.receiveNow)purchaseService.receive(purchase.id,purchase.items.map(l=>({id:l.id,quantity:l.orderedQty})));if(options.initialPayment>0)supplierPaymentService.record({supplierId:purchase.supplierId,purchaseId:purchase.id,amount:options.initialPayment,method:options.method,createdAt:new Date().toISOString()});return purchaseService.get(purchase.id)!;});
 },
 create:(input:PurchaseInput)=>{
  if(supplierService.get(input.supplierId)?.status!=='active')throw new Error('Choose an active supplier.');
  for(const l of input.items){const product=productService.get(l.productId);if(!product||product.status!=='active'||product.hasVariants!==!!l.variantId||l.variantId&&!productService.variants(product.id).some(v=>v.id===l.variantId))throw new Error('Choose an available product and variant.');if(l.receivedQty!==0)throw new Error('Use Receive stock after creating the purchase.');}
  if(new Set(input.items.map(l=>l.variantId??l.productId)).size!==input.items.length)throw new Error('Combine duplicate product lines.');
  const totals=purchaseTotals(input),n=usePurchaseStore.getState().counter+1;
  const purchase=purchaseSchema.parse({...input,...totals,id:crypto.randomUUID(),purchaseNo:`PO-${String(n).padStart(6,'0')}`,amountPaid:0,balanceDue:totals.grandTotal,paymentStatus:totals.grandTotal?'unpaid':'paid',receiveStatus:'pending',createdAt:new Date().toISOString()});
  return localTransaction(()=>{usePurchaseStore.setState(s=>({purchases:[...s.purchases,purchase],counter:n}));activityService.log('purchase',purchase.id,'create',`Created ${purchase.purchaseNo}`);return purchase;});
 },
 receive:(id:string,quantities:{id:string;quantity:number}[],updateCost=true)=>{
  const purchase=purchaseService.get(id);if(!purchase||purchase.receiveStatus==='cancelled')throw new Error('Purchase cannot be received.');
  const selected=quantities.filter(x=>x.quantity!==0);if(!selected.length||new Set(selected.map(x=>x.id)).size!==selected.length)throw new Error('Choose distinct lines to receive.');
  for(const q of selected){const l=purchase.items.find(x=>x.id===q.id);if(!l||!Number.isFinite(q.quantity)||q.quantity<=0||q.quantity>l.orderedQty-l.receivedQty+1e-8)throw new Error('Receipt quantity exceeds remaining ordered quantity.');if(!stockService.items().some(x=>x.product.id===l.productId&&x.variant?.id===l.variantId))throw new Error('Original product or variant no longer exists.');}
  return localTransaction(()=>{const createdAt=new Date().toISOString();const items=purchase.items.map(l=>{const q=selected.find(x=>x.id===l.id);if(!q)return l;stockService.record({productId:l.productId,variantId:l.variantId,type:'in',quantity:q.quantity,reason:'Purchase',reference:purchase.purchaseNo,createdAt});if(updateCost)useProductStore.setState(s=>({products:s.products.map(x=>!l.variantId&&x.id===l.productId?{...x,costPrice:l.unitCost}:x),variants:s.variants.map(x=>x.id===l.variantId?{...x,costPrice:l.unitCost}:x)}));return {...l,receivedQty:Math.min(l.orderedQty,l.receivedQty+q.quantity)};});usePurchaseStore.setState(s=>({purchases:s.purchases.map(x=>x.id===id?{...x,items,receiveStatus:items.every(l=>l.receivedQty===l.orderedQty)?'received':'partial'}:x)}));activityService.log('purchase',id,'receive',`Received stock for ${purchase.purchaseNo}`);});
 },
 returnPreview:(id:string,quantities:{id:string;quantity:number}[],reason:string)=>{
  const purchase=purchaseService.get(id);if(!purchase||purchase.receiveStatus==='cancelled')throw new Error('Purchase not available.');
  const selected=quantities.filter(x=>x.quantity!==0);if(!selected.length||new Set(selected.map(x=>x.id)).size!==selected.length)throw new Error('Choose distinct lines to return.');
  const previous=purchaseService.returns(id).flatMap(r=>r.items);
  const items=selected.map(q=>{const l=purchase.items.find(x=>x.id===q.id),used=previous.filter(x=>x.purchaseLineId===q.id).reduce((n,x)=>n+x.quantity,0);if(!l||!Number.isFinite(q.quantity)||q.quantity<=0||q.quantity>l.receivedQty-used+1e-8)throw new Error('Return exceeds received quantity minus previous returns.');if(stockService.getStock(l.productId,l.variantId)<q.quantity)throw new Error(`${l.name}: insufficient stock. Return would make stock negative.`);return {purchaseLineId:l.id,quantity:q.quantity,unitCost:l.unitCost};});
  const credit=items.reduce((n,l)=>n+multiplyCentavos(c(l.unitCost),l.quantity),0),n=usePurchaseStore.getState().returnCounter+1;
  return purchaseReturnSchema.parse({id:crypto.randomUUID(),returnNo:`PR-${String(n).padStart(6,'0')}`,purchaseId:id,supplierId:purchase.supplierId,items,reason,creditAmount:p(credit),createdAt:new Date().toISOString()});
 },
 returnItems:(id:string,quantities:{id:string;quantity:number}[],reason:string)=>{
  const record=purchaseService.returnPreview(id,quantities,reason),purchase=purchaseService.get(id)!;
  return localTransaction(()=>{for(const q of record.items){const l=purchase.items.find(x=>x.id===q.purchaseLineId)!;stockService.record({productId:l.productId,variantId:l.variantId,type:'out',quantity:q.quantity,reason:'Supplier return',reference:record.returnNo,createdAt:record.createdAt});}usePurchaseStore.setState(s=>{const returns=[...s.returns,record];return {returns,returnCounter:s.returnCounter+1,purchases:s.purchases.map(x=>x.id===id?{...x,...purchaseFinancials(x,returns,s.payments)}:x)};});activityService.log('purchase',id,'return',`${record.returnNo}: ${record.creditAmount.toFixed(2)} credit`);activityService.log('supplier',purchase.supplierId,'return',`${record.returnNo}: ${record.creditAmount.toFixed(2)} credit`);return record;});
 },
 cancel:(id:string)=>{const purchase=purchaseService.get(id);if(!purchase||purchase.receiveStatus==='cancelled'||purchase.items.some(l=>l.receivedQty>0)||purchase.amountPaid>0)throw new Error('Only unreceived, unpaid purchases can be cancelled.');return localTransaction(()=>{usePurchaseStore.setState(s=>({purchases:s.purchases.map(x=>x.id===id?{...x,receiveStatus:'cancelled',balanceDue:0}:x)}));activityService.log('purchase',id,'cancel',`${purchase.purchaseNo} cancelled`);});},
};

