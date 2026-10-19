import {useState} from 'react';
import {Link} from 'react-router-dom';
import {Wallet,Users,Zap,Truck,Package,Settings,Fuel,Send,CreditCard} from 'lucide-react';
import {useReportFilters} from '../../hooks/useReportFilters';
import {reportService} from '../../services/reportService';
import {ReportTable} from '../../components/reports/ReportSection';
import {ReportFrame} from '../../components/reports/ReportFrame';
import {ReferencePanel} from '../../components/reports/ReferencePanel';
import {ReferenceChart} from '../../components/reports/ReferenceChart';
import {LedgerSource} from '../../components/accounts/LedgerSource';
import {payrollMoney} from '../../utils/money';
import {fromCentavos} from '../../utils/pos';
import {timeSeries,type Granularity} from '../../utils/reports/timeSeries';
import {localDay,shiftDay} from '../../utils/reports/period';
import {formatDate} from '../../utils/date';
export function Component(){
 const f=useReportFilters(),r=reportService.expense(f),[granularity,setGranularity]=useState<Granularity>('day'),[week,setWeek]=useState('7');
 const expense=timeSeries.bucket(r.entries.map(e=>({date:e.date,amount:e.amount})),granularity,f),income=timeSeries.bucket(r.incomeSeries,granularity,f),weekRange={from:shiftDay(f.to,-Number(week)+1),to:f.to},weekly=timeSeries.bucket(r.entries.map(e=>({date:e.date,amount:e.amount})),'day',weekRange),icons=[Wallet,Users,Zap,Truck,Package,Settings,Fuel,Send,CreditCard];
 const overview=[{label:'Total Expenses',value:r.total},{label:'Manual Expenses',value:r.split.find(s=>s.label==='Manual')?.amount??0},{label:'Paid Salaries',value:r.split.find(s=>s.label==='Salaries')?.amount??0},{label:'Supplier Payments',value:r.split.find(s=>s.label==='Supplier payments')?.amount??0}];
 return <ReportFrame title="Expenses" filter={f} csv={[["Date","Category","Payee","Reference","Amount PHP"],...r.entries.map(e=>[e.date,e.category,e.payee??e.createdBy??'',e.reference??'',fromCentavos(e.amount)])]}>
 <div className="reference-expense-grid"><div className="reference-stack"><ReferencePanel title="Expenses Overview" control={<span className="commerce-muted text-xs">Through {formatDate(f.to)}</span>}><div className="reference-overview">{overview.map(m=><div key={m.label}><p>{m.label}</p><strong>{payrollMoney(m.value)}</strong></div>)}</div></ReferencePanel>
 <ReferencePanel title="Income vs Expense" control={<select aria-label="Income and expense chart interval" value={granularity} onChange={e=>setGranularity(e.target.value as Granularity)}><option value="day">Daily</option><option value="week">Weekly</option><option value="month">Monthly</option></select>}><ReferenceChart kind="comparison" height={365} labels={expense.map(d=>granularity==='month'?new Date(`${d.date}-01T12:00:00`).toLocaleDateString('en-US',{month:'short'}):d.date.slice(5))} series={[{name:'Expense',data:expense.map(d=>d.amount)},{name:'Income',data:income.map(d=>d.amount)}]} summary="Filled expense area with a dashed income comparison line for the selected period"/></ReferencePanel>
 <ReportTable title="Summary" rows={r.entries} rowKey={e=>e.id} columns={[{id:'payee',header:'Payee',cell:e=><LedgerSource entry={e}/>},{id:'category',header:'Category',cell:e=>e.category},{id:'method',header:'Payment Method',cell:e=>e.method??e.sourceType},{id:'date',header:'Date',cell:e=>formatDate(e.date),sortValue:e=>e.date},{id:'amount',header:'Amount',cell:e=>payrollMoney(e.amount),sortValue:e=>e.amount}]} totals={<Link to="/accounts/expenses" className="text-indigo-600">View all expense records →</Link>}/></div>
 <div className="reference-stack"><ReferencePanel title="Week Progress" control={<select aria-label="Weekly expense period" value={week} onChange={e=>setWeek(e.target.value)}><option value="7">7 days</option><option value="11">11 days</option><option value="14">14 days</option></select>}><ReferenceChart kind="weekly" height={240} labels={weekly.map(d=>new Date(`${d.date}T12:00:00`).toLocaleDateString('en-US',{weekday:'short'}))} series={[{name:'Expenses',data:weekly.map(d=>d.amount)}]} summary="Daily expense columns with values above each bar and weekday labels"/></ReferencePanel>
 <ReferencePanel title="Expense Breakdown" control={<span className="commerce-muted text-xs">Selected period</span>}><div className="reference-breakdown">{r.categories.map((c,i)=>{const Icon=icons[i%icons.length];return <div key={c.label}><Icon size={18}/><div><p>{c.label}</p><strong>{payrollMoney(c.amount)}</strong></div></div>;})}</div></ReferencePanel><p className="reference-note">Income excludes wallet liabilities. Expenses include supplier cash payments; the Finance report separates those from operating expenses. Records through {localDay(f.to)}.</p></div></div>
 </ReportFrame>;
}
