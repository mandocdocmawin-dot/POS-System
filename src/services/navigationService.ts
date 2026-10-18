import {chatService} from './chatService';
import {canUse} from './phase8Context';
import { orderService } from './orderService';
import { customerService } from './customerService';
import { sidebarBadges } from '../config/sidebarBadges';
import {settingsService} from './settingsService';
import { useStaffStore } from '../store/useStaffStore';
import { useAttendanceStore } from '../store/useAttendanceStore';
import { useHolidayStore } from '../store/useHolidayStore';
import { useShiftStore } from '../store/useShiftStore';
import { useBranchStore } from '../store/useBranchStore';
import { localDate, clockMinutes, timeMinutes } from '../utils/attendance';
function staffAttention(now: Date) {
  const date = localDate(now), branch = useBranchStore.getState().activeBranchId;
  return useStaffStore.getState().staff.filter(staff => {
    if (staff.status !== 'active' || !staff.branchIds.includes(branch)) return false;
    const record = useAttendanceStore.getState().records.find(r => r.staffId === staff.id && r.date === date);
    if (record) return record.status === 'late' || record.status === 'absent';
    if (useHolidayStore.getState().holidays.some(h => h.date === date)) return false;
    const shift = useShiftStore.getState().shifts.filter(s => s.staffId === staff.id && s.date === date).toSorted((a, b) => a.startTime.localeCompare(b.startTime))[0];
    return !!shift && clockMinutes(now.toISOString()) > timeMinutes(shift.startTime) + settingsService.get().staffDefaults.lateGraceMinutes;
  }).length;
}
export const navigationService = {
  counts: (now = new Date()) => ({ unreadChat:canUse('chat:use')?chatService.unread():0, pendingOrders: orderService.list().filter(o => o.orderStatus === 'pending').length, customersWithBalance: customerService.list().filter(c => c.creditBalance > 0).length, staffAttention: staffAttention(now) }),
  badge: (path: string, now = new Date()) => { const key = sidebarBadges[path]; return key ? navigationService.counts(now)[key] : 0; },
};
