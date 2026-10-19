import {useState} from 'react';
import {Link} from 'react-router-dom';
import {Plus,Download,Eye} from 'lucide-react';
import {CommerceWorkspace,CommercePanelHeading} from '../../components/customers/CommerceWorkspace';
import {CustomerIdentity} from '../../components/customers/CustomerIdentity';
import {Can} from '../../components/auth/Can';
import {Modal} from '../../components/common/Modal';
import {DataTable} from '../../components/common/DataTable';
import {StatusBadge} from '../../components/common/StatusBadge';
import {RefundSlip} from '../../components/orders/RefundSlip';
import {refundService} from '../../services/refundService';
import {orderService} from '../../services/orderService';
import {useLocalData} from '../../services/useLocalData';
import {formatPHP} from '../../utils/money';
import {formatDate} from '../../utils/date';
import {exportCSV} from '../../utils/csv';
import type {Refund} from '../../types/phase4';
export function Component(){
 useLocalData();const [view,setView]=useState<Refund|null>(null),[tab,setTab]=useState('All Refunds'),[add,setAdd]=useState(false),[query,setQuery]=useState(''),[selected,setSelected]=useState<string[]>([]);
 const refunds=refundService.list(),rows=tab==='Pending'||tab==='Rejected'?[]:refunds,eligible=orderService.list({branchId:'all'}).filter(o=>o.orderStatus!=='cancelled'&&o.amountPaid>o.refundedTotal&&`${o.orderNo} ${o.customerName}`.toLowerCase().includes(query.toLowerCase()));
 return <CommerceWorkspace title="Refund" section="Orders"><div className="panel"><CommercePanelHeading title="Refunds"><button className="btn" onClick={()=>exportCSV('refunds.csv',[['Refund','Date','Order','Amount','Method','Reason'],...rows.map(r=>[r.refundNo,r.createdAt,orderService.get(r.orderId)?.orderNo??'',r.refundAmount,r.refundMethod,r.reason])])}><Download size={15}/>Export CSV</button><Can permission="orders:refund"><button className="btn-primary" onClick={()=>setAdd(true)}><Plus size={16}/>Add New</button></Can></CommercePanelHeading><div className="commerce-tabs" role="tablist" aria-label="Refund status">{['All Refunds','Pending','Completed','Rejected'].map(x=><button key={x} role="tab" aria-selected={tab===x} onClick={()=>setTab(x)}>{x}</button>)}</div>{(tab==='Pending'||tab==='Rejected')&&<p className="px-4 pt-4 text-xs commerce-muted">Refunds are recorded when confirmed. There are no {tab.toLowerCase()} refund requests.</p>}<DataTable caption="Refunds" rows={rows} rowKey={r=>r.id} selection={selected} onSelectionChange={setSelected} searchText={r=>`${r.refundNo} ${orderService.get(r.orderId)?.orderNo} ${orderService.get(r.orderId)?.customerName} ${r.reason}`} columns={[
 {id:'no',header:'Refund ID',cell:r=>r.refundNo,sortValue:r=>r.refundNo},
 {id:'order',header:'Order ID',cell:r=><Link to={`/orders/${r.orderId}`}>{orderService.get(r.orderId)?.orderNo??r.orderId}</Link>},
 {id:'date',header:'Refund Date',cell:r=>formatDate(new Date(r.createdAt)),sortValue:r=>r.createdAt},
 {id:'customer',header:'Customer',cell:r=>{const o=orderService.get(r.orderId);return o?<CustomerIdentity id={o.customerId} name={o.customerName} email={false}/>:'—';}},
 {id:'type',header:'Refund Type',cell:r=>{const o=orderService.get(r.orderId);return <span className="commerce-event-tag">{o&&r.refundAmount>=o.grandTotal?'Full':'Partial'}</span>;}},
 {id:'reason',header:'Reason',cell:r=><span className="commerce-muted">{r.reason}</span>},
 {id:'amount',header:'Refund Amount',cell:r=><strong>{formatPHP(r.refundAmount)}</strong>,sortValue:r=>r.refundAmount},
 {id:'method',header:'Refund Method',cell:r=><StatusBadge>{r.refundMethod}</StatusBadge>},
 {id:'status',header:'Status',cell:()=><StatusBadge>completed</StatusBadge>}
 ]} actions={r=><div className="commerce-actions"><button onClick={()=>setView(r)} aria-label={`View ${r.refundNo}`}><Eye size={15}/></button></div>}/></div><RefundSlip refund={view} onClose={()=>setView(null)}/><Modal open={add} title="Select an order to refund" onClose={()=>setAdd(false)}><input className="w-full mb-4" aria-label="Find order to refund" placeholder="Search order or customer…" value={query} onChange={e=>setQuery(e.target.value)}/><div className="grid gap-2 max-h-96 overflow-y-auto">{eligible.map(o=><Link className="btn justify-between" key={o.id} to={`/orders/${o.id}?action=refund`}><span>{o.orderNo} · {o.customerName}</span><strong>{formatPHP(o.amountPaid-o.refundedTotal)}</strong></Link>)}{!eligible.length&&<p className="commerce-empty">No refundable orders found.</p>}</div></Modal></CommerceWorkspace>;
}
