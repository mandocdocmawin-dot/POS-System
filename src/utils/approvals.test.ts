import {it,expect} from 'vitest';
import {needsApproval,validateApprovalPin} from './approvals';
import {defaultSettings} from '../config/defaultSettings';
it('requires approval strictly above thresholds and bypasses approvers',()=>{const rules={...defaultSettings.manager.approvals,cancelOrderNeedsApproval:true,voidHeldNeedsApproval:true};for(const [action,value] of [['discount',11],['refund',50001],['adjustment',-101],['cancel',0],['void-held',0]] as const){expect(needsApproval(action,value,false,rules)).toBe(true);expect(needsApproval(action,value,true,rules)).toBe(false);}expect(needsApproval('refund',50000,false,rules)).toBe(false);});
it('validates a demo PIN only when required',()=>{expect(validateApprovalPin(false,undefined)).toBe(true);expect(validateApprovalPin(true,'1234','1234')).toBe(true);expect(validateApprovalPin(true,undefined,'1234')).toBe(false);expect(validateApprovalPin(true,'1234','9999')).toBe(false);});
