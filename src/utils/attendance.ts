import type { AttendanceRecord } from '../types/staff';
import { attendanceConfig } from '../config/attendance';
import { defaultSettings } from '../config/defaultSettings';
export function localDate(now=new Date()){return new Intl.DateTimeFormat('en-CA',{timeZone:attendanceConfig.timeZone,year:'numeric',month:'2-digit',day:'2-digit'}).format(now);}
export function clockMinutes(iso:string){const parts=new Intl.DateTimeFormat('en-GB',{timeZone:attendanceConfig.timeZone,hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(iso)).split(':').map(Number);return parts[0]*60+parts[1];}
export function timeMinutes(time:string){const [h,m]=time.split(':').map(Number);return h*60+m;}
export function lateMinutes(clockIn:string,start:string|undefined=undefined, config=defaultSettings.staffDefaults){const minutes=clockMinutes(clockIn)-timeMinutes(start ?? config.defaultShiftStart);return minutes>config.lateGraceMinutes?minutes:0;}
export function workedHours(record:Pick<AttendanceRecord,'clockIn'|'clockOut'|'breakMinutes'>){return record.clockIn&&record.clockOut?Math.max(0,(Date.parse(record.clockOut)-Date.parse(record.clockIn))/3600000-record.breakMinutes/60):0;}
export function validateClock(record:AttendanceRecord|undefined,action:'in'|'out',now=new Date()) {if(action==='in'&&record?.clockIn)throw new Error('Already clocked in today.');if(action==='out'&&(!record?.clockIn||record.clockOut||now.getTime()<Date.parse(record.clockIn)))throw new Error('Clock out requires an earlier clock in and no existing clock out.');}
