import { useStaffStore } from '../store/useStaffStore';
import { useRoleStore } from '../store/useRoleStore';
import { hasPermission } from '../utils/permissions';
import { needsApproval, validateApprovalPin, type ApprovalAction } from '../utils/approvals';
import { settingsService } from './settingsService';
import { authService } from './authService';
import { activityService } from './activityService';
export class ManagerApprovalRequired extends Error { scope:string; constructor(scope = 'discount') { super('Manager approval required'); this.scope=scope; this.name='ManagerApprovalRequired'; } }
const grants = new Map<string,{actorId:string;approverId:string;expires:number}>();
export const approvalService = {
 approvers: () => structuredClone(useStaffStore.getState().staff.filter(s => s.status==='active' && hasPermission(s,'approvals:grant',useRoleStore.getState().roles))),
 authorize: (scope:string, approverId:string, pin?:string) => {
  const actor=authService.getCurrentUser(), approver=approvalService.approvers().find(p=>p.id===approverId);
  if(!actor||!approver||!validateApprovalPin(settingsService.get().manager.requirePin,approver.approvalPin,pin)) throw new Error('Choose an active approver and enter the correct demo PIN.');
  grants.set(scope,{actorId:actor.id,approverId,expires:Date.now()+60000});
 },
 ensure: (action:ApprovalAction,value:number,scope:string) => {
  const user=authService.getCurrentUser();
  if(!user)throw new Error('Sign in first.');
  if(!needsApproval(action,value,hasPermission(user,'approvals:grant',useRoleStore.getState().roles),settingsService.get().manager.approvals))return;
  const grant=grants.get(scope);grants.delete(scope);
  const approver=approvalService.approvers().find(s=>s.id===grant?.approverId);
  if(!grant||grant.actorId!==user.id||grant.expires<Date.now()||!approver)throw new ManagerApprovalRequired(scope);
  activityService.log('approval',scope,'grant',`${action} requested by ${user.name}; approved by ${approver.name}`,user.name);
  return approver;
 },
};
