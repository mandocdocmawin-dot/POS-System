import {roleSchema,type Role} from '../types/staff';
import {permissionKeys,defaultRoles} from '../config/permissions';
import {useRoleStore} from '../store/useRoleStore';
import {useStaffStore} from '../store/useStaffStore';
import {authService,requirePermission} from './authService';
import {activityService} from './activityService';
import {localTransaction} from './localTransaction';
export const roleService={
 save:(input:Role)=>{requirePermission('roles:manage');if(input.id==='admin')throw new Error('Admin permissions are locked.');const roles=useRoleStore.getState().roles,current=roles.find(r=>r.id===input.id);const role=roleSchema.parse({...input,isSystem:current?.isSystem??false});if(role.permissions.some(p=>!permissionKeys.some(k=>k===p)))throw new Error('Unknown permission.');if(roles.some(r=>r.id!==role.id&&r.name.toLowerCase()===role.name.toLowerCase()))throw new Error('Role name must be unique.');return localTransaction(()=>{useRoleStore.setState({roles:current?roles.map(r=>r.id===role.id?role:r):[...roles,role]});activityService.log('role',role.id,current?'edit':'create',`Saved ${role.name} permissions`,authService.getCurrentUser()!.name);return role;});},
 reset:(id:string)=>{const role=defaultRoles.find(r=>r.id===id);if(!role)throw new Error('Only system roles have defaults.');return roleService.save(structuredClone(role));},
 remove:(id:string)=>{requirePermission('roles:manage');const role=useRoleStore.getState().roles.find(r=>r.id===id);if(!role||role.isSystem||id==='admin')throw new Error('System roles cannot be deleted.');if(useStaffStore.getState().staff.some(s=>s.role===id))throw new Error('Staff use this role. Reassign them first.');localTransaction(()=>{useRoleStore.setState(s=>({roles:s.roles.filter(r=>r.id!==id)}));activityService.log('role',id,'delete',`Deleted ${role.name}`,authService.getCurrentUser()!.name);});},
};
