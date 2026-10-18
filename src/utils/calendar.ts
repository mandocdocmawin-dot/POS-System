import type { CalendarEvent, DerivedCalendarItem } from '../types/phase8';
import type { Holiday, Shift, PayrollRun, AttendanceRecord } from '../types/staff';
export function localDay(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
export function startOfWeek(date: Date, first: 'monday' | 'sunday') {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  result.setDate(result.getDate() - (result.getDay() - (first === 'monday' ? 1 : 0) + 7) % 7);
  return result;
}
export function isoWeek(date: Date) {
  const day = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  day.setUTCDate(day.getUTCDate() + 4 - (day.getUTCDay() || 7));
  return Math.ceil((((day.getTime() - Date.UTC(day.getUTCFullYear(), 0, 1)) / 86400000) + 1) / 7);
}
export interface CalendarOccurrence extends CalendarEvent { seriesId: string }
export function expandEvents(events: CalendarEvent[], range: { start: string; end: string }): CalendarOccurrence[] {
  const from = new Date(range.start).getTime(), to = new Date(range.end).getTime();
  if (!Number.isFinite(from) || !Number.isFinite(to) || to < from) return [];
  return events.flatMap(event => {
    const origin = new Date(event.start), finish = new Date(event.end), recurrence = event.recurrence;
    if (!Number.isFinite(origin.getTime()) || !Number.isFinite(finish.getTime()) || (recurrence && (!Number.isInteger(recurrence.interval) || recurrence.interval < 1))) return [];
    const result: CalendarOccurrence[] = [];
    const duration = finish.getTime() - origin.getTime();
    const until = recurrence?.until ? new Date(`${recurrence.until}T23:59:59.999`).getTime() : to;
    let index = 0;
    if (recurrence && from > origin.getTime()) {
      const days = Math.floor((from - origin.getTime() - Math.max(duration, 0)) / 86400000);
      index = Math.max(0, recurrence.freq === 'monthly' ? Math.floor(((new Date(from).getFullYear() - origin.getFullYear()) * 12 + new Date(from).getMonth() - origin.getMonth()) / recurrence.interval) - 1 : Math.floor(days / (recurrence.interval * (recurrence.freq === 'weekly' ? 7 : 1))) - 1);
    }
    for (; result.length < 366; index++) {
      const start = new Date(origin);
      if (recurrence?.freq === 'monthly') {
        start.setDate(1); start.setMonth(origin.getMonth() + index * recurrence.interval); const month = start.getMonth(); start.setDate(origin.getDate());
        if (start.getMonth() !== month) { if (start.getTime() > to) break; continue; }
      } else if (recurrence) start.setDate(origin.getDate() + index * recurrence.interval * (recurrence.freq === 'weekly' ? 7 : 1));
      if (start.getTime() > to || start.getTime() > until) break;
      const end = new Date(start.getTime() + duration);
      if (end.getTime() >= from) result.push({ ...event, id: recurrence ? `${event.id}:${start.toISOString()}` : event.id, seriesId: event.id, start: start.toISOString(), end: end.toISOString() });
      if (!recurrence) break;
    }
    return result;
  }).sort((a, b) => a.start.localeCompare(b.start));
}
export interface CalendarSources {
  holidays: Holiday[]; shifts: Shift[]; payroll: PayrollRun[]; attendance: AttendanceRecord[];
  orders: { id: string; orderNo: string; dueDate?: string; balanceDue: number }[];
  coupons: { id: string; name: string; startsAt?: string; endsAt?: string }[];
  transfers: { id: string; transferNo: string; sentAt?: string; receivedAt?: string }[];
}
export function deriveCalendarItems(data: CalendarSources): DerivedCalendarItem[] {
  const item = (id: string, layer: DerivedCalendarItem['layer'], title: string, start: string, end: string, link: string, allDay = true): DerivedCalendarItem => ({ id: `${layer}:${id}:${start}`, layer, title, start, end, link, allDay });
  return [
    ...data.holidays.map(h => item(h.id, 'holidays', h.name, h.date, h.date, '/staff/holidays')),
    ...data.shifts.map(s => item(s.id, 'shifts', 'Shift', `${s.date}T${s.startTime}`, `${s.date}T${s.endTime}`, '/staff/schedule', false)),
    ...data.payroll.map(p => item(p.id, 'payroll', `Payroll ${p.runNo}`, p.periodStart, p.periodEnd, '/staff/payroll')),
    ...data.payroll.filter(p => p.paidAt).map(p => item(`${p.id}:paid`, 'payroll', `Pay date ${p.runNo}`, p.paidAt!, p.paidAt!, '/staff/payroll')),
    ...data.orders.filter(o => o.dueDate && o.balanceDue > 0).map(o => item(o.id, 'due_dates', `Balance due ${o.orderNo}`, o.dueDate!, o.dueDate!, `/orders/${o.id}`)),
    ...data.coupons.flatMap(c => [c.startsAt && item(c.id, 'coupons', `${c.name} starts`, c.startsAt, c.startsAt, '/settings/coupons'), c.endsAt && item(c.id, 'coupons', `${c.name} ends`, c.endsAt, c.endsAt, '/settings/coupons')].filter((v): v is DerivedCalendarItem => !!v)),
    ...data.transfers.flatMap(t => [t.sentAt && item(t.id, 'transfers', `${t.transferNo} sent`, t.sentAt, t.sentAt, '/inventory/stock-transfer'), t.receivedAt && item(t.id, 'transfers', `${t.transferNo} received`, t.receivedAt, t.receivedAt, '/inventory/stock-transfer')].filter((v): v is DerivedCalendarItem => !!v)),
    ...data.attendance.filter(a => a.status === 'leave').map(a => item(a.id, 'leave', 'Approved leave', a.date, a.date, '/staff/attendance')),
  ];
}
