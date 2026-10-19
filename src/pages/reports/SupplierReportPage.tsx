import {useState} from 'react';
import {Link} from 'react-router-dom';
import {ShoppingCart,Wallet,Landmark,Layers,UserCheck,UserX} from 'lucide-react';
import {useReportFilters} from '../../hooks/useReportFilters';
import {reportService} from '../../services/reportService';
import {supplierService} from '../../services/supplierService';
import {supplierPaymentService} from '../../services/supplierPaymentService';
import {ReportFrame} from '../../components/reports/ReportFrame';
import {ReferenceMetrics} from '../../components/reports/ReferencePanel';
import {ReportChart} from '../../components/reports/ReportChart';
import {ReportTable} from '../../components/reports/ReportSection';
import {SupplierIdentity} from '../../components/suppliers/SupplierIdentity';
import {DataTable} from '../../components/common/DataTable';
import {StatusBadge} from '../../components/common/StatusBadge';
import {payrollMoney} from '../../utils/money';
import {fromCentavos} from '../../utils/pos';
import {formatDate} from '../../utils/date';
import {inRange} from '../../utils/reports/period';
export function Component(){
 const f=useReportFilters(),all=reportService.supplier(f),s=reportService.supplierSummary(f),purchases=reportService.purchases(f),[min,setMin]=useState(''),[max,setMax]=useState(''),[status,setStatus]=useState(''),[method,setMethod]=useState(''),[selected,setSelected]=useState<string[]>([]);
 const enriched=all.map(supplier=>{const orders=purchases.rows.filter(p=>p.supplierId===supplier.id),payments=supplierPaymentService.list(supplier.id).filter(pay=>inRange(pay.createdAt,f)&&orders.some(p=>p.id===pay.purchaseId)),profile=supplierService.get(supplier.id);return {...supplier,status:profile?.status??'active',items:orders.reduce((n,p)=>n+p.items.reduce((sum,l)=>sum+l.orderedQty,0),0),count:orders.length,last:orders.map(p=>p.date).sort().at(-1),method:payments[0]?.method};});
 const rows=enriched.filter(r=>(min===''||r.items>=Number(min))&&(max===''||r.items<=Number(max))&&(!status||r.status===status)&&(!method||r.method===method));
 return <ReportFrame title="Supplier" filter={f} csv={[["Supplier","Purchases PHP","Returns PHP","Payments PHP","Balance PHP","Items","Last Purchase","Average Order PHP","Status"],...rows.map(r=>[r.name,fromCentavos(r.purchases),fromCentavos(r.returns),fromCentavos(r.payments),fromCentavos(r.balance),r.items,r.last??'',r.count?fromCentavos(Math.round(r.purchases/r.count)):0,r.status])]} summary={<ReferenceMetrics compact items={[
  {label:'Total Suppliers',value:all.length,count:true,icon:ShoppingCart},
  {label:'Total Purchases',value:s.purchases,icon:Wallet},
  {label:'Total Paid',value:s.payments,icon:Landmark},
  {label:'Total Items',value:enriched.reduce((n,r)=>n+r.items,0),count:true,icon:Layers},
  {label:'Active Suppliers',value:enriched.filter(r=>r.status==='active').length,count:true,icon:UserCheck},
  {label:'Inactive Suppliers',value:enriched.filter(r=>r.status==='inactive').length,count:true,icon:UserX}
 ]}/> }><section className="panel"><div className="commerce-panel-heading"><h2>Supplier Report</h2><div className="commerce-toolbar"><input className="w-28" aria-label="Minimum items" placeholder="Min Items" type="number" min="0" value={min} onChange={e=>setMin(e.target.value)}/><input className="w-28" aria-label="Maximum items" placeholder="Max Items" type="number" min="0" value={max} onChange={e=>setMax(e.target.value)}/><select aria-label="Supplier status" value={status} onChange={e=>setStatus(e.target.value)}><option value="">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option></select><select aria-label="Supplier payment method" value={method} onChange={e=>setMethod(e.target.value)}><option value="">Payment Method</option>{['cash','gcash','maya','card','bank'].map(m=><option key={m}>{m}</option>)}</select></div></div>
 <DataTable caption="Suppliers" rows={rows} rowKey={r=>r.id} selection={selected} onSelectionChange={setSelected} searchText={r=>`${r.name} ${r.id}`} columns={[
  {id:'id',header:'Supplier ID',cell:r=><Link to={`/suppliers/${r.id}`}>#{r.id.startsWith('supplier-')?`SUP-${r.id.slice(9).padStart(4,'0')}`:r.id.slice(0,8).toUpperCase()}</Link>},
  {id:'name',header:'Supplier',cell:r=><SupplierIdentity id={r.id}/>,sortValue:r=>r.name},
  {id:'total',header:'Total Purchase',cell:r=>payrollMoney(r.purchases),sortValue:r=>r.purchases},
  {id:'paid',header:'Total Paid',cell:r=>payrollMoney(r.payments),sortValue:r=>r.payments},
  {id:'items',header:'Total Items',cell:r=>r.items,sortValue:r=>r.items},
  {id:'method',header:'Payment',cell:r=>r.method??'—'},
  {id:'last',header:'Last Purchase',cell:r=>r.last?formatDate(r.last):'—'},
  {id:'average',header:'Avg Order Value',cell:r=>payrollMoney(r.count?Math.round(r.purchases/r.count):0)},
  {id:'status',header:'Status',cell:r=><StatusBadge>{r.status}</StatusBadge>}
 ]}/></section><details className="panel reference-analytics"><summary>Payable aging and supplier analytics</summary><div className="space-y-4"><Link className="btn" to="/suppliers/balance-report">Open Supplier Balance Report →</Link><div className="grid gap-4 lg:grid-cols-2"><ReportChart title="Spend by supplier" horizontal labels={all.map(r=>r.name)} series={[{name:'Payments',data:all.map(r=>r.payments)}]} summary="Actual supplier payments in the selected period"/><ReportChart title="Payable aging distribution" kind="stacked" labels={all.map(r=>r.name)} series={['0–30 days','31–60 days','61+ days'].map((name,i)=>({name,data:all.map(r=>r.aging[i])}))} summary="Payable aging by supplier"/></div><ReportTable title="Supplier balances" rows={all} rowKey={r=>r.id} columns={[{id:'supplier',header:'Supplier',cell:r=><SupplierIdentity id={r.id}/>},{id:'balance',header:'Balance',cell:r=>payrollMoney(r.balance)},{id:'days',header:'Average days to pay',cell:r=>r.averageDays},...[0,1,2].map(i=>({id:`aging-${i}`,header:['0–30 days','31–60 days','61+ days'][i],cell:(r:typeof all[number])=>payrollMoney(r.aging[i])}))]}/></div></details></ReportFrame>;
}
