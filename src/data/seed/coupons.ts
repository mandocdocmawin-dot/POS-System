import type { Coupon } from '../../types/settings';
export function createCouponSeed(now=new Date()): Coupon[] {
 const before=new Date(now.getTime()-86400000).toISOString(), after=new Date(now.getTime()+7*86400000).toISOString();
 return ['WELCOME10','SAVE50','EXPIRED','SOON20','GOLD15','CATEGORY5'].map((code,i)=>({id:`coupon-${i}`,code,name:['Welcome 10%','Save fifty pesos','Expired demo coupon','Upcoming sale','Gold member offer','Category offer'][i],type:i===1?'fixed':'percent',value:i===1?5000:i===3?20:i===4?15:10,minSubtotal:i===1?20000:50000,maxDiscount:i===1?undefined:20000,startsAt:i===3?after:undefined,endsAt:i===2?before:undefined,eligibleTiers:i===4?['Gold','Platinum']:undefined,categoryIds:i===5?['category-1']:undefined,excludeDiscountedItems:false,branchIds:[],status:'active',createdAt:now.toISOString()}));
}
