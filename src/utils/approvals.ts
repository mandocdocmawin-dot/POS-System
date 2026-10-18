import type { Settings } from '../types/settings';
export type ApprovalAction = 'discount'|'refund'|'cancel'|'adjustment'|'void-held';
export function needsApproval(action: ApprovalAction, value: number, canGrant: boolean, rules: Settings['manager']['approvals']) {
 if (canGrant) return false;
 return action==='discount'?value>rules.cashierDiscountLimitPercent:action==='refund'?value>rules.refundApprovalAbove:action==='adjustment'?Math.abs(value)>rules.stockAdjustmentApprovalAboveUnits:action==='cancel'?rules.cancelOrderNeedsApproval:rules.voidHeldNeedsApproval;
}
export function validateApprovalPin(required: boolean, expected: string|undefined, actual?: string) { return !required || (!!expected && /^\d{4}$/.test(actual??'') && expected===actual); }
