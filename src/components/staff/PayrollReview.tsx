import { Payslip } from './Payslip';
import { useState } from 'react';
import type { PayrollRun } from '../../types/staff';
import { payrollService } from '../../services/payrollService';
import { useActivityStore } from '../../store/useActivityStore';
import { toast, errorMessage } from '../../services/toastService';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Timeline } from '../common/Timeline';
import { StatusBadge } from '../common/StatusBadge';
import { PayrollLines, payrollMoney } from './PayrollLines';
import { PayrollAdjustment } from './PayrollAdjustment';
export function PayrollReview({ run, onPreviewChange, onSaved }: { run: PayrollRun; onPreviewChange?: (run: PayrollRun) => void; onSaved?: (run: PayrollRun) => void }) {
  const [payslip, setPayslip] = useState('');
  const [editing, setEditing] = useState(''), [transition, setTransition] = useState<'finalized' | 'paid'>(), [error, setError] = useState('');
  const logs = useActivityStore(s => s.logs), line = run.lines.find(l => l.staffId === editing), preview = !!onPreviewChange;
  const totals = { Gross: run.lines.reduce((n, l) => n + l.grossPay, 0), Additions: run.lines.reduce((n, l) => n + l.additions.reduce((sum, a) => sum + a.amount, 0), 0), Deductions: run.lines.reduce((n, l) => n + l.deductions.reduce((sum, a) => sum + a.amount, 0), 0), 'Net pay': run.lines.reduce((n, l) => n + l.netPay, 0) };
  return <div className="space-y-5"><div className="flex flex-wrap items-center gap-3"><strong>{run.periodStart} – {run.periodEnd}</strong><StatusBadge>{preview ? 'Preview' : run.status}</StatusBadge></div>
    <div className="grid grid-cols-2 gap-3">{Object.entries(totals).map(([label, value]) => <div key={label} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 font-semibold">{payrollMoney(value)}</p></div>)}</div>
    <PayrollLines lines={run.lines} actions={line => <div className="flex gap-3">{run.status === 'draft' && <button className="text-indigo-500" onClick={() => setEditing(line.staffId)}>Adjust</button>}<button className="text-indigo-500" onClick={() => setPayslip(line.staffId)}>Payslip</button></div>} />
    {run.status !== 'draft' && <p className="text-sm text-slate-500">Finalized payroll is locked. Rates and computed amounts are saved snapshots.</p>}
    {error && <p role="alert" className="text-red-500">{error}</p>}
    <div className="flex flex-wrap gap-3">{preview ? <button className="btn-primary" onClick={() => { try { const saved = payrollService.saveDraft(run); toast.success('Payroll draft saved'); onSaved?.(saved); } catch (cause) { setError(errorMessage(cause)); } }}>Save as Draft</button> : run.status === 'draft' ? <button className="btn-primary" onClick={() => setTransition('finalized')}>Finalize payroll</button> : run.status === 'finalized' ? <button className="btn-primary" onClick={() => setTransition('paid')}>Mark as paid</button> : null}</div>
    {!preview && <section><h3 className="mb-3 font-semibold">Activity</h3><Timeline items={logs.filter(l => l.entityId === run.id).map(l => ({ ...l, description: `${l.actor}: ${l.description}` }))} /></section>}
    {line && run.status === 'draft' && <PayrollAdjustment key={line.staffId} line={line} onClose={() => setEditing('')} onSave={(additions, deductions) => { if (onPreviewChange) onPreviewChange(payrollService.adjustPreview(run, line.staffId, additions, deductions)); else payrollService.adjust(run.id, line.staffId, additions, deductions); toast.success('Adjustments applied'); }} />}
    {run.lines.find(l => l.staffId === payslip) && <Payslip run={run} line={run.lines.find(l => l.staffId === payslip)!} onClose={() => setPayslip('')} />}
    <ConfirmDialog open={!!transition} title={transition === 'finalized' ? 'Finalize payroll?' : 'Mark payroll as paid?'} message={transition === 'finalized' ? `${run.runNo}: ${payrollMoney(totals['Net pay'])} net pay. Finalization locks every line and adjustment.` : 'This only records a paid status and activity entry. No money is transferred and no accounting entry is created.'} onClose={() => setTransition(undefined)} onConfirm={() => { if (transition) { payrollService.transition(run.id, transition); toast.success(transition === 'paid' ? 'Payroll marked as paid' : 'Payroll finalized'); } }} />
  </div>;
}
