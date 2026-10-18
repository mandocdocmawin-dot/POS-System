import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {couponSchema,type Coupon} from '../types/settings';
import {createCouponSeed} from '../data/seed/coupons';
export const useCouponStore=create<{coupons:Coupon[]}>()(persist(()=>({coupons:createCouponSeed()}),{name:'tindapos:coupons',version:1,merge:(value,current)=>{const result=couponSchema.array().safeParse((value as {coupons?:unknown}|undefined)?.coupons);return result.success?{coupons:result.data}:current;}}));
