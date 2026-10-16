import {beforeEach,describe,it,expect,vi} from 'vitest';
const {storage}=vi.hoisted(()=>{const values=new Map<string,string>();const storage={getItem:(k:string)=>values.get(k)??null,setItem:(k:string,v:string)=>{values.set(k,v);},removeItem:(k:string)=>{values.delete(k);},clear:()=>values.clear()};Object.defineProperty(globalThis,'localStorage',{value:storage,configurable:true});Object.defineProperty(globalThis,'window',{value:{localStorage:storage},configurable:true});return {storage};});
import {createPhase5Seed} from '../data/seed/phase5';
import {useStaffStore} from '../store/useStaffStore';
import {useRoleStore} from '../store/useRoleStore';
import {useAttendanceStore} from '../store/useAttendanceStore';
import {useHolidayStore} from '../store/useHolidayStore';
import {useShiftStore} from '../store/useShiftStore';
import {usePayrollStore} from '../store/usePayrollStore';
import {useAuthStore} from '../store/useAuthStore';
import {useActivityStore} from '../store/useActivityStore';
import {useOrderStore} from '../store/useOrderStore';
import {authService} from './authService';
import {staffService} from './staffService';
import {roleService} from './roleService';
import {attendanceService} from './attendanceService';
import {payrollService} from './payrollService';
import {scheduleService} from './scheduleService';
import {holidayService} from './holidayService';
import {PermissionError} from '../utils/permissions';
beforeEach(()=>{vi.restoreAllMocks();storage.clear();const s=createPhase5Seed('2026-10-16');useStaffStore.setState({staff:s.staff});useRoleStore.setState({roles:s.roles});useAttendanceStore.setState({records:s.records});useHolidayStore.setState({holidays:s.holidays});useShiftStore.setState({shifts:s.shifts});usePayrollStore.setState({runs:[]});useOrderStore.setState({orders:[],counter:0});useActivityStore.setState({logs:[]});useAuthStore.setState({currentUserId:'staff-admin'});});
describe('demo auth',()=>{
 it('accepts empty and unknown emails as Admin and matches known staff case-insensitively',()=>{expect(authService.login().role).toBe('admin');expect(authService.login('wrong@example.com').role).toBe('admin');expect(authService.login(' CASHIER@TINDAPOS.DEMO ').role).toBe('cashier');expect(authService.firstPath()).toBe('/pos');});
 it('logs inactive staff in and persists/logs the session',()=>{const inactive=useStaffStore.getState().staff.find(s=>s.status==='inactive')!;expect(authService.login(inactive.email).id).toBe(inactive.id);expect(JSON.parse(storage.getItem('tindapos:auth')!).state.currentUserId).toBe(inactive.id);authService.logout();expect(authService.getCurrentUser()).toBeNull();expect(useActivityStore.getState().logs.at(-1)?.actor).toBe(inactive.name);});
 it('creates an active Cashier through sign up, logs in and rejects duplicate staff emails',()=>{const user=authService.signUp('New Cashier','new@example.com');expect(user).toMatchObject({role:'cashier',status:'active'});expect(authService.getCurrentUser()?.id).toBe(user.id);expect(()=>authService.signUp('Duplicate','NEW@example.com')).toThrow('unique');});
 it('switches demo roles and logs the original actor',()=>{const actor=authService.getCurrentUser()!.name;expect(authService.switchRole('manager').role).toBe('manager');expect(useActivityStore.getState().logs.at(-1)?.actor).toBe(actor);});
});
describe('staff and role protections',()=>{
 it('blocks deactivating or demoting the last active Admin, including self deactivation',()=>{const admin=staffService.get('staff-admin')!;expect(()=>staffService.deactivate(admin.id)).toThrow('last active Admin');expect(()=>staffService.deactivateSelf()).toThrow('last active Admin');authService.switchRole('manager');useRoleStore.setState(s=>({roles:s.roles.map(r=>r.id==='manager'?{...r,permissions:[...r.permissions,'staff:manage']}:r)}));expect(()=>staffService.save({...admin,role:'cashier'},admin.id)).toThrow('last active Admin');});
 it('blocks own-role changes and self deletion',()=>{const admin=staffService.get('staff-admin')!;expect(()=>staffService.save({...admin,role:'manager'},admin.id)).toThrow('own role');expect(()=>staffService.remove(admin.id)).toThrow('yourself');});
 it('allows deactivation when another active Admin exists and retains the record',()=>{const admin=staffService.get('staff-admin')!;const second=staffService.save({...admin,name:'Second Admin',email:'second@example.com'});staffService.deactivate(second.id);expect(staffService.get(second.id)?.status).toBe('inactive');});
 it('requires unique emails for create and edit',()=>{const cashier=staffService.get('staff-cashier')!;expect(()=>staffService.save({...cashier,email:'ADMIN@TINDAPOS.DEMO'})).toThrow('unique');expect(()=>staffService.save({...cashier,email:'admin@tindapos.demo'},cashier.id)).toThrow('unique');});
 it('blocks deleting staff with attendance or payroll and permits deleting an unused staff',()=>{expect(()=>staffService.remove('staff-cashier')).toThrow('Deactivate instead');const empty=staffService.save({...staffService.get('staff-cashier')!,email:'unused@example.com'});staffService.remove(empty.id);expect(staffService.get(empty.id)).toBeUndefined();const paid=staffService.save({...staffService.get('staff-cashier')!,email:'paid@example.com'});const run=payrollService.create('2026-11-01','2026-11-15');expect(run.lines.some(l=>l.staffId===paid.id)).toBe(true);expect(()=>staffService.remove(paid.id)).toThrow('Deactivate instead');});
 it('protects Admin permissions and system roles; custom roles cannot be deleted while assigned',()=>{const admin=useRoleStore.getState().roles[0];expect(()=>roleService.save({...admin,permissions:[]})).toThrow('locked');expect(()=>roleService.remove('manager')).toThrow('System');const role=roleService.save({id:'custom',name:'Custom',description:'Custom role',permissions:['products:view'],isSystem:false});const cashier=staffService.get('staff-cashier')!;staffService.save({...cashier,role:role.id},cashier.id);expect(()=>roleService.remove(role.id)).toThrow('Staff use');staffService.save({...cashier,role:'cashier'},cashier.id);roleService.remove(role.id);expect(useRoleStore.getState().roles.some(r=>r.id===role.id)).toBe(false);});
 it('checks service permissions before staff and payroll mutations',()=>{authService.switchRole('cashier');expect(()=>staffService.deactivate('staff-manager')).toThrow(PermissionError);expect(()=>roleService.remove('manager')).toThrow(PermissionError);expect(()=>payrollService.create('2026-11-01','2026-11-15')).toThrow(PermissionError);});
 it('rolls back staff edits when activity storage fails',()=>{const before=structuredClone(useStaffStore.getState()),logs=structuredClone(useActivityStore.getState());const original=storage.setItem;let fail=true;vi.spyOn(storage,'setItem').mockImplementation((key,value)=>{if(fail&&key==='tindapos:activity'){fail=false;throw new Error('Disk full');}original(key,value);});expect(()=>staffService.deactivate('staff-cashier')).toThrow();expect(useStaffStore.getState()).toEqual(before);expect(useActivityStore.getState()).toEqual(logs);});
});
describe('attendance service rules',()=>{
 it('clocks only the current user, once each direction, and calculates lateness',()=>{authService.switchRole('cashier');const record=attendanceService.clock('in',new Date('2026-10-16T01:11:00Z'));expect(record).toMatchObject({staffId:'staff-cashier',status:'late'});expect(()=>attendanceService.clock('in',new Date('2026-10-16T02:00:00Z'))).toThrow('Already');expect(()=>attendanceService.clock('out',new Date('2026-10-16T01:00:00Z'))).toThrow();attendanceService.clock('out',new Date('2026-10-16T09:00:00Z'));expect(()=>attendanceService.clock('out',new Date('2026-10-16T10:00:00Z'))).toThrow();expect(attendanceService.list().every(r=>r.staffId==='staff-cashier')).toBe(true);});
 it('requires a note, valid clock order, same-day times and one record per staff/date',()=>{const input={id:'manual',staffId:'staff-cashier',date:'2026-10-16',breakMinutes:0,status:'present' as const,source:'manual' as const,note:'Correction'};expect(()=>attendanceService.saveManual({...input,note:' '})).toThrow('note');expect(()=>attendanceService.saveManual({...input,clockOut:'2026-10-16T01:00:00Z'})).toThrow('follow');expect(()=>attendanceService.saveManual({...input,clockIn:'2026-10-15T01:00:00Z'})).toThrow('record date');attendanceService.saveManual(input);expect(()=>attendanceService.saveManual({...input,id:'duplicate'})).toThrow('One attendance');expect(useAttendanceStore.getState().records.find(r=>r.id==='manual')?.source).toBe('manual');});
 it('does not let cashiers manually edit attendance',()=>{authService.switchRole('cashier');expect(()=>attendanceService.saveManual({id:'manual',staffId:'staff-manager',date:'2026-10-16',breakMinutes:0,status:'present',source:'manual',note:'Unauthorized'})).toThrow(PermissionError);});
 it('uses holiday and day-off statuses for days without records',()=>{expect(attendanceService.status('staff-cashier','2026-12-25')).toBe('holiday');expect(attendanceService.status('staff-cashier','2026-10-18')).toBe('day_off');});
});
describe('payroll workflow',()=>{
 it('computes draft lines, applies adjustments, locks on finalize and records payment',()=>{const run=payrollService.create('2026-10-01','2026-10-15'),line=run.lines[0];payrollService.adjust(run.id,line.staffId,[{label:'Bonus',amount:1000}],line.deductions);const updated=usePayrollStore.getState().runs[0].lines[0];expect(updated.netPay).toBe(line.netPay+1000);payrollService.transition(run.id,'finalized');expect(()=>payrollService.adjust(run.id,line.staffId,[],[])).toThrow('locked');payrollService.transition(run.id,'paid');expect(usePayrollStore.getState().runs[0].status).toBe('paid');expect(useActivityStore.getState().logs.at(-1)?.action).toBe('paid');expect(()=>payrollService.transition(run.id,'finalized')).toThrow('transition');});
 it('rejects overlapping periods and payment before finalization',()=>{const run=payrollService.create('2026-10-01','2026-10-15');expect(()=>payrollService.create('2026-10-15','2026-10-31')).toThrow('overlap');expect(()=>payrollService.transition(run.id,'paid')).toThrow('transition');});
 it('rejects negative adjustments before writing and keeps snapshots after rate changes',()=>{const run=payrollService.create('2026-10-01','2026-10-15'),line=run.lines[0];expect(()=>payrollService.adjust(run.id,line.staffId,[{label:'Bad',amount:-1}],[])).toThrow();expect(usePayrollStore.getState().runs[0]).toEqual(run);useStaffStore.setState(s=>({staff:s.staff.map(p=>({...p,hourlyRate:99999}))}));expect(usePayrollStore.getState().runs[0].lines[0].hourlyRate).toBe(line.hourlyRate);});
 it('rolls back finalization if its activity entry cannot persist',()=>{const run=payrollService.create('2026-10-01','2026-10-15');const original=storage.setItem;let fail=true;vi.spyOn(storage,'setItem').mockImplementation((key,value)=>{if(fail&&key==='tindapos:activity'){fail=false;throw new Error('Disk full');}original(key,value);});expect(()=>payrollService.transition(run.id,'finalized')).toThrow();expect(usePayrollStore.getState().runs[0]).toEqual(run);});
});
describe('holiday and schedule services',()=>{
 it('rejects duplicate holiday names on a date',()=>{const holiday=useHolidayStore.getState().holidays[0];expect(()=>holidayService.save({...holiday,id:'duplicate'})).toThrow('unique');});
 it('warns for holiday shifts and validates a whole week before copying',()=>{const shift={id:'holiday-shift',staffId:'staff-cashier',date:'2026-12-25',startTime:'09:00',endTime:'17:00',branchId:'Main Branch'};expect(scheduleService.warnings(shift)).toContain('This shift is on a holiday.');scheduleService.save(shift);const before=structuredClone(useShiftStore.getState().shifts);expect(()=>scheduleService.copyPreviousWeek('2026-10-19')).not.toThrow();const copied=structuredClone(useShiftStore.getState().shifts);expect(()=>scheduleService.copyPreviousWeek('2026-10-19')).toThrow('overlap');expect(useShiftStore.getState().shifts).toEqual(copied);expect(copied.length).toBeGreaterThan(before.length);});
});

