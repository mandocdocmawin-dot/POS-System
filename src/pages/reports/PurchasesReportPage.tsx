import { T } from "../../i18n/T";
import {useState} from 'react';
import {Link} from 'react-router-dom';
import {useReportFilters} from '../../hooks/useReportFilters';
import {reportService} from '../../services/reportService';
import {purchaseService} from '../../services/purchaseService';
import {productService} from '../../services/productService';
import {categoryService} from '../../services/catalogService';
import {ReportFrame} from '../../components/reports/ReportFrame';
import {ReportTable} from '../../components/reports/ReportSection';
import {ReferencePanel} from '../../components/reports/ReferencePanel';
import {ReferenceChart} from '../../components/reports/ReferenceChart';
import {SupplierIdentity} from '../../components/suppliers/SupplierIdentity';
import {StatusBadge} from '../../components/common/StatusBadge';
import {payrollMoney,formatPHP} from '../../utils/money';
import {toCentavos} from '../../utils/pos';
import {timeSeries,type Granularity} from '../../utils/reports/timeSeries';
import {inRange,localDay} from '../../utils/reports/period';
import {formatDate} from '../../utils/date';
export function Component(){
 const f=useReportFilters(),r=reportService.purchases(f),[interval,setInterval]=useState<Granularity>('month');
 const start=new Date(`${f.to}T12:00:00`);start.setMonth(start.getMonth()-8);start.setDate(1);const chartRange={...f,from:localDay(start)},chart=reportService.purchases(chartRange),returns=purchaseService.returns().filter(ret=>chart.rows.some(p=>p.id===ret.purchaseId)&&inRange(ret.createdAt,chartRange));
 const purchased=timeSeries.bucket(chart.rows.map(p=>({date:p.date,amount:toCentavos(p.grandTotal)})),interval,chartRange),returned=timeSeries.bucket(returns.map(ret=>({date:ret.createdAt,amount:toCentavos(ret.creditAmount)})),interval,chartRange);
 const categories=new Map<string,{received:number;pending:number;returned:number}>();
 for(const p of r.rows)for(const l of p.items){const category=categoryService.list().find(c=>c.id===productService.get(l.productId)?.categoryId)?.name??'Uncategorized',value=categories.get(category)??{received:0,pending:0,returned:0};value.received+=l.receivedQty;value.pending+=Math.max(0,l.orderedQty-l.receivedQty);value.returned+=purchaseService.returns(p.id).flatMap(ret=>ret.items).filter(ret=>ret.purchaseLineId===l.id).reduce((n,ret)=>n+ret.quantity,0);categories.set(category,value);}
 const distribution=[...categories].slice(0,8),paid=r.rows.filter(p=>p.paymentStatus==='paid').length,partial=r.rows.filter(p=>p.paymentStatus==='partial').length,unpaid=r.rows.filter(p=>p.paymentStatus==='unpaid').length,rate=r.rows.length?Math.round(paid/r.rows.length*100):0;
 const top=[...r.suppliers].sort((a,b)=>b.amount-a.amount).slice(0,5);
 const intervalControl=<select aria-label="Purchase chart interval" value={interval} onChange={e=>setInterval(e.target.value as Granularity)}><option value="month"><T text={"Monthly"}/></option><option value="week"><T text={"Weekly"}/></option></select>;
 return <ReportFrame title="Purchases" filter={f} csv={[["Purchase","Supplier","Date","Total PHP","Paid PHP","Balance PHP","Status"],...r.rows.map(p=>[p.purchaseNo,p.supplier,p.date,p.grandTotal,p.amountPaid,p.balanceDue,p.paymentStatus])]}>
 <div className="reference-purchase-top"><ReferencePanel title="Purchase Overview"><div className="reference-semicircle"><ReferenceChart kind="semicircle" height={185} labels={['Paid Orders','Partial Orders','Unpaid Orders']} series={[{name:'Orders',data:[paid,partial,unpaid]}]} count summary="Semicircle showing paid, partially paid, and unpaid purchase orders"/><div className="reference-semicircle-legend">{[paid,partial,unpaid].map((value,i)=><p key={i}><i style={{background:['#6366f1','#334e78','#14b8a6'][i]}}/><strong>{r.rows.length?Math.round(value/r.rows.length*100):0}%</strong><span>{['Paid Orders','Partial Orders','Unpaid Orders'][i]}</span></p>)}</div></div></ReferencePanel>
 <ReferencePanel title="Purchase Growth" control={<span className="commerce-muted text-xs"><T text={"Last 9 months"}/></span>}><strong className="text-2xl font-semibold">{payrollMoney(chart.total)}</strong><ReferenceChart kind="sparkline" height={140} labels={purchased.map(d=>d.date)} series={[{name:'Purchases',data:purchased.map(d=>d.amount)}]} summary="Smooth purchase value trend for the last nine months"/></ReferencePanel>
 <ReferencePanel title="Paid Purchase Rate"><div className="reference-rate"><p>Purchase orders fully settled after recorded payments and supplier credits.</p><strong>{rate}%</strong><div className="reference-rate-bar">{[paid,partial,unpaid].map((v,i)=><span key={i} style={{flex:v,background:['#6366f1','#334e78','#14b8a6'][i]}}/>)}</div><p>Paid · Partial · Unpaid</p></div></ReferencePanel></div>
 <div className="reference-purchase-charts"><ReferencePanel title="Purchase Chart" control={intervalControl}><ReferenceChart kind="grouped" height={335} labels={purchased.map(d=>interval==='month'?new Date(`${d.date}-01T12:00:00`).toLocaleDateString('en-US',{month:'short'}):d.date.slice(5))} series={[{name:'Purchases',data:purchased.map(d=>d.amount)},{name:'Returns',data:returned.map(d=>d.amount)}]} summary="Grouped monthly purchase and return bars over nine months"/><p className="reference-note">{formatDate(chartRange.from)} – {formatDate(chartRange.to)}</p></ReferencePanel>
 <ReferencePanel title="Purchase Distribution" control={<span className="commerce-muted text-xs">By category</span>}><ReferenceChart kind="distribution" height={365} count labels={distribution.map(([name])=>name)} series={(['received','pending','returned'] as const).map((key,i)=>({name:['Received Units','Pending Units','Returned Units'][i],data:distribution.map(([,value])=>value[key])}))} summary="Stacked horizontal bars showing received, pending, and returned units by category"/></ReferencePanel></div>
 <div className="reference-purchase-bottom"><ReferencePanel title="Top Suppliers">{top.map(s=>{const supplier=r.rows.find(p=>p.supplier===s.label);return supplier?<div className="reference-top-supplier" key={s.label}><SupplierIdentity id={supplier.supplierId}/><strong>{payrollMoney(s.amount)}</strong></div>:null;})}{!top.length&&<p className="commerce-empty"><T text={"No purchases in this period."}/></p>}</ReferencePanel>
 <ReportTable title="Summary" rows={r.rows} rowKey={p=>p.id} columns={[{id:'supplier',header:'Supplier',cell:p=><SupplierIdentity id={p.supplierId}/>},{id:'items',header:'Items',cell:p=>`${p.items.reduce((n,l)=>n+l.orderedQty,0)} Items`},{id:'amount',header:'Total Amount',cell:p=>formatPHP(p.grandTotal),sortValue:p=>p.grandTotal},{id:'status',header:'Payment Status',cell:p=><StatusBadge>{p.paymentStatus}</StatusBadge>},{id:'date',header:'Date',cell:p=>formatDate(p.date),sortValue:p=>p.date},{id:'action',header:'Action',cell:p=><Link className="text-indigo-600" to={`/purchases/${p.id}`}>View purchase →</Link>}]} totals={<Link className="text-indigo-600" to="/purchases/purchase"><T text={"View all purchases →"}/></Link>}/></div>
 </ReportFrame>;
}
