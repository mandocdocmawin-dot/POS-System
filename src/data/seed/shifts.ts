import type {Shift,ShiftTemplate} from '../../types/staff';
import {staff} from './staff';
import {localDate} from '../../utils/attendance';
import {addDays,weekStart} from '../../utils/schedule';
export const shiftTemplates:ShiftTemplate[]=[{id:'morning',name:'Morning',startTime:'08:00',endTime:'16:00'},{id:'mid',name:'Mid',startTime:'12:00',endTime:'20:00'},{id:'evening',name:'Evening',startTime:'14:00',endTime:'22:00'}];
export function createShifts(today=localDate()):Shift[]{const monday=weekStart(today);return staff.filter(s=>s.status==='active').flatMap(s=>Array.from({length:6},(_,day)=>({id:`shift-${s.id}-${day}`,staffId:s.id,date:addDays(monday,day),startTime:'09:00',endTime:'18:00',branchId:s.branchIds[0]})));}
