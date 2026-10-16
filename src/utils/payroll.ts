import type { AttendanceRecord, Holiday, PayrollLine, PayrollRun, Shift, Staff } from '../types/staff';
import { payrollConfig as config } from '../config/payroll';
import { lateMinutes, workedHours } from './attendance';
import { addDays } from './schedule';
export function validatePeriod(start:string,end:string,runs:PayrollRun[],excludeId?:string){if(end<start)throw new Error('Period end must follow start.');if(runs.some(r=>r.id!==excludeId&&start<=r.periodEnd&&end>=r.periodStart))throw new Error('Payroll periods cannot overlap.');}
export function computePayrollLine(staff:Staff,records:AttendanceRecord[],holidays:Holiday[],start:string,end:string,shifts:Shift[]=[]):PayrollLine{
 let regularHours=0,overtimeHours=0,holidayHours=0,late=0,earnings=0;
 const rate=staff.hourlyRate;
 const monthly=staff.payType==='monthly';
 // Monthly base is a semi-monthly snapshot; unpaid absence and leave remove daily pay.
 const daily=(staff.monthlyRate??0)/26;
 let base=monthly?(staff.monthlyRate??0)/2:0;
 for(let date=start;date<=end;date=addDays(date,1)){
  const record=records.find(r=>r.staffId===staff.id&&r.date===date),holiday=holidays.find(h=>h.date===date);
  const hours=record?workedHours(record):0;
  const regular=Math.min(config.dailyHours,hours),overtime=Math.max(0,hours-config.dailyHours);
  if(holiday&&hours>0){holidayHours+=hours;const multiplier=holiday.type==='regular'?config.regularHolidayMultiplier:holiday.type==='special'?config.specialHolidayMultiplier:1;earnings+=regular*rate*(monthly?multiplier-1:multiplier)+overtime*rate*multiplier*config.overtimeMultiplier;}
  else {regularHours+=regular;overtimeHours+=overtime;earnings+=(monthly?0:regular*rate)+overtime*rate*config.overtimeMultiplier;}
  if(!monthly&&holiday?.paid&&!hours&&!['absent','leave','day_off'].includes(record?.status??''))earnings+=rate*config.dailyHours;
  if(monthly&&record&&['absent','leave'].includes(record.status)&&!holiday?.paid)base-=daily;
  if(record?.clockIn)late+=lateMinutes(record.clockIn,shifts.find(s=>s.staffId===staff.id&&s.date===date)?.startTime);
 }
 const grossPay=Math.max(0,Math.round(base+earnings));
 const deduction=Math.round(rate/60*late);
 const deductions=deduction?[{label:'Late minutes',amount:deduction}]:[];
 return {staffId:staff.id,regularHours,overtimeHours,holidayHours,lateMinutes:late,grossPay,deductions,additions:[],netPay:Math.max(0,grossPay-deduction),hourlyRate:rate,monthlyRate:staff.monthlyRate,payType:staff.payType};
}
export function payrollNet(line:PayrollLine){return Math.max(0,line.grossPay+line.additions.reduce((n,a)=>n+a.amount,0)-line.deductions.reduce((n,a)=>n+a.amount,0));}
