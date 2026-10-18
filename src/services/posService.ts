import {couponService} from './couponService';
import {couponReasons,type CouponContext} from '../utils/coupons';
import {toast} from './toastService';
import {productTax} from '../utils/tax';
import {cashRounding} from '../utils/cashRounding';
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
 if((!settingsService.get().pos.allowDecimalQty||!decimalUnit(unit?.shortName??''))&&!Number.isInteger(line.quantity))throw new Error('Quantity must be a positive whole number for this unit.');
 if(p.hasVariants&&!line.variantId)throw new Error('Choose a variant.');
 if(line.variantId&&!productService.variants(p.id).some(v=>v.id===line.variantId))throw new Error('Variant no longer exists.');
 const key=line.variantId??line.productId;const qty=(quantities.get(key)??0)+line.quantity;quantities.set(key,qty);
 const available=stockService.getStock(line.productId,line.variantId);if(qty>available+1e-8)throw new Error(`${line.name}: only ${available} in stock.`);
 }
 calculateTotals(cart,undefined,settingsService.get().tax);
}
function couponContext():Omit<CouponContext,'orders'> {const s=usePosStore.getState(),totals=calculateTotals(s.cart,undefined,settingsService.get().tax);return {lines:totals.items.map(l=>({id:l.id,productId:l.productId,categoryId:productService.get(l.productId)?.categoryId,base:toCentavos(l.lineSubtotal)-toCentavos(l.lineDiscount),discounted:l.lineDiscount>0})),subtotal:toCentavos(totals.subtotal)-toCentavos(totals.itemDiscountTotal),branchId:posService.branch(),customer:customerService.get(s.customerId),manualDiscount:s.orderDiscount.value>0,stacking:settingsService.get().pos.couponStacking};}
export const posService={
 couponResult:()=>{const code=usePosStore.getState().couponCode;return code?couponService.validate(code,couponContext()):undefined;},
 applyCoupon:(code:string,replace=false)=>{requirePermission('pos:coupon');if(usePosStore.getState().orderDiscount.value>0&&!replace)throw new Error('Confirm replacement of the manual order discount.');const context={...couponContext(),manualDiscount:false};const result=couponService.validate(code,context);if(!result.ok)throw new Error(couponReasons[result.reason]);usePosStore.setState({couponCode:code.trim().toUpperCase(),orderDiscount:{type:'fixed',value:0},discountApproval:undefined});},
 removeCoupon:()=>usePosStore.setState({couponCode:undefined}),
 revalidateCoupon:()=>{const result=posService.couponResult();if(result&&!result.ok){usePosStore.setState({couponCode:undefined});toast.info('Coupon removed: '+couponReasons[result.reason]);}},
 state:()=>structuredClone(usePosStore.getState()),
 totals:()=>{const s=usePosStore.getState(),coupon=posService.couponResult();return calculateTotals(s.cart,s.orderDiscount,settingsService.get().tax,coupon?.ok?coupon.perLine:undefined);},
 branch:()=>useBranchStore.getState().branch,
 add:(productId:string,variantId?:string)=>{requirePermission('pos:use');
 const p=productService.get(productId);if(!p)throw new Error('Product not found.');
 const v=variantId?productService.variants(p.id).find(v=>v.id===variantId):undefined;
 const s=posService.state();const existing=s.cart.find(l=>l.productId===productId&&l.variantId===variantId);
 const line:CartItem=existing?{...existing,quantity:existing.quantity+1}:{id:crypto.randomUUID(),productId,variantId,name:p.name,sku:v?.sku??p.sku,unitPrice:v?.sellingPrice??p.sellingPrice,costPrice:v?.costPrice??p.costPrice,quantity:1,taxRate:productTax(p,settingsService.get().tax).rate,taxClass:productTax(p,settingsService.get().tax).taxClass,unitShortName:unitService.list().find(u=>u.id===p.unitId)?.shortName??'pcs',variantName:v?.name,imageId:p.imageId,discountType:p.discountPercent?'percent':undefined,discountValue:p.discountPercent};
 const cart=existing?s.cart.map(l=>l.id===line.id?line:l):[...s.cart,line];validateCart(cart);usePosStore.setState({cart,activeOrderNo:orderService.nextOrderNo()});return line.id;
 },
 quantity:(id:string,quantity:number)=>{requirePermission("pos:use");const cart=posService.state().cart.map(l=>l.id===id?{...l,quantity}:l);validateCart(cart);usePosStore.setState({cart});},
 remove:(id:string)=>{requirePermission("pos:use");usePosStore.setState(s=>({cart:s.cart.filter(l=>l.id!==id)}));},
 lineDiscount:(id:string,input:Discount,approverId?:string)=>{const discount=discountSchema.parse(input),state=posService.state();const cart=state.cart.map(l=>l.id===id?{...l,discountType:discount.type,discountValue:discount.value}:l);calculateTotals(cart,state.orderDiscount);localTransaction(()=>{const discountApproval=discountApprovalService.ensure(cart,state.orderDiscount,approverId);usePosStore.setState({cart,discountApproval});});},
 discount:(input:Discount,approverId?:string)=>{const discount=discountSchema.parse(input);calculateTotals(posService.state().cart,discount);localTransaction(()=>{const discountApproval=discountApprovalService.ensure(posService.state().cart,discount,approverId);usePosStore.setState({orderDiscount:discount,couponCode:undefined,discountApproval});});},
 customer:(id:string)=>{if(!customerService.get(id))throw new Error('Customer not found.');usePosStore.setState({customerId:id});},
 note:(note:string)=>{if(note.length>2000)throw new Error('Note must be at most 2000 characters.');usePosStore.setState({note});},
 clear:()=>usePosStore.setState({couponCode:undefined,discountApproval:undefined,cart:[],customerId:WALK_IN_ID,orderDiscount:{type:'fixed',value:0},note:'',activeOrderNo:orderService.nextOrderNo()}),
 restore:(data:Pick<PosState,'cart'|'customerId'|'note'|'orderDiscount'>)=>{validateCart(data.cart);if(!customerService.get(data.customerId))throw new Error('Customer no longer exists.');usePosStore.setState({...data,couponCode:undefined,discountApproval:undefined,activeOrderNo:orderService.nextOrderNo()});},
 complete:(payments:Payment[],options:{payLater?:boolean;dueDate?:string}={}):Order=>{requirePermission('pos:use');
 for(const p of payments)if(p.amount>0){const method=settingsService.get().payment.methods.find(m=>m.id===p.method);if(!method?.enabled)throw new Error('Payment method is disabled.');if(method.requireReference&&!p.reference?.trim())throw new Error(`${method.label} requires a reference.`);const amount=toCentavos(p.amount);if(amount<(method.minAmount??0)||amount>(method.maxAmount??Number.MAX_SAFE_INTEGER))throw new Error(`${method.label}: amount is outside configured limits.`);validatePaymentAccount(p.method);}const s=posService.state();if(!s.cart.length)throw new Error('Add products before completing a sale.');validateCart(s.cart);
 const c=customerService.get(s.customerId);if(settingsService.get().pos.requireCustomer&&c?.isWalkIn)throw new Error('Choose a named customer before selling.');if(!c)throw new Error('Choose a customer.');if(options.payLater&&c.isWalkIn)throw new Error('Pay Later requires a named customer.');
 discountApprovalService.ensure(s.cart,s.orderDiscount);const couponResult=posService.couponResult();if(couponResult&&!couponResult.ok)throw new Error(couponReasons[couponResult.reason]);const coupon=s.couponCode?couponService.find(s.couponCode):undefined;const totals=posService.totals();const rounding=cashRounding(toCentavos(totals.grandTotal),payments.filter(p=>p.amount>0).map(p=>p.method),settingsService.get().pos.cashRounding);totals.grandTotal=fromCentavos(rounding.total);const paid=calculatePayments(totals.grandTotal,payments);
 if(!options.payLater&&paid.balanceDue>0)throw new Error('Payment does not cover the total.');
 const wallet=sumCentavos(payments.filter(p=>p.method==='wallet').map(p=>toCentavos(p.amount)));
 if(wallet&&(c.isWalkIn||c.status!=='active'||wallet>toCentavos(c.walletBalance)))throw new Error('Insufficient customer wallet balance.');
 const orderId=crypto.randomUUID();
 orderSchema.shape.dueDate.parse(options.dueDate);
 return localTransaction(()=>{
 const freshCoupon=posService.couponResult();if(freshCoupon&&!freshCoupon.ok)throw new Error(couponReasons[freshCoupon.reason]);
 const orderNo=orderService.nextOrderNo();const createdAt=new Date().toISOString();
 for(const line of s.cart)stockService.record({productId:line.productId,variantId:line.variantId,type:'out',quantity:line.quantity,reason:'Sale',reference:orderNo,createdAt});
 if(wallet)walletService.change({customerId:c.id,type:"spend",amount:-fromCentavos(wallet),orderId});
 const pointsEarned=customerService.recordSale(c.id,paid.amountPaid,paid.balanceDue);
 const order=orderService.save({id:orderId,orderNo,branchId:posService.branch(),customerId:c.id,customerName:c.name,...totals,...settingsService.snapshot(),roundingAdjustment:rounding.adjustment,coupon:coupon&&couponResult?.ok?{couponId:coupon.id,code:coupon.code,type:coupon.type,value:coupon.value,amount:fromCentavos(couponResult.discount)}:undefined,payments:structuredClone(payments),...paid,orderStatus:paid.balanceDue>0?'pending':'completed',note:s.note,dueDate:options.dueDate,cashier:authService.getCurrentUser()?.name??'System',cashierId:authService.getCurrentUser()?.id,createdAt,refundedTotal:0,pointsEarned});
 posService.clear();return order;
 });
 }
};


usePosStore.subscribe((state,previous)=>{if(state.cart!==previous.cart||state.customerId!==previous.customerId)posService.revalidateCoupon();});
