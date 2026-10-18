import {branchService} from './branchService';
import {shiftSchema,type Shift} from '../types/staff';
import {useShiftStore} from '../store/useShiftStore';
import {useStaffStore} from '../store/useStaffStore';
import {useAttendanceStore} from '../store/useAttendanceStore';
import {useHolidayStore} from '../store/useHolidayStore';

import {validateShift,addDays} from '../utils/schedule';
import {requirePermission,authService} from './authService';
import {activityService} from './activityService';
import {localTransaction} from './localTransaction';
function validate(shift:Shift,shifts:Shift[]){validateShift(shift,shifts);if(!useStaffStore.getState().staff.some(s=>s.id===shift.staffId))throw new Error('Staff not found.');if(!branchService.list().map(b=>b.id).some(b=>b===shift.branchId))throw new Error('Branch not found.');}
export const scheduleService={
 save:(input:Shift)=>{requirePermission('schedule:manage');const shift=shiftSchema.parse(input),shifts=useShiftStore.getState().shifts;validate(shift,shifts);return localTransaction(()=>{useShiftStore.setState({shifts:shifts.some(s=>s.id===shift.id)?shifts.map(s=>s.id===shift.id?shift:s):[...shifts,shift]});activityService.log('shift',shift.id,'save',`Shift for ${shift.date}`,authService.getCurrentUser()!.name);return shift;});},
 warnings:(shift:Shift)=>[...(!useStaffStore.getState().staff.find(s=>s.id===shift.staffId)?.branchIds.includes(shift.branchId)?["Staff is not assigned to this branch."]:[]),...(useHolidayStore.getState().holidays.some(h=>h.date===shift.date)?['This shift is on a holiday.']:[]),...(useAttendanceStore.getState().records.some(r=>r.staffId===shift.staffId&&r.date===shift.date&&r.status==='leave')?['This staff member is on leave.']:[])],
 remove:(id:string)=>{requirePermission('schedule:manage');localTransaction(()=>{useShiftStore.setState(s=>({shifts:s.shifts.filter(x=>x.id!==id)}));activityService.log('shift',id,'delete','Removed shift',authService.getCurrentUser()!.name);});},
 clearWeek:(start:string)=>{requirePermission('schedule:manage');localTransaction(()=>{useShiftStore.setState(s=>({shifts:s.shifts.filter(x=>x.date<start||x.date>addDays(start,6))}));activityService.log('shift',start,'clear-week','Cleared weekly schedule',authService.getCurrentUser()!.name);});},
 copyPreviousWeek:(start:string)=>{requirePermission('schedule:manage');const shifts=useShiftStore.getState().shifts,previous=shifts.filter(s=>s.date>=addDays(start,-7)&&s.date<start);const copies=previous.map(s=>({...s,id:crypto.randomUUID(),date:addDays(s.date,7)}));const all=[...shifts];for(const copy of copies){validate(copy,all);all.push(copy);}localTransaction(()=>{useShiftStore.setState({shifts:all});activityService.log('shift',start,'copy-week',`Copied ${copies.length} shifts`,authService.getCurrentUser()!.name);});return copies.length;},
};
