import { Link } from 'react-router-dom';
import type { CalendarDisplayItem } from '../../services/calendarViewService';
export function Agenda({ days, byDay, open }: { days: { date: string; weekday: string }[]; byDay: (day: string) => CalendarDisplayItem[]; open: (item: CalendarDisplayItem) => void }) {
  return <div className="space-y-4">{days.map(day => <section className="card space-y-3" key={day.date}><h3 className="font-semibold">{day.weekday} · {day.date}</h3>{byDay(day.date).map(e => <div key={e.id} className="flex flex-wrap items-center gap-3 border-t pt-3 dark:border-slate-700"><time className="text-xs">{e.allDay ? 'All day' : new Date(e.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>{e.link ? <Link className="underline" to={e.link}>{e.title} ↗</Link> : <button className="text-left underline" onClick={() => open(e)}>{e.title}</button>}</div>)}{!byDay(day.date).length && <p className="text-sm">No events.</p>}</section>)}</div>;
}
