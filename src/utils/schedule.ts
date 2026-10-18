import type { Shift } from '../types/staff';
export function validateShift(shift:Shift,shifts:Shift[]){if(shift.endTime<=shift.startTime)throw new Error('End time must be after start time; same-day shifts only.');if(shifts.some(s=>s.id!==shift.id&&s.staffId===shift.staffId&&s.date===shift.date&&shift.startTime<s.endTime&&shift.endTime>s.startTime))throw new Error('Staff shifts cannot overlap.');}
export function addDays(date:string,days:number){const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10);}
export function weekStart(date:string,startsOn:'monday'|'sunday'='monday'){const d=new Date(date+'T12:00:00Z');return addDays(date,-((d.getUTCDay()+(startsOn==='monday'?6:0))%7));}
