import {holidaySchema,type Holiday} from '../types/staff';
import {useHolidayStore} from '../store/useHolidayStore';
import {requirePermission,authService} from './authService';
import {activityService} from './activityService';
import {localTransaction} from './localTransaction';
export const holidayService={save:(input:Holiday)=>{requirePermission('holidays:manage');const holiday=holidaySchema.parse(input),holidays=useHolidayStore.getState().holidays;if(holidays.some(h=>h.id!==holiday.id&&h.date===holiday.date&&h.name.trim().toLowerCase()===holiday.name.trim().toLowerCase()))throw new Error('Holiday date and name must be unique.');return localTransaction(()=>{useHolidayStore.setState({holidays:holidays.some(h=>h.id===holiday.id)?holidays.map(h=>h.id===holiday.id?holiday:h):[...holidays,holiday]});activityService.log('holiday',holiday.id,'save',holiday.name,authService.getCurrentUser()!.name);return holiday;});},remove:(id:string)=>{requirePermission('holidays:manage');localTransaction(()=>{useHolidayStore.setState(s=>({holidays:s.holidays.filter(h=>h.id!==id)}));activityService.log('holiday',id,'delete','Deleted holiday',authService.getCurrentUser()!.name);});}};
