import type { Coupon } from '../types/settings';
import type { Customer, Order } from '../types/pos';
import { percentCentavos } from './pos';
export type CouponFailure='not_found'|'inactive'|'not_started'|'expired'|'used_up'|'customer_limit'|'min_subtotal'|'tier_not_eligible'|'branch_not_allowed'|'no_eligible_items'|'conflicts_with_manual_discount'|'customer_required';
export interface CouponContext { lines:{id:string;productId:string;categoryId?:string;base:number;discounted:boolean}[]; subtotal:number; branchId:string; customer?:Pick<Customer,'id'|'tier'|'isWalkIn'>; orders:Pick<Order,'orderStatus'|'customerId'|'coupon'>[]; now?:string; manualDiscount?:boolean; stacking?:'none'|'with_item_discounts' }
export function couponUsage(couponId:string, orders:CouponContext['orders'],customerId?:string) {return orders.filter(o=>o.orderStatus!=='cancelled'&&o.coupon?.couponId===couponId&&(!customerId||o.customerId===customerId)).length;}
export function effectiveCouponStatus(coupon:Coupon,orders:CouponContext['orders'],now=new Date().toISOString()) {
 return coupon.status==='inactive'?'inactive':coupon.startsAt&&now<coupon.startsAt?'scheduled':coupon.endsAt&&now>coupon.endsAt?'expired':coupon.usageLimit&&couponUsage(coupon.id,orders)>=coupon.usageLimit?'used_up':'active';
}
export function distributeDiscount(amount:number,bases:number[]):number[]{
 if(!Number.isSafeInteger(amount)||amount<0||bases.some(n=>!Number.isSafeInteger(n)||n<0))throw new Error('Discount allocation requires integer centavos.');
 const base=bases.reduce((a,b)=>a+BigInt(b),0n);if(BigInt(amount)>base)throw new Error('Discount exceeds eligible base.');
 const rows=bases.map((value,index)=>({index,amount:base?Number(BigInt(value)*BigInt(amount)/base):0,remainder:base?BigInt(value)*BigInt(amount)%base:0n}));
 const remainder=amount-rows.reduce((a,b)=>a+b.amount,0);const rank=[...rows].sort((a,b)=>a.remainder===b.remainder?a.index-b.index:a.remainder>b.remainder?-1:1);for(let i=0;i<remainder;i++)rank[i].amount++;
 return rows.map(r=>r.amount);
}
export function validateCoupon(coupon:Coupon|undefined,ctx:CouponContext):{ok:true;discount:number;perLine:number[]}|{ok:false;reason:CouponFailure} {
 const fail=(reason:CouponFailure)=>({ok:false as const,reason});if(!coupon)return fail('not_found');
 const now=ctx.now??new Date().toISOString();if(coupon.status!=='active')return fail('inactive');if(coupon.startsAt&&now<coupon.startsAt)return fail('not_started');if(coupon.endsAt&&now>coupon.endsAt)return fail('expired');
 if(coupon.usageLimit&&couponUsage(coupon.id,ctx.orders)>=coupon.usageLimit)return fail('used_up');
 const named=ctx.customer&&!ctx.customer.isWalkIn;
 if((coupon.perCustomerLimit||coupon.eligibleTiers?.length)&&!named)return fail('customer_required');
 if(coupon.perCustomerLimit&&couponUsage(coupon.id,ctx.orders,ctx.customer?.id)>=coupon.perCustomerLimit)return fail('customer_limit');
 if(ctx.subtotal<coupon.minSubtotal)return fail('min_subtotal');if(coupon.eligibleTiers?.length&&(!ctx.customer||!coupon.eligibleTiers.includes(ctx.customer.tier)))return fail('tier_not_eligible');
 if(coupon.branchIds?.length&&!coupon.branchIds.includes(ctx.branchId))return fail('branch_not_allowed');if(ctx.manualDiscount)return fail('conflicts_with_manual_discount');
 const bases=ctx.lines.map(l=>(coupon.productIds?.length&&!coupon.productIds.includes(l.productId))||(coupon.categoryIds?.length&&(!l.categoryId||!coupon.categoryIds.includes(l.categoryId)))||((coupon.excludeDiscountedItems||ctx.stacking==='none')&&l.discounted)?0:l.base);
 const eligible=bases.reduce((a,b)=>a+b,0);if(!eligible)return fail('no_eligible_items');
 const amount=Math.min(eligible,coupon.type==='fixed'?coupon.value:percentCentavos(eligible,coupon.value),coupon.type==='percent'?(coupon.maxDiscount??Number.MAX_SAFE_INTEGER):Number.MAX_SAFE_INTEGER);
 return {ok:true,discount:amount,perLine:distributeDiscount(amount,bases)};
}
export const couponReasons:Record<CouponFailure,string>={not_found:'Coupon not found.',inactive:'Coupon is inactive.',not_started:'Coupon has not started.',expired:'Coupon has expired.',used_up:'Coupon usage limit reached.',customer_limit:'Customer usage limit reached.',min_subtotal:'Cart does not meet the minimum spend.',tier_not_eligible:'Customer tier is not eligible.',branch_not_allowed:'Coupon is not available at this branch.',no_eligible_items:'No eligible items in the cart.',conflicts_with_manual_discount:'Replace the manual order discount before using a coupon.',customer_required:'Choose a named customer for this coupon.'};
