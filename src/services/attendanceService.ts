import {branchService} from './branchService';
import {settingsService} from './settingsService';
import {attendanceSchema,type AttendanceRecord} from '../types/staff';
import {useAttendanceStore} from '../store/useAttendanceStore';
import {useHolidayStore} from '../store/useHolidayStore';
import {useShiftStore} from '../store/useShiftStore';
import {useStaffStore} from '../store/useStaffStore';
import {useRoleStore} from '../store/useRoleStore';
import {localDate,lateMinutes,validateClock} from '../utils/attendance';
import {hasPermission,PermissionError} from '../utils/permissions';
import {authService,requirePermission} from './authService';
import {activityService} from './activityService';
import {localTransaction} from './localTransaction';
export const attendanceService={
 list:()=>{const user=authService.getCurrentUser();return structuredClone(useAttendanceStore.getState().records.filter(r=>hasPermission(user,'attendance:manage',useRoleStore.getState().roles)||r.staffId===user?.id));},
 status:(staffId:string,date=localDate()):AttendanceRecord['status']=>{const record=useAttendanceStore.getState().records.find(r=>r.staffId===staffId&&r.date===date);if(record)return record.status;if(useHolidayStore.getState().holidays.some(h=>h.date===date))return 'holiday';if(!useShiftStore.getState().shifts.some(s=>s.staffId===staffId&&s.date===date))return 'day_off';return 'absent';},
 clock:(action:'in'|'out',now=new Date())=>{requirePermission('attendance:view');const user=authService.getCurrentUser()!;const date=localDate(now),records=useAttendanceStore.getState().records,current=records.find(r=>r.staffId===user.id&&r.date===date);validateClock(current,action,now);const shift=useShiftStore.getState().shifts.find(s=>s.staffId===user.id&&s.date===date);const record=attendanceSchema.parse({...current,branchId:current?.branchId??branchService.activeId(),id:current?.id??crypto.randomUUID(),staffId:user.id,date,breakMinutes:current?.breakMinutes??0,status:action==='in'?(lateMinutes(now.toISOString(),shift?.startTime,settingsService.get().staffDefaults)?'late':'present'):current!.status,source:'clock',...(action==='in'?{clockIn:now.toISOString()}:{clockOut:now.toISOString()})});return localTransaction(()=>{useAttendanceStore.setState({records:current?records.map(r=>r.id===record.id?record:r):[...records,record]});activityService.log('attendance',record.id,`clock-${action}`,`${user.name} clocked ${action}`,user.name);return record;});},
 saveManual:(input:AttendanceRecord)=>{requirePermission('attendance:manage');const record=attendanceSchema.parse({...input,source:'manual',note:input.note?.trim()});if(!record.note)throw new Error('Manual edits require a note.');if(!useStaffStore.getState().staff.some(s=>s.id===record.staffId))throw new Error('Staff not found.');if(record.clockOut&&(!record.clockIn||record.clockOut<record.clockIn))throw new Error('Clock out must follow clock in.');if([record.clockIn,record.clockOut].some(time=>time&&localDate(new Date(time))!==record.date))throw new Error('Clock times must fall on the record date.');const records=useAttendanceStore.getState().records;if(records.some(r=>r.id!==record.id&&r.staffId===record.staffId&&r.date===record.date))throw new Error('One attendance record per staff per date.');return localTransaction(()=>{useAttendanceStore.setState({records:records.some(r=>r.id===record.id)?records.map(r=>r.id===record.id?record:r):[...records,record]});activityService.log('attendance',record.id,'manual-edit',record.note!,authService.getCurrentUser()!.name);return record;});},
 assertOwn:(staffId:string)=>{if(authService.getCurrentUser()?.id!==staffId&&!hasPermission(authService.getCurrentUser(),'attendance:manage',useRoleStore.getState().roles))throw new PermissionError('attendance:manage');},
};
