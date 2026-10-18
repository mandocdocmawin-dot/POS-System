import { calendarService } from './calendarService';
import { currentUser, canUse, activePeople } from './phase8Context';
import { useShiftStore } from '../store/useShiftStore';
import { branchService } from './branchService';
import { settingsService } from './settingsService';
import { localDay, startOfWeek, isoWeek } from '../utils/calendar';
import type { CalendarEvent } from '../types/phase8';
export interface CalendarDisplayItem { id: string; title: string; start: string; end: string; allDay: boolean; seriesId?: string; link?: string; staffIds: string[]; color?: string }
export const moveDay = (date: string, amount: number) => { const d = new Date(`${date}T12:00:00`); d.setDate(d.getDate() + amount); return localDay(d); };
export const calendarViewService = {
  timeline: (date: string, branch: string) => {
    const user = currentUser('calendar:view'), data = calendarViewService.data(date, branch, 'day-view');
    return activePeople().filter(staff => (staff.id === user.id || canUse('staff:view')) && staff.branchIds.includes(branch)).map(staff => ({ staff, events: data.items.filter(event => event.staffIds.includes(staff.id) || useShiftStore.getState().shifts.some(shift => shift.staffId === staff.id && event.id.startsWith(`shifts:${shift.id}:`))) }));
  },
  branches: () => { const user = currentUser('calendar:view'); return branchService.list().filter(b => user.role === 'admin' || user.branchIds.includes(b.id)); },
  create: (day: string, branchId: string): CalendarEvent => { const user = currentUser('calendar:view'), now = new Date().toISOString(); return { id: crypto.randomUUID(), title: '', type: 'meeting', start: `${day}T09:00:00`, end: `${day}T10:00:00`, allDay: false, branchId, attendeeStaffIds: [user.id], reminderMinutes: 15, createdBy: user.id, createdAt: now, updatedAt: now }; },
  data: (date: string, branchId: string, view = 'default') => {
    const anchor = new Date(`${date}T12:00:00`), first = settingsService.get().general.weekStartsOn;
    const start = view === 'default' ? startOfWeek(new Date(anchor.getFullYear(), anchor.getMonth(), 1), first) : view === 'week-view' ? startOfWeek(anchor, first) : new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate());
    const count = view === 'default' ? 42 : view === 'week-view' ? 7 : view === 'list-view' ? 30 : 1;
    const days = Array.from({ length: count }, (_, i) => { const day = new Date(start); day.setDate(start.getDate() + i); return { date: localDay(day), weekday: day.toLocaleDateString(undefined, { weekday: 'short' }), label: day.getDate(), week: isoWeek(day), currentMonth: day.getMonth() === anchor.getMonth() }; });
    const range = { start: `${days[0].date}T00:00:00`, end: `${days.at(-1)!.date}T23:59:59` };
    const manual: CalendarDisplayItem[] = calendarService.events(range, branchId).map(e => ({ ...e, staffIds: e.attendeeStaffIds }));
    const derived: CalendarDisplayItem[] = calendarService.derived(branchId).map(e => ({ ...e, staffIds: [], start: e.start.length === 10 ? `${e.start}T00:00:00` : e.start, end: e.end.length === 10 ? `${e.end}T23:59:59` : e.end }));
    const items = [...manual, ...derived].filter(e => Date.parse(e.start) <= Date.parse(range.end) && Date.parse(e.end) >= Date.parse(range.start));
    const byDay = (day: string) => items.filter(e => localDay(new Date(e.start)) <= day && localDay(new Date(e.end)) >= day).sort((a, b) => a.start.localeCompare(b.start));
    return { days, items, byDay, label: anchor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) };
  },
  move: (date: string, amount: number, view: string) => { const day = new Date(`${date}T12:00:00`); if (view === 'default') { day.setDate(1); day.setMonth(day.getMonth() + amount); } else day.setDate(day.getDate() + amount * (view === 'week-view' ? 7 : view === 'list-view' ? 30 : 1)); return localDay(day); },
};
