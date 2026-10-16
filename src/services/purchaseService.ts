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
 create:(input:PurchaseInput)=>{
  if(supplierService.get(input.supplierId)?.status!=='active')throw new Error('Choose an active supplier.');
  for(const l of input.items){const product=productService.get(l.productId);if(!product||product.status!=='active'||product.hasVariants!==!!l.variantId||l.variantId&&!productService.variants(product.id).some(v=>v.id===l.variantId))throw new Error('Choose an available product and variant.');if(l.receivedQty!==0)throw new Error('Use Receive stock after creating the purchase.');}
  if(new Set(input.items.map(l=>l.variantId??l.productId)).size!==input.items.length)throw new Error('Combine duplicate product lines.');
  const totals=purchaseTotals(input),n=usePurchaseStore.getState().counter+1;
  const purchase=purchaseSchema.parse({...input,...totals,id:crypto.randomUUID(),purchaseNo:`PO-${String(n).padStart(6,'0')}`,amountPaid:0,balanceDue:totals.grandTotal,paymentStatus:totals.grandTotal?'unpaid':'paid',receiveStatus:'pending',createdAt:new Date().toISOString()});
  return localTransaction(()=>{usePurchaseStore.setState(s=>({purchases:[...s.purchases,purchase],counter:n}));activityService.log('purchase',purchase.id,'create',`Created ${purchase.purchaseNo}`);return purchase;});
 },
 cancel:(id:string)=>{const purchase=purchaseService.get(id);if(!purchase||purchase.receiveStatus==='cancelled'||purchase.items.some(l=>l.receivedQty>0)||purchase.amountPaid>0)throw new Error('Only unreceived, unpaid purchases can be cancelled.');return localTransaction(()=>{usePurchaseStore.setState(s=>({purchases:s.purchases.map(x=>x.id===id?{...x,receiveStatus:'cancelled',balanceDue:0}:x)}));activityService.log('purchase',id,'cancel',`${purchase.purchaseNo} cancelled`);});},
};

