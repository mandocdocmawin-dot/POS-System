import { describe,it,expect } from 'vitest';
import { validateCoupon, couponUsage, distributeDiscount, effectiveCouponStatus, type CouponContext, type CouponFailure } from './coupons';
import type {Coupon} from '../types/settings';
const coupon:Coupon={id:'c',code:'SAVE10',name:'Save',type:'percent',value:10,minSubtotal:0,excludeDiscountedItems:false,status:'active',createdAt:'2026-01-01T00:00:00.000Z'};
const ctx:CouponContext={lines:[{id:'1',productId:'p',categoryId:'cat',base:10000,discounted:false}],subtotal:10000,branchId:'Main Branch',orders:[],now:'2026-10-18T00:00:00.000Z',customer:{id:'customer',tier:'Regular',isWalkIn:false}};
describe('coupon rules',()=>{
 it.each<[Partial<Coupon>|undefined,Partial<CouponContext>,CouponFailure]>([
  [undefined,{},'not_found'],[{status:'inactive'},{},'inactive'],[{startsAt:'2027-01-01T00:00:00.000Z'},{},'not_started'],[{endsAt:'2025-01-01T00:00:00.000Z'},{},'expired'],
  [{usageLimit:1},{orders:[{customerId:'x',orderStatus:'completed',coupon:{couponId:'c',code:'SAVE10',type:'percent',value:10,amount:1000}}]},'used_up'],
  [{perCustomerLimit:1},{orders:[{customerId:'customer',orderStatus:'completed',coupon:{couponId:'c',code:'SAVE10',type:'percent',value:10,amount:1000}}]},'customer_limit'],
  [{minSubtotal:10001},{},'min_subtotal'],[{eligibleTiers:['Gold']},{},'tier_not_eligible'],[{branchIds:['Other']},{},'branch_not_allowed'],[{productIds:['other']},{},'no_eligible_items'],[{}, {manualDiscount:true},'conflicts_with_manual_discount'],[{perCustomerLimit:2},{customer:undefined},'customer_required']
 ])('rejects %j with %j: %s',(patch,context,reason)=>{expect(validateCoupon(patch?{...coupon,...patch}:undefined,{...ctx,...context})).toEqual({ok:false,reason});});
 it('caps percent and fixed discounts at the eligible base',()=>{expect(validateCoupon({...coupon,maxDiscount:500},ctx)).toMatchObject({ok:true,discount:500});expect(validateCoupon({...coupon,type:'fixed',value:20000},ctx)).toMatchObject({ok:true,discount:10000});});
 it('allocates every cent with stable largest remainders',()=>{expect(distributeDiscount(2,[1,1,1])).toEqual([1,1,0]);for(let amount=0;amount<100;amount++)expect(distributeDiscount(amount,[33,33,34]).reduce((a,b)=>a+b,0)).toBe(amount);});
 it('restricts category, products and already discounted lines',()=>{const context={...ctx,lines:[...ctx.lines,{id:'2',productId:'other',base:20000,discounted:true}]};expect(validateCoupon({...coupon,categoryIds:['cat'],productIds:['p']},context)).toMatchObject({ok:true,discount:1000,perLine:[1000,0]});expect(validateCoupon({...coupon,excludeDiscountedItems:true},context)).toMatchObject({ok:true,perLine:[1000,0]});});
 it('derives usage and frees it only on cancellation',()=>{const orders:CouponContext['orders']=['completed','refunded','cancelled'].map(status=>({customerId:'customer',orderStatus:status as 'completed'|'refunded'|'cancelled',coupon:{couponId:'c',code:'SAVE10',type:'percent',value:10,amount:1000}}));expect(couponUsage('c',orders)).toBe(2);expect(couponUsage('c',orders,'other')).toBe(0);expect(effectiveCouponStatus({...coupon,usageLimit:2},orders)).toBe('used_up');});
 it('revalidates customer and cart changes',()=>{expect(validateCoupon({...coupon,minSubtotal:5000},ctx).ok).toBe(true);expect(validateCoupon({...coupon,minSubtotal:5000},{...ctx,subtotal:1000})).toMatchObject({reason:'min_subtotal'});expect(validateCoupon({...coupon,eligibleTiers:['Regular']},{...ctx,customer:{id:'x',tier:'Gold'}})).toMatchObject({reason:'tier_not_eligible'});});
});
