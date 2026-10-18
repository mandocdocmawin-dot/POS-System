import {settingsService} from './settingsService';
import {validatePaymentAccount} from './financeData';
import {authService} from './authService';
import {discountApprovalService} from './discountApprovalService';
import {requirePermission} from './authService';
import {walletService} from './walletService';
import {toCentavos,fromCentavos,sumCentavos} from '../utils/pos';
import {usePosStore,type PosState} from '../store/usePosStore';
import {useBranchStore} from '../store/useBranchStore';
import {productService} from './productService';
import {unitService} from './catalogService';
import {stockService} from './stockService';
import {orderService} from './orderService';
import {customerService} from './customerService';
import {localTransaction} from './localTransaction';
import {WALK_IN_ID} from '../config/pos';
import {cartItemSchema,discountSchema,orderSchema,type CartItem,type Discount,type Payment,type Order} from '../types/pos';
import {calculateTotals,calculatePayments} from '../utils/pos';
export const decimalUnit=(shortName:string)=>['kg','liter','litre','l'].includes(shortName.toLowerCase());
function validateCart(cart:CartItem[]) {
 const quantities=new Map<string,number>();
 for(const input of cart){const line=cartItemSchema.parse(input);const p=productService.get(line.productId);if(!p||p.status!=='active')throw new Error(`${line.name} is no longer available.`);
 const unit=unitService.list().find(u=>u.id===p.unitId);
 if(!decimalUnit(unit?.shortName??'')&&!Number.isInteger(line.quantity))throw new Error('Quantity must be a positive whole number for this unit.');
 if(p.hasVariants&&!line.variantId)throw new Error('Choose a variant.');
 if(line.variantId&&!productService.variants(p.id).some(v=>v.id===line.variantId))throw new Error('Variant no longer exists.');
 const key=line.variantId??line.productId;const qty=(quantities.get(key)??0)+line.quantity;quantities.set(key,qty);
 const available=stockService.getStock(line.productId,line.variantId);if(qty>available+1e-8)throw new Error(`${line.name}: only ${available} in stock.`);
 }
 calculateTotals(cart,undefined,settingsService.get().tax);
}
export const posService={
 state:()=>structuredClone(usePosStore.getState()),
 totals:()=>{const s=usePosStore.getState();return calculateTotals(s.cart,s.orderDiscount,settingsService.get().tax);},
 branch:()=>useBranchStore.getState().branch,
 add:(productId:string,variantId?:string)=>{requirePermission('pos:use');
 const p=productService.get(productId);if(!p)throw new Error('Product not found.');
 const v=variantId?productService.variants(p.id).find(v=>v.id===variantId):undefined;
 const s=posService.state();const existing=s.cart.find(l=>l.productId===productId&&l.variantId===variantId);
 const line:CartItem=existing?{...existing,quantity:existing.quantity+1}:{id:crypto.randomUUID(),productId,variantId,name:p.name,sku:v?.sku??p.sku,unitPrice:v?.sellingPrice??p.sellingPrice,costPrice:v?.costPrice??p.costPrice,quantity:1,taxRate:p.taxRate,unitShortName:unitService.list().find(u=>u.id===p.unitId)?.shortName??'pcs',variantName:v?.name,imageId:p.imageId,discountType:p.discountPercent?'percent':undefined,discountValue:p.discountPercent};
 const cart=existing?s.cart.map(l=>l.id===line.id?line:l):[...s.cart,line];validateCart(cart);usePosStore.setState({cart,activeOrderNo:orderService.nextOrderNo()});return line.id;
 },
 quantity:(id:string,quantity:number)=>{requirePermission("pos:use");const cart=posService.state().cart.map(l=>l.id===id?{...l,quantity}:l);validateCart(cart);usePosStore.setState({cart});},
 remove:(id:string)=>{requirePermission("pos:use");usePosStore.setState(s=>({cart:s.cart.filter(l=>l.id!==id)}));},
 lineDiscount:(id:string,input:Discount,approverId?:string)=>{const discount=discountSchema.parse(input),state=posService.state();const cart=state.cart.map(l=>l.id===id?{...l,discountType:discount.type,discountValue:discount.value}:l);calculateTotals(cart,state.orderDiscount);localTransaction(()=>{const discountApproval=discountApprovalService.ensure(cart,state.orderDiscount,approverId);usePosStore.setState({cart,discountApproval});});},
 discount:(input:Discount,approverId?:string)=>{const discount=discountSchema.parse(input);calculateTotals(posService.state().cart,discount);localTransaction(()=>{const discountApproval=discountApprovalService.ensure(posService.state().cart,discount,approverId);usePosStore.setState({orderDiscount:discount,discountApproval});});},
 customer:(id:string)=>{if(!customerService.get(id))throw new Error('Customer not found.');usePosStore.setState({customerId:id});},
 note:(note:string)=>{if(note.length>2000)throw new Error('Note must be at most 2000 characters.');usePosStore.setState({note});},
 clear:()=>usePosStore.setState({discountApproval:undefined,cart:[],customerId:WALK_IN_ID,orderDiscount:{type:'fixed',value:0},note:'',activeOrderNo:orderService.nextOrderNo()}),
 restore:(data:Pick<PosState,'cart'|'customerId'|'note'|'orderDiscount'>)=>{validateCart(data.cart);if(!customerService.get(data.customerId))throw new Error('Customer no longer exists.');usePosStore.setState({...data,discountApproval:undefined,activeOrderNo:orderService.nextOrderNo()});},
 complete:(payments:Payment[],options:{payLater?:boolean;dueDate?:string}={}):Order=>{requirePermission('pos:use');
 for(const p of payments)if(p.amount>0)validatePaymentAccount(p.method);const s=posService.state();if(!s.cart.length)throw new Error('Add products before completing a sale.');validateCart(s.cart);
 const c=customerService.get(s.customerId);if(!c)throw new Error('Choose a customer.');if(options.payLater&&c.isWalkIn)throw new Error('Pay Later requires a named customer.');
 discountApprovalService.ensure(s.cart,s.orderDiscount);const totals=calculateTotals(s.cart,s.orderDiscount,settingsService.get().tax);const paid=calculatePayments(totals.grandTotal,payments);
 if(!options.payLater&&paid.balanceDue>0)throw new Error('Payment does not cover the total.');
 const wallet=sumCentavos(payments.filter(p=>p.method==='wallet').map(p=>toCentavos(p.amount)));
 if(wallet&&(c.isWalkIn||c.status!=='active'||wallet>toCentavos(c.walletBalance)))throw new Error('Insufficient customer wallet balance.');
 const orderId=crypto.randomUUID();
 orderSchema.shape.dueDate.parse(options.dueDate);
 return localTransaction(()=>{
 const orderNo=orderService.nextOrderNo();const createdAt=new Date().toISOString();
 for(const line of s.cart)stockService.record({productId:line.productId,variantId:line.variantId,type:'out',quantity:line.quantity,reason:'Sale',reference:orderNo,createdAt});
 if(wallet)walletService.change({customerId:c.id,type:"spend",amount:-fromCentavos(wallet),orderId});
 const pointsEarned=customerService.recordSale(c.id,paid.amountPaid,paid.balanceDue);
 const order=orderService.save({id:orderId,orderNo,branchId:posService.branch(),customerId:c.id,customerName:c.name,...totals,...settingsService.snapshot(),payments:structuredClone(payments),...paid,orderStatus:paid.balanceDue>0?'pending':'completed',note:s.note,dueDate:options.dueDate,cashier:authService.getCurrentUser()?.name??'System',cashierId:authService.getCurrentUser()?.id,createdAt,refundedTotal:0,pointsEarned});
 posService.clear();return order;
 });
 }
};

