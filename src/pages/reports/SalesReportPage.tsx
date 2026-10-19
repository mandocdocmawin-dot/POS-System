import {useState} from 'react';
import {Link} from 'react-router-dom';
import {DollarSign,CheckCheck,X,Percent,Receipt,Store,Eye} from 'lucide-react';
import {useReportFilters} from '../../hooks/useReportFilters';
import {reportService} from '../../services/reportService';
import {orderService} from '../../services/orderService';
import {branchService} from '../../services/branchService';
import {productService} from '../../services/productService';
import {categoryService} from '../../services/catalogService';
import {ReportFrame} from '../../components/reports/ReportFrame';
import {ReportTable} from '../../components/reports/ReportSection';
import {ReferenceMetrics} from '../../components/reports/ReferencePanel';
import {ReportChart} from '../../components/reports/ReportChart';
import {SalesByBranch} from '../../components/reports/SalesByBranch';
import {CustomerIdentity} from '../../components/customers/CustomerIdentity';
import {DataTable} from '../../components/common/DataTable';
import {StatusBadge} from '../../components/common/StatusBadge';
import {ProductImage} from '../../components/common/ProductImage';
import {ProductDetails} from '../products/ProductDetails';
import {formatPHP,payrollMoney} from '../../utils/money';
import {fromCentavos} from '../../utils/pos';
import {formatDateTime} from '../../utils/date';
import {inRange} from '../../utils/reports/period';
import type {Granularity} from '../../utils/reports/timeSeries';
export function Component(){
 const f=useReportFilters(),[g,setG]=useState<Granularity>('day'),[category,setCategory]=useState(''),[method,setMethod]=useState(''),[status,setStatus]=useState(''),[selected,setSelected]=useState<string[]>([]),[product,setProduct]=useState(''),r=reportService.sales(f,g),p=f.compare?reportService.sales(reportService.previous(f),g):undefined;
 const all=orderService.list({branchId:f.branchId}).filter(o=>inRange(o.createdAt,f)),rows=all.filter(o=>(!status||o.orderStatus===status)&&(!method||o.payments.some(pay=>pay.method===method))&&(!category||o.items.some(l=>productService.get(l.productId)?.categoryId===category))),dailyFields=['gross','discounts','refunds','net','tax'] as const;
 return <ReportFrame title="Sales" filter={f} csv={[["Date","Orders","Gross PHP","Discounts PHP","Refunds PHP","Net PHP","Tax PHP"],...r.daily.map(d=>[d.date,d.orders,...dailyFields.map(k=>fromCentavos(d[k]))])]} summary={<ReferenceMetrics items={[
  {label:'Net Sales',value:r.revenue,previous:p?.revenue,detail:'After cash refunds',icon:DollarSign},
  {label:'Completed Orders',value:all.filter(o=>o.orderStatus==='completed').length,count:true,detail:'Successfully completed',icon:CheckCheck},
  {label:'Cancelled Orders',value:all.filter(o=>o.orderStatus==='cancelled').length,count:true,detail:'Order cancellations',icon:X},
  {label:'Discount Given',value:r.discounts,previous:p?.discounts,detail:'Discounts allocated to receipts',icon:Percent},
  {label:'Tax Collected',value:r.tax,previous:p?.tax,detail:'Tax allocated to receipts',icon:Receipt},
  {label:'Active Stores',value:branchService.reportBranches().filter(b=>b.status==='active'&&(f.branchId==='all'||b.id===f.branchId)).length,count:true,detail:'Within selected branch scope',icon:Store}
 ]}/> }>
 <section className="panel"><div className="commerce-panel-heading"><h2>Sales</h2><div className="commerce-toolbar"><select aria-label="Sales category" value={category} onChange={e=>setCategory(e.target.value)}><option value="">Category</option>{categoryService.list().map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select><select aria-label="Sales payment method" value={method} onChange={e=>setMethod(e.target.value)}><option value="">Payment</option>{['cash','gcash','maya','card','bank','wallet'].map(m=><option key={m}>{m}</option>)}</select><select aria-label="Sales order status" value={status} onChange={e=>setStatus(e.target.value)}><option value="">Status</option>{['completed','pending','cancelled','refunded','partially_refunded'].map(s=><option key={s}>{s}</option>)}</select></div></div>
 <DataTable caption="Sales" rows={rows} rowKey={o=>o.id} selection={selected} onSelectionChange={setSelected} searchText={o=>`${o.orderNo} ${o.customerName} ${o.items.map(l=>l.name).join(' ')}`} columns={[
  {id:'invoice',header:'Invoice ID',cell:o=><Link to={`/orders/${o.id}`}>{o.orderNo}</Link>,sortValue:o=>o.orderNo},
  {id:'product',header:'Product',cell:o=><button className="commerce-product" disabled={!productService.get(o.items[0].productId)} onClick={()=>setProduct(o.items[0].productId)}><ProductImage name={o.items[0].name} imageId={o.items[0].imageId}/><span>{o.items[0].name}<small className="commerce-subline">{categoryService.list().find(c=>c.id===productService.get(o.items[0].productId)?.categoryId)?.name}{o.items.length>1?` · +${o.items.length-1} more`:''}</small></span></button>},
  {id:'customer',header:'Customer',cell:o=><CustomerIdentity id={o.customerId} name={o.customerName} email={false}/>},
  {id:'date',header:'Date',cell:o=>formatDateTime(o.createdAt),sortValue:o=>o.createdAt},
  {id:'method',header:'Payment',cell:o=>[...new Set(o.payments.map(pay=>pay.method))].join(', ')||'Pay later'},
  {id:'status',header:'Status',cell:o=><StatusBadge>{o.orderStatus}</StatusBadge>},
  {id:'total',header:'Total',cell:o=>formatPHP(o.grandTotal),sortValue:o=>o.grandTotal},
  {id:'qty',header:'Qty',cell:o=>o.items.reduce((n,l)=>n+l.quantity,0)}
 ]} actions={o=><div className="commerce-actions"><Link to={`/orders/${o.id}`} aria-label={`View ${o.orderNo}`}><Eye size={15}/></Link></div>}/></section>
 <details className="panel reference-analytics"><summary>Sales analytics and daily breakdown</summary><div className="space-y-4">{f.branchId==='all'&&<SalesByBranch filter={f}/>}<label>Chart interval <select value={g} onChange={e=>setG(e.target.value as Granularity)}><option value="day">Daily</option><option value="week">Weekly</option><option value="month">Monthly</option></select></label><div className="grid gap-4 lg:grid-cols-2"><ReportChart title="Sales over time" kind="area" labels={r.series.map(d=>d.date)} series={[{name:'Net sales',data:r.series.map(d=>d.amount)}]} summary={`Net sales ${payrollMoney(r.revenue)}`}/><ReportChart title="Sales by payment method" kind="donut" labels={r.payments.map(d=>d.label)} series={[{name:'Received',data:r.payments.map(d=>d.amount)}]} summary="Cash receipts by payment method"/><ReportChart title="Sales by hour" labels={r.hourly.map(d=>d.date)} series={[{name:'Received',data:r.hourly.map(d=>d.amount)}]} summary="Receipts by hour"/><ReportChart title="Sales by cashier" labels={r.cashiers.map(d=>d.label)} series={[{name:'Received',data:r.cashiers.map(d=>d.amount)}]} summary="Receipts by cashier"/><ReportChart title="Sales by category" labels={r.categories.map(d=>d.label)} series={[{name:'Received',data:r.categories.map(d=>d.amount)}]} summary="Receipts by category"/></div><ReportTable title="Daily breakdown" rows={r.daily} rowKey={d=>d.date} columns={[{id:'date',header:'Date',cell:d=><Link to={`/orders/all-orders?from=${d.date}&to=${d.date}&branch=${encodeURIComponent(f.branchId)}`}>{d.date}</Link>},{id:'orders',header:'Orders',cell:d=>d.orders},...dailyFields.map(k=>({id:k,header:k.toUpperCase(),cell:(d:typeof r.daily[number])=>payrollMoney(d[k])}))]}/></div></details>{product&&<ProductDetails id={product} onClose={()=>setProduct('')}/>}
 </ReportFrame>;
}
