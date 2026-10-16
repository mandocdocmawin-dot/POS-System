import type {AttendanceRecord} from '../../types/staff';
import {staff} from './staff';
import {holidays2026} from './holidays2026';
import {localDate} from '../../utils/attendance';
import {addDays} from '../../utils/schedule';
export function createAttendance(today=localDate()):AttendanceRecord[]{return staff.filter(s=>s.status==='active').flatMap((s,index)=>Array.from({length:30},(_,i)=>{const date=addDays(today,i-30),off=new Date(date+'T12:00Z').getUTCDay()===0,holiday=holidays2026.some(h=>h.date===date),absent=i===12&&index===3,leave=i===8&&index===4,late=i%7===index%7,status=holiday?'holiday':off?'day_off':absent?'absent':leave?'leave':late?'late':'present';return {id:`attendance-${s.id}-${date}`,staffId:s.id,date,clockIn:['present','late'].includes(status)?`${date}T01:${late?'20':'00'}:00.000Z`:undefined,clockOut:['present','late'].includes(status)?`${date}T10:00:00.000Z`:undefined,breakMinutes:60,status,source:'clock'};}));}
