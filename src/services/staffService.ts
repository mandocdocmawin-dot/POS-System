import {branchService} from './branchService';
import {useActivityStore} from '../store/useActivityStore';
import {staffSchema,type Staff} from '../types/staff';
import {useStaffStore} from '../store/useStaffStore';
import {useRoleStore} from '../store/useRoleStore';
import {useAttendanceStore} from '../store/useAttendanceStore';
import {usePayrollStore} from '../store/usePayrollStore';
import {useOrderStore} from '../store/useOrderStore';
import {useShiftStore} from '../store/useShiftStore';

import {authService,requirePermission} from './authService';
import {activityService} from './activityService';
import {localTransaction} from './localTransaction';
export function protectLastAdmin(current:Staff,next:Staff|undefined,people:Staff[]){if(current.role==='admin'&&current.status==='active'&&(!next||next.role!=='admin'||next.status!=='active')&&!people.some(s=>s.id!==current.id&&s.role==='admin'&&s.status==='active'))throw new Error('Cannot deactivate, delete or demote the last active Admin.');}
export const staffService={
 list:()=>structuredClone(useStaffStore.getState().staff),
 get:(id:string)=>structuredClone(useStaffStore.getState().staff.find(s=>s.id===id)),
 save:(input:Omit<Staff,'id'|'staffNo'|'createdAt'>,id?:string)=>{requirePermission('staff:manage');const people=useStaffStore.getState().staff,current=people.find(s=>s.id===id);if(id&&!current)throw new Error('Staff not found.');const nextNumber=Math.max(0,...people.map(s=>Number(s.staffNo.replace('EMP-',''))||0))+1;const next=staffSchema.parse({...input,id:current?.id??crypto.randomUUID(),staffNo:current?.staffNo??`EMP-${String(nextNumber).padStart(3,'0')}`,createdAt:current?.createdAt??new Date().toISOString()});if(people.some(s=>s.id!==id&&s.email.toLowerCase()===next.email.toLowerCase()))throw new Error('Staff email must be unique.');if(!useRoleStore.getState().roles.some(r=>r.id===next.role))throw new Error('Select an existing role.');if(next.branchIds.some(b=>!branchService.list().map(b=>b.id).some(x=>x===b)))throw new Error('Select existing branches.');if(current){if(current.id===authService.getCurrentUser()?.id&&current.role!==next.role)throw new Error('You cannot change your own role.');protectLastAdmin(current,next,people);}return localTransaction(()=>{if(current&&current.name!==next.name){useOrderStore.setState(s=>({orders:s.orders.map(order=>!order.cashierId&&order.cashier===current.name?{...order,cashierId:current.id}:order)}));useActivityStore.setState(s=>({logs:s.logs.map(log=>!log.actorId&&log.actor===current.name?{...log,actorId:current.id}:log)}));}useStaffStore.setState({staff:current?people.map(s=>s.id===id?next:s):[...people,next]});activityService.log('staff',next.id,current?'edit':'create',`${current?'Updated':'Created'} ${next.name}`,authService.getCurrentUser()!.name);return next;});},
 deactivate:(id:string)=>{requirePermission('staff:manage');const current=staffService.get(id);if(!current)throw new Error('Staff not found.');return staffService.save({...current,status:'inactive'},id);},
 deactivateSelf:()=>{const current=authService.getCurrentUser();if(!current)throw new Error('Sign in first.');protectLastAdmin(current,{...current,status:'inactive'},useStaffStore.getState().staff);return localTransaction(()=>{useStaffStore.setState(s=>({staff:s.staff.map(p=>p.id===current.id?{...p,status:'inactive'}:p)}));activityService.log('staff',current.id,'deactivate','Account deactivated',current.name);authService.logout();});},
 remove:(id:string)=>{requirePermission('staff:manage');const current=staffService.get(id);if(!current)throw new Error('Staff not found.');if(id===authService.getCurrentUser()?.id)throw new Error('You cannot delete yourself.');protectLastAdmin(current,undefined,useStaffStore.getState().staff);if(useAttendanceStore.getState().records.some(r=>r.staffId===id)||usePayrollStore.getState().runs.some(r=>r.lines.some(l=>l.staffId===id))||useOrderStore.getState().orders.some(o=>o.cashierId===id||o.cashier===current.name)||useShiftStore.getState().shifts.some(s=>s.staffId===id))throw new Error('Staff has attendance, payroll, shifts or orders. Deactivate instead.');localTransaction(()=>{useStaffStore.setState(s=>({staff:s.staff.filter(p=>p.id!==id)}));activityService.log('staff',id,'delete',`Deleted ${current.name}`,authService.getCurrentUser()!.name);});},
};
