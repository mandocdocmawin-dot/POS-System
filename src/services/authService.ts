import {routePermissions,routePermission} from '../config/permissions';
import {useAuthStore} from '../store/useAuthStore';
import {useStaffStore} from '../store/useStaffStore';
import {useRoleStore} from '../store/useRoleStore';
import {staffSchema} from '../types/staff';
import {hasPermission,PermissionError} from '../utils/permissions';
import {localTransaction} from './localTransaction';
import {activityService} from './activityService';
import {localDate} from '../utils/attendance';
export const authService={
 getCurrentUser:()=>useStaffStore.getState().staff.find(s=>s.id===useAuthStore.getState().currentUserId)??null,
 login:(email='')=>{const people=useStaffStore.getState().staff;const user=people.find(s=>s.email.toLowerCase()===email.trim().toLowerCase())??people.find(s=>s.id==='staff-admin'&&s.role==='admin')??people.find(s=>s.role==='admin');if(!user)throw new Error('Demo data is missing. Reset demo data.');return localTransaction(()=>{useAuthStore.setState({currentUserId:user.id});activityService.log('auth',user.id,'login',`Demo login as ${user.name}`,user.name);return user;});},
 loginDemo:(role:string)=>{const staff=useStaffStore.getState().staff;const target=staff.find(s=>s.id===`staff-${role}`&&s.role===role)??staff.find(s=>s.role===role);if(!target)throw new Error('No demo staff uses this role.');return authService.login(target.email);},
 logout:()=>{const user=authService.getCurrentUser();localTransaction(()=>{if(user)activityService.log('auth',user.id,'logout','Signed out',user.name);useAuthStore.setState({currentUserId:null});});},
 switchRole:(role:string)=>{const target=useStaffStore.getState().staff.find(s=>s.id===`staff-${role}`&&s.role===role)??useStaffStore.getState().staff.find(s=>s.role===role);if(!target)throw new Error('No demo staff uses this role.');return localTransaction(()=>{const actor=authService.getCurrentUser();activityService.log('auth',target.id,'switch-role',`Switched demo role to ${role}`,actor?.name??target.name);useAuthStore.setState({currentUserId:target.id});return target;});},
 signUp:(name:string,email:string)=>{const people=useStaffStore.getState().staff;if(people.some(s=>s.email.toLowerCase()===email.trim().toLowerCase()))throw new Error('Staff email must be unique.');const next=Math.max(0,...people.map(s=>Number(s.staffNo.replace('EMP-',''))||0))+1;const user=staffSchema.parse({id:crypto.randomUUID(),staffNo:`EMP-${String(next).padStart(3,'0')}`,name,email,role:'cashier',branchIds:['Main Branch'],hireDate:localDate(),status:'active',hourlyRate:0,payType:'hourly',createdAt:new Date().toISOString()});return localTransaction(()=>{useStaffStore.setState({staff:[...people,user]});useAuthStore.setState({currentUserId:user.id});activityService.log('staff',user.id,'create','Created staff via demo sign up',user.name);activityService.log('auth',user.id,'login','Demo sign up login',user.name);return user;});},
 firstPath:()=>{const user=authService.getCurrentUser(),roles=useRoleStore.getState().roles;const candidates=[...(user?.role==='cashier'?['/pos']:[]),'/','/pos','/orders','/customers','/products','/staff','/staff/attendance','/staff/schedule','/inventory/stock','/suppliers','/purchases','/reports/sales','/settings/general','/accounts/income','/profile/overview',...Object.keys(routePermissions).filter(p=>!p.includes(':'))];return candidates.find(path=>hasPermission(user,routePermission(path),roles))??'/403';},
};
export function requirePermission(key:string){if(!hasPermission(authService.getCurrentUser(),key,useRoleStore.getState().roles))throw new PermissionError(key);}

