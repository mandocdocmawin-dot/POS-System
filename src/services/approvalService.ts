import { useStaffStore } from '../store/useStaffStore';
import { useRoleStore } from '../store/useRoleStore';
import { hasPermission } from '../utils/permissions';
export const approvalService = {
 approvers: () => structuredClone(useStaffStore.getState().staff.filter(s => s.status === 'active' && hasPermission(s,'approvals:grant',useRoleStore.getState().roles))),
};
