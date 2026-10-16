import {staff} from './staff';
import {roles} from './roles';
import {holidays2026} from './holidays2026';
import {createAttendance} from './attendance';
import {createShifts} from './shifts';
import {computePayrollLine} from '../../utils/payroll';
import {localDate} from '../../utils/attendance';
import {addDays} from '../../utils/schedule';
import type {PayrollRun} from '../../types/staff';
import {useStaffStore} from '../../store/useStaffStore';
import {useRoleStore} from '../../store/useRoleStore';
import {useHolidayStore} from '../../store/useHolidayStore';
import {useAttendanceStore} from '../../store/useAttendanceStore';
import {useShiftStore} from '../../store/useShiftStore';
import {usePayrollStore} from '../../store/usePayrollStore';
import {useAuthStore} from '../../store/useAuthStore';
import {localTransaction} from '../../services/localTransaction';
export function createPhase5Seed(today=localDate()){
 const records=createAttendance(today),shifts=createShifts(today);
 const runs:PayrollRun[]=[0,1].map(i=>{const periodStart=addDays(today,i===0?-30:-15),periodEnd=addDays(today,i===0?-16:-1);return {id:`payroll-seed-${i}`,runNo:`PR-${periodStart.slice(0,7)}-${i?'B':'A'}`,periodStart,periodEnd,status:i?'draft':'finalized',lines:staff.filter(s=>s.status==='active').map(s=>computePayrollLine(s,records,holidays2026,periodStart,periodEnd,shifts)),createdAt:new Date().toISOString()};});
 return structuredClone({staff,roles,holidays:holidays2026,records,shifts,runs});
}
export function initializeStaffData(){if(useStaffStore.getState().staff.length)return;const seed=createPhase5Seed();localTransaction(()=>{useRoleStore.setState({roles:seed.roles});useStaffStore.setState({staff:seed.staff});useAttendanceStore.setState({records:seed.records});useHolidayStore.setState({holidays:seed.holidays});useShiftStore.setState({shifts:seed.shifts});usePayrollStore.setState({runs:seed.runs});useAuthStore.setState({currentUserId:null});});}
