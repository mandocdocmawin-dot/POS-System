import { useState } from 'react';
import { Crown } from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';
import { useLocalData } from '../../services/useLocalData';
import { formatPHP } from '../../utils/money';
import { CardHeading } from '../common/CardHeading';
export function StaffPerformanceCard() {
  useLocalData();
  const [period, setPeriod] = useState<'today' | 'week'>('today'), data = dashboardService.getStaff(period), top = data.ranked[0];
  return <section className="card xl:col-span-3"><CardHeading title="Staff Performance"><select aria-label="Staff performance period" className="max-w-24 text-xs" value={period} onChange={e => setPeriod(e.target.value === 'week' ? 'week' : 'today')}><option value="today">Today</option><option value="week">This week</option></select></CardHeading>
    {top ? <div className="my-5 text-center"><div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-lg font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200">{top.name.split(' ').slice(0, 2).map(n => n[0]).join('')}<Crown className="absolute -right-1 top-0 rounded-full bg-amber-100 p-1 text-amber-700" size={24}/></div><h3 className="mt-3 text-sm font-semibold">{top.name}</h3><p className="mt-1 text-xs text-slate-500">Top performer · {formatPHP(top.sales)} net sales</p></div> : <p className="py-10 text-center text-sm text-slate-500">No sales recorded {period === 'today' ? 'today' : 'this week'}.</p>}
    <div className="grid grid-cols-3 gap-2">{[['Orders', String(data.totalOrders)], ['Net sales', formatPHP(data.totalSales)], ['Cashiers', String(data.ranked.length)]].map(([label, value]) => <div key={label} className="rounded-lg bg-slate-50 p-2 text-center dark:bg-slate-800"><p className="break-words text-xs font-semibold">{value}</p><p className="mt-1 text-xs text-slate-400">{label}</p></div>)}</div><p className="mt-3 text-center text-xs text-slate-400">Current branch · refunds deducted</p>
  </section>;
}
