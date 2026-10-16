import {payrollRunSchema,type PayrollLine} from '../types/staff';
import {usePayrollStore} from '../store/usePayrollStore';
import {useStaffStore} from '../store/useStaffStore';
import {useAttendanceStore} from '../store/useAttendanceStore';
import {useHolidayStore} from '../store/useHolidayStore';
import {useShiftStore} from '../store/useShiftStore';
import {computePayrollLine,payrollNet,validatePeriod} from '../utils/payroll';
import {requirePermission,authService} from './authService';
import {activityService} from './activityService';
import {localTransaction} from './localTransaction';
import {z} from 'zod';
export const payrollService={
 create:(start:string,end:string)=>{requirePermission('payroll:view');z.iso.date().parse(start);z.iso.date().parse(end);validatePeriod(start,end,usePayrollStore.getState().runs);if(Date.parse(end)-Date.parse(start)>366*86400000)throw new Error('Choose a period of at most one year.');const runs=usePayrollStore.getState().runs;const run=payrollRunSchema.parse({id:crypto.randomUUID(),runNo:`PR-${start.slice(0,7)}-${String(runs.length+1).padStart(3,'0')}`,periodStart:start,periodEnd:end,status:'draft',lines:useStaffStore.getState().staff.filter(s=>s.status==='active').map(s=>computePayrollLine(s,useAttendanceStore.getState().records,useHolidayStore.getState().holidays,start,end,useShiftStore.getState().shifts)),createdAt:new Date().toISOString()});return localTransaction(()=>{usePayrollStore.setState({runs:[...runs,run]});activityService.log('payroll',run.id,'create',run.runNo,authService.getCurrentUser()!.name);return run;});},
 adjust:(id:string,staffId:string,additions:PayrollLine['additions'],deductions:PayrollLine['deductions'])=>{requirePermission('payroll:view');const run=usePayrollStore.getState().runs.find(r=>r.id===id);if(!run||run.status!=='draft')throw new Error('Finalized payroll runs are locked.');if(!run.lines.some(l=>l.staffId===staffId))throw new Error('Payroll line not found.');const next=payrollRunSchema.parse({...run,lines:run.lines.map(l=>{if(l.staffId!==staffId)return l;const line={...l,additions,deductions};return {...line,netPay:payrollNet(line)};})});return localTransaction(()=>{usePayrollStore.setState(s=>({runs:s.runs.map(r=>r.id===id?next:r)}));activityService.log('payroll',id,'adjust','Updated payroll adjustments',authService.getCurrentUser()!.name);});},
 transition:(id:string,status:'finalized'|'paid')=>{requirePermission('payroll:view');const runs=usePayrollStore.getState().runs,run=runs.find(r=>r.id===id);if(!run||(status==='finalized'?run.status!=='draft':run.status!=='finalized'))throw new Error('Invalid payroll status transition.');validatePeriod(run.periodStart,run.periodEnd,runs,id);const next=payrollRunSchema.parse({...run,status});return localTransaction(()=>{usePayrollStore.setState({runs:runs.map(r=>r.id===id?next:r)});activityService.log('payroll',id,status,`${run.runNo} ${status}; demo only`,authService.getCurrentUser()!.name);return next;});},
};
