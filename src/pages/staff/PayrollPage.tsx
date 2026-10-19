import { T } from "../../i18n/T";
import { useState } from 'react';
import { usePayrollStore } from '../../store/usePayrollStore';
import { payrollConfig } from '../../config/payroll';
import { StaffShell, StaffSummary } from '../../components/staff/StaffShell';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { NewPayrollRun } from '../../components/staff/NewPayrollRun';
import { payrollMoney } from '../../utils/money';
import { PayrollReview } from '../../components/staff/PayrollReview';
export function Component() {
  const runs = usePayrollStore(s => s.runs), [creating, setCreating] = useState(false), [selected, setSelected] = useState(''), [status, setStatus] = useState('');
  const run = runs.find(r => r.id === selected);
  return <StaffShell title="Payroll" actions={<button className="btn-primary" onClick={() => setCreating(true)}><T text={"New payroll run"}/></button>}>
    <p className="mb-5 rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">{payrollConfig.notice}</p>
    <StaffSummary items={[["Payroll runs", runs.length], ["Draft", runs.filter(r => r.status === 'draft').length], ["Finalized", runs.filter(r => r.status === 'finalized').length], ["Paid", runs.filter(r => r.status === 'paid').length]]} />
    <label className="mb-4 block text-sm"><T text={"Status "}/><select className="ml-2" value={status} onChange={event => setStatus(event.target.value)}><option value=""><T text={"All statuses"}/></option>{['draft', 'finalized', 'paid'].map(s => <option key={s}>{s}</option>)}</select></label>
    <section className="panel"><DataTable caption="Payroll runs" rows={runs.filter(r => !status || r.status === status).toSorted((a, b) => b.createdAt.localeCompare(a.createdAt))} rowKey={r => r.id} searchText={r => `${r.runNo} ${r.periodStart} ${r.periodEnd}`} onRowClick={r => setSelected(r.id)} columns={[
      { id: 'number', header: 'Run', cell: r => r.runNo }, { id: 'period', header: 'Period', cell: r => `${r.periodStart} – ${r.periodEnd}` },
      { id: 'status', header: 'Status', cell: r => <StatusBadge>{r.status}</StatusBadge> }, { id: 'staff', header: 'Staff', cell: r => r.lines.length },
      { id: 'total', header: 'Net pay', cell: r => payrollMoney(r.lines.reduce((n, l) => n + l.netPay, 0)) },
    ]} actions={r => <button className="text-indigo-500" onClick={() => setSelected(r.id)}>Review</button>} /></section>
    {creating && <NewPayrollRun onClose={() => setCreating(false)} onSaved={saved => { setCreating(false); setSelected(saved.id); }} />}
    {run && <Modal open title={run.runNo} onClose={() => setSelected('')}><PayrollReview key={run.id} run={run} /></Modal>}
  </StaffShell>;
}
