import { T } from "../../i18n/T";
import { Link } from 'react-router-dom';
import { calendarViewService } from '../../services/calendarViewService';
import { layoutTimedEvents } from '../../utils/calendarLayout';
export function Timeline({ date, branch }: { date: string; branch: string }) {
  const rows = calendarViewService.timeline(date, branch);
  return <section className="panel overflow-x-auto"><div className="min-w-[60rem]"><div className="grid grid-cols-[10rem_1fr] border-b p-3"><span><T text={"Staff"}/></span><div className="flex justify-between text-xs">{Array.from({ length: 17 }, (_, i) => <span key={i}>{String(i + 6).padStart(2, '0')}:00</span>)}</div></div>{rows.map(row => <div className="grid grid-cols-[10rem_1fr] border-b p-3 dark:border-slate-700" key={row.staff.id}><strong>{row.staff.name}</strong><div className="relative h-16">{layoutTimedEvents(row.events, date).map(({ event, start, end, lane, lanes }) => <div className="absolute truncate rounded bg-indigo-100 p-1 text-xs text-indigo-950 dark:bg-indigo-950 dark:text-indigo-100" style={{ left: `${(start - 360) / 960 * 100}%`, width: `${(end - start) / 960 * 100}%`, top: lane / lanes * 40, height: 24 }} key={event.id}>{event.link ? <Link to={event.link}>{event.title}</Link> : <span>{event.title}</span>}</div>)}</div></div>)}</div><p className="p-3 text-xs">Read-only staff timeline. Use source links or another calendar view to edit.</p></section>;
}
