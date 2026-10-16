import type { PayrollLine, PayrollRun } from '../../types/staff';
import { payrollConfig } from '../../config/payroll';
import { useStaffStore } from '../../store/useStaffStore';
import { usePermission } from '../../hooks/usePermission';
import { Modal } from '../common/Modal';
import { payrollMoney } from '../../utils/money';
export function Payslip({ run, line, onClose }: { run: PayrollRun; line: PayrollLine; onClose: () => void }) {
  const person = useStaffStore(s => s.staff.find(p => p.id === line.staffId)), { can } = usePermission();
  if (!can('payroll:view')) return null;
  const earnings = [...(line.earnings ?? [{ label: 'Computed regular, overtime and holiday pay', amount: line.grossPay }]), ...line.additions];
  return <Modal open title={`Payslip · ${person?.name ?? line.staffId}`} onClose={onClose}>
    <article id="staff-payslip" className="space-y-5 bg-white p-4 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <header className="border-b border-slate-200 pb-4"><p className="text-xl font-bold">TindaPOS</p><h2 className="mt-1 text-lg font-semibold">{run.status === 'draft' ? 'DRAFT PAYSLIP' : 'PAYSLIP'}</h2><p className="mt-2 text-sm">{run.runNo} · {run.status}</p><p className="text-sm">Pay period: {run.periodStart} – {run.periodEnd}</p></header>
      <dl className="grid grid-cols-2 gap-3 text-sm">{Object.entries({ Staff: person?.name ?? line.staffId, 'Employee no.': person?.staffNo ?? line.staffId, 'Pay type': line.payType, 'Hourly rate (snapshot)': payrollMoney(line.hourlyRate), ...(line.payType === 'monthly' ? { 'Monthly rate (snapshot)': payrollMoney(line.monthlyRate ?? 0) } : {}) }).map(([label, value]) => <div key={label}><dt className="text-slate-500">{label}</dt><dd className="font-medium">{value}</dd></div>)}</dl>
      <table className="w-full text-sm"><caption className="mb-2 text-left font-semibold">Attendance snapshot</caption><thead><tr>{['Regular hours', 'Overtime hours', 'Holiday hours', 'Late minutes'].map(label => <th className="border-b p-2 text-left text-xs" key={label}>{label}</th>)}</tr></thead><tbody><tr>{[line.regularHours.toFixed(2), line.overtimeHours.toFixed(2), line.holidayHours.toFixed(2), line.lateMinutes].map((value, index) => <td key={index} className="p-2">{value}</td>)}</tr></tbody></table>
      <table className="w-full text-sm"><caption className="mb-2 text-left font-semibold">Earnings breakdown</caption><thead><tr><th className="border-b py-2 text-left">Description</th><th className="border-b py-2 text-right">Amount (PHP)</th></tr></thead><tbody>{earnings.map((entry, index) => <tr key={index}><td className="py-2">{entry.label}</td><td className="py-2 text-right tabular-nums">{payrollMoney(entry.amount)}</td></tr>)}</tbody></table>
      <table className="w-full text-sm"><caption className="mb-2 text-left font-semibold">Deductions</caption><thead><tr><th className="border-b py-2 text-left">Description</th><th className="border-b py-2 text-right">Amount (PHP)</th></tr></thead><tbody>{line.deductions.length ? line.deductions.map((entry, index) => <tr key={index}><td className="py-2">{entry.label}</td><td className="py-2 text-right tabular-nums">{payrollMoney(entry.amount)}</td></tr>) : <tr><td className="py-2">No deductions</td><td className="py-2 text-right">{payrollMoney(0)}</td></tr>}</tbody></table>
      <p className="flex items-center justify-between border-y border-slate-300 py-4 text-xl font-bold"><span>Net pay</span><span>{payrollMoney(line.netPay)}</span></p>
      <footer className="text-xs leading-5 text-slate-500"><p>{payrollConfig.notice}</p><p>Computed gross includes the regular, overtime and holiday rules for this period. Rates and totals use saved payroll snapshots. Paid status is a demo record only.</p>{run.status === 'draft' && <p>This draft may change before finalization.</p>}</footer>
    </article>
    <div className="payslip-actions mt-5 flex justify-end gap-3"><button className="btn-primary" onClick={() => window.print()}>Print payslip</button><button className="btn" onClick={onClose}>Close</button></div>
  </Modal>;
}
