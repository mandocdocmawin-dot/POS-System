import {sumCentavos,toCentavos,fromCentavos} from '../utils/pos';
import {useCouponStore} from '../store/useCouponStore';
import {useOrderStore} from '../store/useOrderStore';
import {couponSchema,type Coupon} from '../types/settings';
import {couponUsage,effectiveCouponStatus,validateCoupon,type CouponContext} from '../utils/coupons';
import {requirePermission} from './authService';
import {activityService} from './activityService';
import {localTransaction} from './localTransaction';
export const couponService={
 list:()=>{const orders=useOrderStore.getState().orders;return structuredClone(useCouponStore.getState().coupons.map(c=>({...c,usedCount:couponUsage(c.id,orders),effectiveStatus:effectiveCouponStatus(c,orders),expiringSoon:!!c.endsAt&&Date.parse(c.endsAt)>Date.now()&&Date.parse(c.endsAt)<Date.now()+7*86400000,totalDiscount:fromCentavos(sumCentavos(orders.filter(o=>o.orderStatus!=='cancelled'&&o.coupon?.couponId===c.id).map(o=>toCentavos(o.coupon?.amount??0))))})));},
 get:(id:string)=>structuredClone(useCouponStore.getState().coupons.find(c=>c.id===id)),
 find:(code:string)=>structuredClone(useCouponStore.getState().coupons.find(c=>c.code===code.trim().toUpperCase())),
 validate:(code:string,ctx:Omit<CouponContext,'orders'>)=>validateCoupon(couponService.find(code),{...ctx,orders:useOrderStore.getState().orders}),
 save:(input:Coupon)=>{requirePermission('coupons:manage');const c=couponSchema.parse(input),coupons=useCouponStore.getState().coupons,old=coupons.find(x=>x.id===c.id);if(coupons.some(x=>x.id!==c.id&&x.code===c.code))throw new Error('Coupon code must be unique.');if(old&&old.code!==c.code&&couponUsage(c.id,useOrderStore.getState().orders))throw new Error('Code cannot change after first use.');return localTransaction(()=>{useCouponStore.setState({coupons:old?coupons.map(x=>x.id===c.id?c:x):[...coupons,c]});activityService.log('coupon',c.id,old?'update':'create',c.code);return c;});},
 remove:(id:string)=>{requirePermission('coupons:manage');const c=couponService.get(id);if(!c)return;if(couponUsage(id,useOrderStore.getState().orders))return couponService.save({...c,status:'inactive'});localTransaction(()=>{useCouponStore.setState(s=>({coupons:s.coupons.filter(c=>c.id!==id)}));activityService.log('coupon',id,'delete',c.code);});},
 generateCode:()=>`SAVE-${crypto.randomUUID().replaceAll('-','').slice(0,8).toUpperCase()}`,
};
