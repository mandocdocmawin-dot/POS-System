import { useTranslation } from '../../i18n/useTranslation';
import { T } from "../../i18n/T";
import { lazy, Suspense, useState, useSyncExternalStore } from 'react';
import type { ApexOptions } from 'apexcharts';
import { reportService } from '../../services/reportService';
import { useLocalData } from '../../services/useLocalData';
import { presetRange } from '../../utils/reports/period';
import { fromCentavos } from '../../utils/pos';
import { darkTheme, subscribeTheme } from '../../components/charts/theme';
const ApexChart = lazy(() => import('react-apexcharts'));
const navy = '#06396a', orange = '#ff762b';
const number = (n: number) => n.toLocaleString('en-PH', { maximumFractionDigits: 0 });
function label(date: string) {
  return new Date(`${date.length === 7 ? date + '-01' : date}T12:00:00`).toLocaleDateString('en', { month: 'short', ...(date.length === 7 ? {} : { day: 'numeric' }) });
}
export function DashboardChart({ kind }: { kind: 'sales' | 'profit' | 'orders' | 'inventory' | 'payments' }) {
  useLocalData();
  const { t } = useTranslation();
  const dark = useSyncExternalStore(subscribeTheme, darkTheme, () => false);
  const [selection, setSelection] = useState(kind === 'sales' || kind === 'payments' ? '30d' : 'year');
  const range = { ...presetRange(selection), branchId: reportService.activeBranch(), compare: false };
  const granularity = selection === 'year' ? 'month' : selection === '30d' ? 'week' : 'day';
  const data = reportService.dashboard(range, granularity), sales = data.sales;
  const orders = reportService.dashboardOrders(range, granularity);
  const labels = (kind === 'inventory' ? data.inventory.in : kind === 'profit' ? data.monthly : sales.series).map(d => label(d.date));
  const orderChanges = orders.map((d, i) => d.amount - (orders[i - 1]?.amount ?? 0));
  const series = kind === 'sales' ? [{ name: 'Total Sales', data: sales.series.map(d => fromCentavos(d.amount)) }, { name: 'Total Orders', data: orders.map(d => d.amount) }]
    : kind === 'inventory' ? [{ name: 'Stock In', data: data.inventory.in.map(d => d.amount) }, { name: 'Stock Out', data: data.inventory.out.map(d => d.amount) }]
    : [{ name: 'Order change', data: orderChanges }];
  const options: ApexOptions = {
    chart: { background: 'transparent', foreColor: dark ? '#b8c3d1' : '#06396a', fontFamily: 'inherit', toolbar: { show: false }, animations: { enabled: false } },
    theme: { mode: dark ? 'dark' : 'light' }, colors: kind === 'inventory' ? [orange, dark ? '#76a9d4' : navy] : [dark ? '#76a9d4' : navy, orange],
    xaxis: { categories: kind === 'orders' ? orders.map(d => label(d.date)) : labels, labels: { style: { fontSize: '10px' }, rotate: 0, hideOverlappingLabels: true }, axisBorder: { color: dark ? '#334155' : '#ececee' }, axisTicks: { show: false } },
    yaxis: kind === 'sales' ? [{ seriesName: t('Total Sales'), title: { text: t('Sales (₱)'), style: { fontSize: '10px', fontWeight: 400 } }, labels: { formatter: number, style: { fontSize: '10px' } } }, { seriesName: t('Total Orders'), opposite: true, title: { text: t('Orders'), style: { fontSize: '10px', fontWeight: 400 } }, decimalsInFloat: 0, labels: { formatter: number, style: { fontSize: '10px' } } }] : { labels: { formatter: number, style: { fontSize: '10px' } } },
    grid: { borderColor: dark ? '#334155' : '#ececee', strokeDashArray: kind === 'inventory' ? 0 : 4, padding: { left: 4, right: 8, top: 5, bottom: 0 }, xaxis: { lines: { show: kind === 'inventory' } } },
    plotOptions: { bar: { columnWidth: '40%', borderRadius: 3, colors: kind === 'orders' ? { ranges: [{ from: -Infinity, to: -0.01, color: navy }, { from: 0, to: Infinity, color: orange }] } : undefined } },
    stroke: { width: kind === 'inventory' ? 3 : 0, curve: 'smooth' }, dataLabels: { enabled: false }, legend: { show: false },
    tooltip: { theme: dark ? 'dark' : 'light' }, markers: { size: 0 }, noData: { text: 'No activity in this period' },
  };
  if (kind === 'payments') {
    const allPayments = sales.payments, payments = allPayments.slice(0, 2), total = allPayments.reduce((n, p) => n + p.amount, 0), colors = ['#6861ee', '#ed54c5'];
    return <div className="dashboard-payment-chart"><svg viewBox="0 0 220 220" role="img" aria-label={payments.map(p => `${p.label}: ${total ? Math.round(p.amount / total * 100) : 0}%`).join(', ') || 'No payments received'}>{payments.map((p, i) => <g key={p.label}><circle cx="110" cy="110" r={90 - i * 15} fill="none" stroke={dark ? '#334155' : '#f2f3f6'} strokeWidth="10"/><circle cx="110" cy="110" r={90 - i * 15} fill="none" stroke={colors[i % colors.length]} strokeWidth="10" strokeLinecap="round" pathLength="100" strokeDasharray={`${total ? p.amount / total * 100 : 0} 100`} transform="rotate(-90 110 110)"><title>{p.label}: {total ? Math.round(p.amount / total * 100) : 0}%</title></circle></g>)}</svg>{!total && <p className="dashboard-muted"><T text={"No payments received"}/></p>}</div>;
  }
  const selector = <select className="dashboard-chart-select" aria-label={`${kind} period`} value={selection} onChange={e => setSelection(e.target.value)}><option value="30d"><T text={"Recent"}/></option><option value="7d"><T text={"This week"}/></option><option value="month"><T text={"Monthly"}/></option><option value="year"><T text={"Yearly"}/></option></select>;
  if (kind === 'profit') {
    const monthly = data.monthly, max = Math.max(1, ...monthly.flatMap(d => [Math.abs(fromCentavos(d.revenue)), Math.abs(fromCentavos(d.netProfit))]));
    const min = Math.min(0, ...monthly.map(d => fromCentavos(d.netProfit))), top = max * 1.1, bottom = min < 0 ? min * 1.1 : 0;
    const y = (v: number) => 270 - (v - bottom) / (top - bottom) * 230;
    return <div className="dashboard-chart dashboard-dumbbell">{selector}<figure aria-label="Monthly profit versus sales"><svg viewBox="0 0 650 310" role="img"><title><T text={"Monthly net profit and sales in pesos"}/></title>{Array.from({ length: 5 }, (_, i) => { const value = bottom + (top - bottom) * i / 4; return <g key={i}><text x="45" y={y(value) + 4} textAnchor="end">{number(value)}</text></g>; })}{monthly.map((d, i) => { const x = 72 + i * 540 / Math.max(1, monthly.length - 1), revenue = fromCentavos(d.revenue), profit = fromCentavos(d.netProfit); return <g key={d.date}><title>{label(d.date)}: Sales ₱{number(revenue)}, Profit ₱{number(profit)}</title><line x1={x} x2={x} y1="40" y2="270" className="dashboard-plot-grid"/><line x1={x} x2={x} y1={y(profit)} y2={y(revenue)} stroke={navy} strokeWidth="3"/><circle cx={x} cy={y(profit)} r="4.5" fill={navy}/><circle cx={x} cy={y(revenue)} r="4.5" fill={orange}/><text x={x} y="295" textAnchor="middle">{label(d.date)}</text></g>; })}</svg><figcaption className="sr-only"><T text={"Navy marks profit; orange marks sales. Values in pesos."}/></figcaption></figure></div>;
  }
  return <div className={`dashboard-chart dashboard-chart-${kind}`}>{selector}<div className="dashboard-chart-legend">{kind === 'sales' ? <><span><i style={{ background: navy }}/><T text={"Total Sales"}/></span><span><i style={{ background: orange }}/><T text={"Total Orders"}/></span></> : kind === 'inventory' ? <><span><i style={{ background: orange }}/><T text={"Stock In"}/></span><span><i style={{ background: navy }}/><T text={"Stock Out"}/></span></> : <span className="dashboard-muted"><T text={"Change in orders from previous period"}/></span>}</div><figure aria-label={kind === 'orders' ? 'Change in order count by period' : kind === 'inventory' ? 'Monthly stock received and removed' : 'Net cash sales and order count'}><Suspense fallback={<div className="dashboard-chart-loading" role="status"><T text={"Loading chart…"}/></div>}><ApexChart type={kind === 'inventory' ? 'line' : 'bar'} height={kind === 'inventory' ? 245 : 300} width="100%" options={options} series={series.map(s=>({...s,name:t(s.name)}))}/></Suspense></figure></div>;
}