import { navigationService } from './navigationService';
import { useBranchStore } from '../store/useBranchStore';
describe('staff status sidebar badge', () => {
 it('waits for shift grace time and scopes attention counts to the current branch', () => {
  useBranchStore.getState().setBranch('Main Branch');
  expect(navigationService.badge('/staff/staff-list',new Date('2026-10-16T01:05:00Z'))).toBe(0);
  expect(navigationService.badge('/staff/staff-list',new Date('2026-10-16T01:11:00Z'))).toBe(4);
  useBranchStore.getState().setBranch('Branch 2');
  expect(navigationService.badge('/staff/staff-list',new Date('2026-10-16T01:11:00Z'))).toBe(3);
  expect(navigationService.badge('/staff/staff-list',new Date('2026-12-25T10:00:00Z'))).toBe(0);
  useBranchStore.getState().setBranch('Main Branch');
 });
});

describe('demo role destinations',()=>{
 it('uses an actual Admin after a demo staff member is reassigned',()=>{
  const second=staffService.save({...staffService.get('staff-admin')!,email:'another.admin@example.com',name:'Another Admin'});
  useStaffStore.setState(s=>({staff:s.staff.map(p=>p.id==='staff-admin'?{...p,role:'cashier'}:p)}));
  expect(authService.login('random@example.com').id).toBe(second.id);
  expect(authService.loginDemo('admin').role).toBe('admin');
  expect(useActivityStore.getState().logs.at(-1)?.action).toBe('login');
 });
 it('finds a valid landing route for a custom role without dashboard or POS access',()=>{
  roleService.save({id:'stock-reader',name:'Stock Reader',description:'Read stock',permissions:['inventory:view'],isSystem:false});
  const person=staffService.save({...staffService.get('staff-cashier')!,email:'stock@example.com',role:'stock-reader'});
  authService.login(person.email);expect(authService.firstPath()).toBe('/inventory/stock');
 });
});

import {createPosSeed} from '../data/seed/pos';
describe('staff history after profile edits',()=>{
 it('retains order and activity links across a rename while preserving stored actor names',()=>{
  const person=staffService.save({...staffService.get('staff-cashier')!,email:'history@example.com',name:'Original Cashier'});
  const order={...createPosSeed().orders[0],cashier:person.name};
  useOrderStore.setState({orders:[order],counter:12});
  useActivityStore.setState(s=>({logs:[...s.logs,{id:'old-log',entityType:'order',entityId:order.id,action:'create',description:'Old order',actor:person.name,createdAt:new Date().toISOString()}]}));
  staffService.save({...person,name:'Renamed Cashier'},person.id);
  expect(useOrderStore.getState().orders[0]).toMatchObject({cashier:'Original Cashier',cashierId:person.id});
  expect(useActivityStore.getState().logs.find(l=>l.id==='old-log')).toMatchObject({actor:'Original Cashier',actorId:person.id});
  expect(()=>staffService.remove(person.id)).toThrow('Deactivate instead');
 });
});
