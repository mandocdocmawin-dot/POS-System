import type { ReactNode } from 'react';
import type { PayrollLine } from '../../types/staff';
import { useStaffStore } from '../../store/useStaffStore';
import { formatPHP } from '../../utils/money';
import { DataTable } from '../common/DataTable';
export const payrollMoney = (cents: number) => formatPHP(cents / 100);
export function PayrollLines({ lines, actions }: { lines: PayrollLine[]; actions?: (line: PayrollLine) => ReactNode }) {
  const staff = useStaffStore(s => s.staff);
  return <DataTable caption="Payroll lines" rows={lines} rowKey={l => l.staffId} searchText={l => staff.find(s => s.id === l.staffId)?.name ?? l.staffId} columns={[
    { id: 'staff', header: 'Staff', cell: l => staff.find(s => s.id === l.staffId)?.name ?? l.staffId },
    { id: 'regular', header: 'Regular hours', cell: l => l.regularHours.toFixed(2) },
    { id: 'overtime', header: 'Overtime', cell: l => l.overtimeHours.toFixed(2) },
    { id: 'holiday', header: 'Holiday hours', cell: l => l.holidayHours.toFixed(2) },
    { id: 'late', header: 'Late minutes', cell: l => l.lateMinutes },
    { id: 'gross', header: 'Gross pay', cell: l => payrollMoney(l.grossPay) },
    { id: 'add', header: 'Additions', cell: l => payrollMoney(l.additions.reduce((n, a) => n + a.amount, 0)) },
    { id: 'deduct', header: 'Deductions', cell: l => payrollMoney(l.deductions.reduce((n, a) => n + a.amount, 0)) },
    { id: 'net', header: 'Net pay', cell: l => <strong>{payrollMoney(l.netPay)}</strong> },
  ]} actions={actions} />;
}
