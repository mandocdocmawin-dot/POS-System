import { useCalendarStore } from '../store/useCalendarStore';
import { useHolidayStore } from '../store/useHolidayStore';
import { useShiftStore } from '../store/useShiftStore';
import { usePayrollStore } from '../store/usePayrollStore';
import { useAttendanceStore } from '../store/useAttendanceStore';
import { useOrderStore } from '../store/useOrderStore';
import { useCouponStore } from '../store/useCouponStore';
import { useTransferStore } from '../store/useTransferStore';
import { calendarEventSchema, calendarLayers, type CalendarEvent } from '../types/phase8';
import { expandEvents, deriveCalendarItems } from '../utils/calendar';
import { currentUser, canUse, activePeople, timestamp } from './phase8Context';
import { branchService } from './branchService';
import { activityService } from './activityService';
import { PermissionError } from '../utils/permissions';
export const calendarService = {
  people: () => { currentUser('calendar:view'); return activePeople(); },
  layers: () => { const u = currentUser('calendar:view'); return useCalendarStore.getState().layers[u.id] ?? [...calendarLayers]; },
  setLayers: (layers: typeof calendarLayers[number][]) => { const u = currentUser('calendar:view'); useCalendarStore.setState(s => ({ layers: { ...s.layers, [u.id]: [...new Set(layers)] } })); },
  events: (range: { start: string; end: string }, branchId = branchService.activeId()) => { currentUser('calendar:view'); branchService.assertAccess(branchId); return expandEvents(useCalendarStore.getState().events.filter(e => !e.branchId || e.branchId === branchId), range); },
  get: (id: string) => { currentUser('calendar:view'); const event = useCalendarStore.getState().events.find(e => e.id === id); if (event?.branchId) branchService.assertAccess(event.branchId); return event ? structuredClone(event) : undefined; },
  save: (input: CalendarEvent) => {
    const u = currentUser('calendar:view'), old = useCalendarStore.getState().events.find(e => e.id === input.id);
    if ((old ? old.createdBy !== u.id : input.createdBy !== u.id) && !canUse('calendar:manage')) throw new PermissionError('calendar:manage');
    const event = calendarEventSchema.parse({ ...input, title: input.title.trim(), createdBy: old?.createdBy ?? u.id, createdAt: old?.createdAt ?? timestamp(), updatedAt: timestamp() });
    if (event.allDay ? event.end.slice(0,10)<event.start.slice(0,10) : new Date(event.end).getTime() <= new Date(event.start).getTime()) throw new Error('End must be after start. All-day events may end on their start date.');
    if (event.attendeeStaffIds.some(id => !activePeople().some(s => s.id === id))) throw new Error('Attendees must be active staff.');
    if (event.recurrence?.until && event.recurrence.until < event.start.slice(0, 10)) throw new Error('Recurrence end must not precede the event.');
    if (event.branchId) branchService.assertAccess(event.branchId);
    useCalendarStore.setState(s => ({ events: old ? s.events.map(e => e.id === event.id ? event : e) : [...s.events, event] })); activityService.log('calendar', event.id, old ? 'edit' : 'create', event.title); return event;
  },
  remove: (id: string) => { const e = calendarService.get(id), u = currentUser('calendar:view'); if (!e) throw new Error('Event not found.'); if (e.createdBy !== u.id && !canUse('calendar:manage')) throw new PermissionError('calendar:manage'); useCalendarStore.setState(s => ({ events: s.events.filter(e => e.id !== id) })); activityService.log('calendar', id, 'delete', e.title); },
  derived: (branchId = branchService.activeId()) => {
    const u = currentUser('calendar:view'); branchService.assertAccess(branchId);
    const enabled = calendarService.layers();
    const items = deriveCalendarItems({
      holidays: useHolidayStore.getState().holidays,
      shifts: useShiftStore.getState().shifts.filter(s => s.branchId === branchId && (s.staffId === u.id || canUse('staff:view'))),
      payroll: canUse('payroll:view') ? usePayrollStore.getState().runs : [],
      attendance: useAttendanceStore.getState().records.filter(a => (!a.branchId || a.branchId === branchId) && (a.staffId === u.id || canUse('staff:view'))),
      orders: canUse('orders:view') ? useOrderStore.getState().orders.filter(o => o.branchId === branchId && o.orderStatus !== 'cancelled') : [],
      coupons: canUse('coupons:manage') ? useCouponStore.getState().coupons.filter(c => !c.branchIds?.length || c.branchIds.includes(branchId)) : [],
      transfers: canUse('inventory:transfer') ? useTransferStore.getState().transfers.filter(t => t.fromBranchId === branchId || t.toBranchId === branchId) : [],
    });
    return items.filter(item => enabled.includes(item.layer));
  },
};
