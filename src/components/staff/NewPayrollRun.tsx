import { T } from "../../i18n/T";
import { useState } from 'react';
import type { PayrollRun } from '../../types/staff';
import { payrollConfig } from '../../config/payroll';
import { payrollService } from '../../services/payrollService';
import { localDate } from '../../utils/attendance';
import { errorMessage } from '../../services/toastService';
import { Modal } from '../common/Modal';
import { PayrollReview } from './PayrollReview';
function period(month: string, half: string) {
  const [year, number] = month.split('-').map(Number);
  return { start: `${month}-${half === 'first' ? '01' : '16'}`, end: `${month}-${half === 'first' ? '15' : new Date(Date.UTC(year, number, 0)).getUTCDate()}` };
}
export function NewPayrollRun({ onClose, onSaved }: { onClose: () => void; onSaved: (run: PayrollRun) => void }) {
  const today = localDate(), [month, setMonth] = useState(today.slice(0, 7)), [half, setHalf] = useState(Number(today.slice(8)) <= 15 ? 'first' : 'second');
  const initial = period(month, half);
  const [start, setStart] = useState(initial.start), [end, setEnd] = useState(initial.end), [error, setError] = useState(''), [preview, setPreview] = useState<PayrollRun>();
  return <Modal open title="New payroll run" onClose={onClose}><p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">{payrollConfig.notice}</p>{preview ? <div className="space-y-4"><PayrollReview run={preview} onPreviewChange={setPreview} onSaved={onSaved} /><button className="btn" onClick={() => { setPreview(undefined); setError(''); }}><T text={"Change period"}/></button></div> : <form className="space-y-4" onSubmit={event => { event.preventDefault(); try { setPreview(payrollService.preview(start, end)); setError(''); } catch (cause) { setError(errorMessage(cause)); } }}>
    <label className="block text-sm"><T text={"Period preset"}/><select className="mt-1 w-full" value={half} onChange={event => { const value = event.target.value; setHalf(value); if (value !== 'custom') { const dates = period(month, value); setStart(dates.start); setEnd(dates.end); } }}><option value="first">1–15</option><option value="second">16–end of month</option><option value="custom"><T text={"Custom dates"}/></option></select></label>
    {half !== 'custom' && <label className="block text-sm"><T text={"Month"}/><input className="mt-1 w-full" type="month" required value={month} onChange={event => { if (event.target.value) { setMonth(event.target.value); const dates = period(event.target.value, half); setStart(dates.start); setEnd(dates.end); } }} /></label>}
    <div className="grid grid-cols-2 gap-3"><label className="text-sm"><T text={"Period start"}/><input className="mt-1 w-full" type="date" required value={start} onChange={event => { setHalf('custom'); setStart(event.target.value); }} /></label><label className="text-sm"><T text={"Period end"}/><input className="mt-1 w-full" type="date" required value={end} onChange={event => { setHalf('custom'); setEnd(event.target.value); }} /></label></div>
    <p className="text-xs text-slate-500">Compute a preview from attendance and holidays. No run is saved until you choose Save as Draft.</p>{error && <p role="alert" className="text-red-500">{error}</p>}<button className="btn-primary"><T text={"Compute payroll"}/></button>
  </form>}</Modal>;
}
