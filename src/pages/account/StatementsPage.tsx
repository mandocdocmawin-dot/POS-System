import { useState } from 'react';
import {FeaturePage} from '../../components/common/FeaturePage';
import {accountTabs} from '../../config/accountTabs';
import { DataTable } from '../../components/common/DataTable';
import { profileService } from '../../services/profileService';
import { useLocalData } from '../../services/useLocalData';
import { formatMoney } from '../../utils/money';
import { localDay } from '../../utils/calendar';
export function Component() {
  useLocalData(); const user = profileService.get(), [month, setMonth] = useState(localDay(new Date()).slice(0, 7)), data = profileService.statement(user.id, month);
  return <FeaturePage title="My monthly statement" tabs={accountTabs}><section className="report-document space-y-6"><div className="report-controls flex flex-wrap gap-3"><label>Month <input type="month" required value={month} onChange={e => setMonth(e.target.value)} /></label><button className="btn" onClick={() => window.print()}>Print statement</button></div><header><h2 className="text-xl font-semibold">{user.name} · {month}</h2><p>Local demo statement · {user.staffNo}</p></header><dl className="card grid gap-4 sm:grid-cols-4"><div><dt>Orders handled</dt><dd className="text-2xl">{data.orders.length}</dd></div><div><dt>Received sales</dt><dd className="text-2xl">{formatMoney(data.sales)}</dd></div><div><dt>Hours worked</dt><dd className="text-2xl">{data.hours.toFixed(1)}</dd></div><div><dt>Attendance rate</dt><dd className="text-2xl">{data.attendanceRate.toFixed(1)}%</dd></div></dl><DataTable caption="Attendance summary" rows={data.attendance} rowKey={a => a.id} columns={[{ id: 'date', header: 'Date', cell: a => a.date }, { id: 'status', header: 'Status', cell: a => a.status }, { id: 'in', header: 'Clock in', cell: a => a.clockIn ? new Date(a.clockIn).toLocaleTimeString() : '—' }, { id: 'out', header: 'Clock out', cell: a => a.clockOut ? new Date(a.clockOut).toLocaleTimeString() : '—' }]} /><DataTable caption="Finalized payslips" rows={data.payslips} rowKey={p => p.runNo} columns={[{ id: 'run', header: 'Run', cell: p => p.runNo }, { id: 'gross', header: 'Gross', cell: p => formatMoney(p.grossPay) }, { id: 'net', header: 'Net', cell: p => formatMoney(p.netPay) }]} /></section></FeaturePage>;
}
