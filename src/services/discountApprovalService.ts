import type {CartItem,Discount} from '../types/pos';
import {CASHIER_DISCOUNT_LIMIT} from '../config/permissions';
import {useRoleStore} from '../store/useRoleStore';
import {useStaffStore} from '../store/useStaffStore';
import {hasPermission} from '../utils/permissions';
import {calculateTotals} from '../utils/pos';
import {authService,requirePermission} from './authService';
import {activityService} from './activityService';
const approved=new Set<string>();
export class ManagerApprovalRequired extends Error{constructor(){super('Manager approval required');this.name='ManagerApprovalRequired';}}
export const discountApprovalService={
 ensure:(cart:CartItem[],discount:Discount,approverId?:string)=>{requirePermission('pos:use');const user=authService.getCurrentUser()!,roles=useRoleStore.getState().roles,totals=calculateTotals(cart,discount);if(hasPermission(user,'pos:discount',roles))return;const percentage=totals.subtotal?(totals.itemDiscountTotal+totals.orderDiscount.amount)/totals.subtotal*100:discount.type==='percent'?discount.value:0;if(percentage<=CASHIER_DISCOUNT_LIMIT+1e-8)return;const key=JSON.stringify([user.id,cart,discount]);if(approved.has(key))return;const approver=useStaffStore.getState().staff.find(s=>s.id===approverId&&['admin','manager'].includes(s.role)&&hasPermission(s,'pos:discount',roles));if(!approver)throw new ManagerApprovalRequired();activityService.log('order',cart[0]?.id??user.id,'discount-approved',`${percentage.toFixed(2)}% discount approved by ${approver.name} for ${user.name}`,user.name);approved.add(key);},
};
