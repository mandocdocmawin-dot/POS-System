import type { CartItem, Discount, DiscountApproval } from '../types/pos';
import { CASHIER_DISCOUNT_LIMIT } from '../config/permissions';
import { useRoleStore } from '../store/useRoleStore';
import { useStaffStore } from '../store/useStaffStore';
import { usePosStore } from '../store/usePosStore';
import { hasPermission } from '../utils/permissions';
import { calculateTotals } from '../utils/pos';
import { authService, requirePermission } from './authService';
import { activityService } from './activityService';
export class ManagerApprovalRequired extends Error { constructor() { super('Manager approval required'); this.name = 'ManagerApprovalRequired'; } }
export const discountApprovalService = {
  ensure: (cart: CartItem[], discount: Discount, approverId?: string): DiscountApproval | undefined => {
    requirePermission('pos:use');
    const user = authService.getCurrentUser()!, roles = useRoleStore.getState().roles, totals = calculateTotals(cart, discount);
    if (hasPermission(user, 'pos:discount', roles)) return;
    const percentage = totals.subtotal ? (totals.itemDiscountTotal + totals.orderDiscount.amount) / totals.subtotal * 100 : discount.type === 'percent' ? discount.value : 0;
    const highLine = totals.items.some(line => line.lineSubtotal ? line.lineDiscount / line.lineSubtotal * 100 > CASHIER_DISCOUNT_LIMIT + 1e-8 : line.discountType === 'percent' && (line.discountValue ?? 0) > CASHIER_DISCOUNT_LIMIT);
    if (!highLine && percentage <= CASHIER_DISCOUNT_LIMIT + 1e-8) return;
    const fingerprint = JSON.stringify([user.id, cart, discount]);
    const previous = usePosStore.getState().discountApproval;
    const validApprover = (id: string | undefined) => useStaffStore.getState().staff.find(s => s.id === id && ['admin', 'manager'].includes(s.role) && hasPermission(s, 'pos:discount', roles));
    if (!approverId && previous?.actorId === user.id && previous.fingerprint === fingerprint && validApprover(previous.approverId)) return previous;
    const approver = validApprover(approverId);
    if (!approver) throw new ManagerApprovalRequired();
    activityService.log('order', cart[0]?.id ?? user.id, 'discount-approved', `${percentage.toFixed(2)}% combined discount${highLine ? ' including a high item discount' : ''} approved by ${approver.name} for ${user.name}`, user.name);
    return { actorId: user.id, approverId: approver.id, approverName: approver.name, fingerprint };
  },
};
