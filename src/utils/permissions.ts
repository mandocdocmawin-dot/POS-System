import type { Role, Staff } from '../types/staff';
import { defaultRoles } from '../config/permissions';
export class PermissionError extends Error { permission:string; constructor(permission:string){super("Your role can't do this");this.name='PermissionError';this.permission=permission;} }
export function hasPermission(user:Pick<Staff,'role'>|null|undefined,key:string,roles:Role[]=defaultRoles):boolean {return !!user&&(user.role==='admin'||!!roles.find(r=>r.id===user.role)?.permissions.includes(key));}
