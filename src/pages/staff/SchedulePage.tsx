import { T } from "../../i18n/T";
import {useSettings} from '../../hooks/useSettings';
import {formatDate as displayDate} from '../../utils/date';
import { useState } from 'react';
import type { Shift } from '../../types/staff';
import { useStaffStore } from '../../store/useStaffStore';
import { useShiftStore } from '../../store/useShiftStore';
import { useHolidayStore } from '../../store/useHolidayStore';
import { useAttendanceStore } from '../../store/useAttendanceStore';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { usePermission } from '../../hooks/usePermission';
import { localDate, timeMinutes } from '../../utils/attendance';
import { addDays, weekStart } from '../../utils/schedule';
import { scheduleService } from '../../services/scheduleService';
import { toast } from '../../services/toastService';
import { StaffShell, StaffSummary } from '../../components/staff/StaffShell';
import { ShiftEditor } from '../../components/staff/ShiftEditor';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export function Component() {
  const user = useCurrentUser();
  const { can } = usePermission();
  const manage = can('schedule:manage');
  const staff = useStaffStore(s => s.staff);
  const shifts = useShiftStore(s => s.shifts);
  const holidays = useHolidayStore(s => s.holidays);
  const records = useAttendanceStore(s => s.records);
  const weekStartsOn=useSettings(s=>s.general.weekStartsOn);
  const [start, setStart] = useState(() => weekStart(localDate(),weekStartsOn));
  const [editing, setEditing] = useState<Shift>();
  const [confirmation, setConfirmation] = useState<'copy' | 'clear'>();
  const dates = Array.from({ length: 7 }, (_, index) => addDays(start, index));
  const end = dates[6];
  const visibleShifts = shifts.filter(s => s.date >= start && s.date <= end && (manage || s.staffId === user?.id));
  const people = staff.filter(s => manage ? s.status === 'active' || visibleShifts.some(shift => shift.staffId === s.id) : s.id === user?.id);
  const hours = visibleShifts.reduce((total, shift) => total + (timeMinutes(shift.endTime) - timeMinutes(shift.startTime)) / 60, 0);

  function add(staffId: string, date: string) {
    if (!manage) return;
    setEditing({ id: crypto.randomUUID(), staffId, date, startTime: '08:00', endTime: '16:00',
      branchId: staff.find(s => s.id === staffId)?.branchIds[0] ?? 'Main Branch', note: '' });
  }

  return (
    <StaffShell title="Staff schedule" actions={<button type="button" className="btn" onClick={() => window.print()}><T text={"Print schedule"}/></button>}>
      <div className="mb-5 flex flex-wrap items-end gap-3">
        <button type="button" className="btn" onClick={() => setStart(addDays(start, -7))}><T text={"Previous week"}/></button>
        <button type="button" className="btn" onClick={() => setStart(weekStart(localDate(),weekStartsOn))}><T text={"This week"}/></button>
        <button type="button" className="btn" onClick={() => setStart(addDays(start, 7))}><T text={"Next week"}/></button>
        <label className="text-xs">Week containing
          <input className="mt-1 block" type="date" value={start} onChange={event => {
            if (/^\d{4}-\d{2}-\d{2}$/.test(event.target.value)) setStart(weekStart(event.target.value,weekStartsOn));
          }} />
        </label>
        {manage && <>
          <button type="button" className="btn" onClick={() => setConfirmation('copy')}><T text={"Copy previous week"}/></button>
          <button type="button" className="btn text-red-500" disabled={!visibleShifts.length} onClick={() => setConfirmation('clear')}><T text={"Clear week"}/></button>
        </>}
      </div>
      <StaffSummary items={[
        ['Staff scheduled', new Set(visibleShifts.map(s => s.staffId)).size],
        ['Shifts', visibleShifts.length],
        ['Scheduled hours', hours.toFixed(2)],
        ['Holidays this week', holidays.filter(h => h.date >= start && h.date <= end).length],
      ]} />
      <section id="staff-schedule" className="panel p-4">
        <div className="mb-4">
          <h2 aria-live="polite" className="text-lg font-semibold">TindaPOS · {start} – {end}</h2>
          <p className="mt-1 text-sm text-slate-500">{manage ? 'Select a day to add a shift, or select a shift to edit it.' : 'Your schedule · read only'}</p>
        </div>
        <div className="schedule-scroll overflow-x-auto">
          <table className="w-full min-w-[1000px] table-fixed border-collapse text-sm">
            <caption className="sr-only"><T text={"Weekly staff schedule from "}/>{start} through {end}. Shift times use Philippine local time.</caption>
            <thead>
              <tr>
                <th scope="col" className="w-44 border border-slate-200 p-3 text-left align-top dark:border-slate-700"><T text={"Staff"}/></th>
                {dates.map(date => <th key={date} scope="col" className={`border border-slate-200 p-3 text-left align-top dark:border-slate-700 ${date === localDate() ? 'bg-indigo-50 dark:bg-indigo-950/40' : ''}`}>
                  <span className="block font-semibold">{displayDate(new Date(date + 'T12:00:00Z'))}</span>
                  {holidays.filter(h => h.date === date).map(h => <span className="mt-2 block rounded bg-amber-100 px-2 py-1 text-xs font-normal text-amber-900" key={h.id}>{h.name}</span>)}
                </th>)}
              </tr>
            </thead>
            <tbody>
              {people.map(person => <tr key={person.id}>
                <th scope="row" className="border border-slate-200 p-3 text-left align-top dark:border-slate-700">
                  <span className="block font-semibold">{person.name}</span>
                  <span className="mt-1 block text-xs font-normal text-slate-500">{person.staffNo}{person.status === 'inactive' ? ' · Inactive' : ''}</span>
                </th>
                {dates.map(date => {
                  const dayShifts = visibleShifts.filter(s => s.staffId === person.id && s.date === date).toSorted((a, b) => a.startTime.localeCompare(b.startTime));
                  const leave = records.find(r => r.staffId === person.id && r.date === date && r.status === 'leave');
                  return <td key={date} className="h-28 border border-slate-200 p-2 align-top dark:border-slate-700" onClick={event => {
                    if (event.target === event.currentTarget) add(person.id, date);
                  }}>
                    {leave && <p className="mb-2 rounded bg-violet-100 px-2 py-1 text-xs text-violet-900" title={leave.note}><T text={"On leave"}/></p>}
                    {dayShifts.map(shift => {
                      const content = <><strong className="block text-xs tabular-nums">{shift.startTime}–{shift.endTime}</strong><span className="mt-1 block text-xs">{shift.branchId}</span>{shift.note && <span className="mt-1 block break-words text-xs opacity-75">{shift.note}</span>}</>;
                      const className = 'mb-2 block w-full rounded-lg bg-indigo-50 p-2 text-left text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200';
                      return manage ? <button type="button" key={shift.id} className={className} aria-label={`Edit ${person.name}, ${date}, ${shift.startTime} to ${shift.endTime}`} onClick={() => setEditing(shift)}>{content}</button> : <div className={className} key={shift.id}>{content}</div>;
                    })}
                    {manage ? <button type="button" className="schedule-add w-full rounded border border-dashed border-slate-300 px-2 py-2 text-xs text-slate-500 hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-600 dark:hover:text-indigo-300" aria-label={`Add shift for ${person.name} on ${date}`} onClick={() => add(person.id, date)}>+ Add shift</button> : !dayShifts.length && <p className="p-2 text-xs text-slate-400"><T text={"No shift scheduled"}/></p>}
                  </td>;
                })}
              </tr>)}
              {!people.length && <tr><td colSpan={8} className="p-8 text-center text-slate-500">No staff to display for this week.</td></tr>}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-slate-500">All times are Philippine local time. Amber marks holidays; violet marks leave. Same-day shifts only.</p>
      </section>
      {editing && manage && <ShiftEditor key={editing.id} shift={editing} onClose={() => setEditing(undefined)} />}
      <ConfirmDialog open={!!confirmation && manage} title={confirmation === 'copy' ? 'Copy previous week?' : 'Clear this week?'} message={confirmation === 'copy'
        ? `Copy shifts from ${addDays(start, -7)}–${addDays(start, -1)} into ${start}–${end}. Existing shifts stay; overlaps block the whole operation.`
        : `Remove all ${visibleShifts.length} scheduled shifts from ${start}–${end}. Attendance history will be retained.`} onClose={() => setConfirmation(undefined)} onConfirm={() => {
          if (confirmation === 'copy') {
            const count = scheduleService.copyPreviousWeek(start);
            toast.success(count ? `Copied ${count} shifts` : 'No shifts in the previous week to copy');
          } else {
            scheduleService.clearWeek(start);
            toast.success('Weekly schedule cleared');
          }
        }} />
    </StaffShell>
  );
}
