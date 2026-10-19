import {Link,useSearchParams} from 'react-router-dom';
import {inDateRange} from '../../utils/dateRange';
import {useState} from 'react';
import {Plus,Download} from 'lucide-react';
import {CommerceWorkspace,CommerceStats,CommercePanelHeading} from '../../components/customers/CommerceWorkspace';
import {Can} from '../../components/auth/Can';
import {DateRangeFilter,type DateRange} from '../../components/common/DateRangeFilter';
import {OrderTable} from '../../components/orders/OrderTable';
import {orderService} from '../../services/orderService';
import {customerService} from '../../services/customerService';
import {posService} from '../../services/posService';
import {useLocalData} from '../../services/useLocalData';
import {toCentavos,fromCentavos} from '../../utils/pos';
import {formatPHP} from '../../utils/money';
import {exportCSV} from '../../utils/csv';
export function Component(){
 useLocalData();const [params]=useSearchParams();const [range,setRange]=useState<DateRange>({from:params.get('from')??'',to:params.get('to')??''}),[status,setStatus]=useState(''),[payment,setPayment]=useState(''),[customer,setCustomer]=useState(params.get('customer')??''),[method,setMethod]=useState(''),[branch,setBranch]=useState(params.get('branch')??(params.get('customer')?'all':posService.branch())),[selected,setSelected]=useState<string[]>([]);
 const all=orderService.list({branchId:branch}),rows=all.filter(o=>inDateRange(o.createdAt,range)&&(!status||o.orderStatus===status)&&(!payment||o.paymentStatus===payment)&&(!customer||o.customerId===customer)&&(!method||o.payments.some(p=>p.method===method)));
 const revenue=fromCentavos(all.filter(o=>o.orderStatus!=='cancelled').reduce((n,o)=>n+toCentavos(o.grandTotal)-toCentavos(o.refundedTotal),0));
 return <CommerceWorkspace title="Orders All" section="Orders"><CommerceStats items={[
 {label:'Total Orders',value:all.length,detail:'Orders in selected branch'},
 {label:'Total Revenue',value:formatPHP(revenue),detail:'Order value after refunds'},
 {label:'Pending Orders',value:all.filter(o=>o.orderStatus==='pending').length,detail:'Awaiting completion'},
 {label:'Completed Orders',value:all.filter(o=>o.orderStatus==='completed').length,detail:'Successfully completed'},
 {label:'Refunded Orders',value:all.filter(o=>o.refundedTotal>0).length,detail:'Full and partial refunds'}
 ]}/><div className="panel"><CommercePanelHeading title="All Orders"><button className="btn" onClick={()=>exportCSV('orders.csv',[['Order','Date','Customer','Total','Paid','Balance','Refunded','Status'],...rows.map(o=>[o.orderNo,o.createdAt,o.customerName,o.grandTotal,o.amountPaid,o.balanceDue,o.refundedTotal,o.orderStatus])])}><Download size={15}/>Export CSV</button><Can permission="pos:use"><Link className="btn-primary" to="/pos"><Plus size={16}/>Add New Order</Link></Can></CommercePanelHeading><div className="commerce-filters"><DateRangeFilter value={range} onChange={setRange}/>{[{label:'Order status',value:status,change:setStatus,options:['completed','pending','partially_refunded','refunded','cancelled']},{label:'Payment status',value:payment,change:setPayment,options:['paid','partial','unpaid']},{label:'Payment method',value:method,change:setMethod,options:['cash','gcash','maya','card','bank','wallet']}].map(f=><select key={f.label} aria-label={f.label} value={f.value} onChange={e=>f.change(e.target.value)}><option value="">{f.label}</option>{f.options.map(x=><option key={x}>{x}</option>)}</select>)}<select aria-label="Customer" value={customer} onChange={e=>setCustomer(e.target.value)}><option value="">All customers</option>{customerService.list().map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select><select aria-label="Branch" value={branch} onChange={e=>setBranch(e.target.value)}>{[...new Set([posService.branch(),'Main Branch','Branch 2','all'])].map(x=><option value={x} key={x}>{x==='all'?'All branches':x}</option>)}</select></div><OrderTable rows={rows} selection={selected} onSelectionChange={setSelected}/></div></CommerceWorkspace>;
}
