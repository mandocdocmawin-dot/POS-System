import type { CalendarDisplayItem } from '../services/calendarViewService';
import { localDay } from './calendar';
export function layoutTimedEvents(events: CalendarDisplayItem[], day: string) {
  const minutes = (value: string) => { const d = new Date(value); return d.getHours() * 60 + d.getMinutes(); };
  const rows = events.filter(e => !e.allDay).map(event => ({ event, start: localDay(new Date(event.start)) < day ? 360 : Math.max(360, minutes(event.start)), end: localDay(new Date(event.end)) > day ? 1320 : Math.min(1320, minutes(event.end)), lane: 0, lanes: 1 })).filter(e => e.end > e.start).sort((a, b) => a.start - b.start || a.end - b.end);
  let group: typeof rows = [], ends: number[] = [], groupEnd = -1;
  const finish = () => { group.forEach(row => { row.lanes = ends.length; }); group = []; ends = []; };
  for (const row of rows) {
    if (row.start >= groupEnd) finish();
    let lane = ends.findIndex(end => end <= row.start); if (lane < 0) lane = ends.length;
    ends[lane] = row.end; row.lane = lane; group.push(row); groupEnd = Math.max(groupEnd, row.end);
  }
  finish();
  return rows.map(row => ({ ...row, top: (row.start - 360) / 60 * 48, height: Math.max(20, (row.end - row.start) / 60 * 48) }));
}
