import { authService, requirePermission } from './authService';
import { hasPermission, PermissionError } from '../utils/permissions';
import { useRoleStore } from '../store/useRoleStore';
import { useStaffStore } from '../store/useStaffStore';
export function currentUser(permission?: string) {
  if (permission) requirePermission(permission);
  const user = authService.getCurrentUser();
  if (!user || user.status !== 'active') throw new PermissionError(permission ?? 'pages:view');
  return user;
}
export const canUse = (permission: string) => hasPermission(authService.getCurrentUser(), permission, useRoleStore.getState().roles);
export function requireOwn(ownerId: string, permission?: string) {
  const user = currentUser();
  if (user.id !== ownerId && (!permission || !canUse(permission))) throw new PermissionError(permission ?? 'ownership');
  return user;
}
export const activePeople = () => structuredClone(useStaffStore.getState().staff.filter(s => s.status === 'active'));
export const timestamp = () => new Date().toISOString();
