import {Link} from 'react-router-dom';
import {usePermission} from '../../hooks/usePermission';
import {useState} from 'react';
import {Eye,Pencil,Trash2} from 'lucide-react';
import {DataTable} from '../../components/common/DataTable';
import {StatusBadge} from '../../components/common/StatusBadge';
import {ReceiptDialog} from '../../components/pos/ReceiptDialog';
import {receiptService,type ReceiptDocument} from '../../services/receiptService';
import {dashboardService} from '../../services/dashboardService';
import {formatPHP} from '../../utils/money';
export function RecentOrders() {
 const {can}=usePermission();
 const orders=dashboardService.getRecentOrders();
 const [page,setPage]=useState(1),[receipt,setReceipt]=useState<ReceiptDocument|null>(null);
 const pages=Math.max(1,Math.ceil(orders.length/7)),current=Math.min(page,pages);
 return <section className="card min-w-0 p-0"><div className="flex items-center justify-between p-5"><h2 className="text-sm font-semibold">Recent Orders</h2><span className="text-xs text-slate-500">{orders.length} orders · current branch</span></div>
 <DataTable caption="Recent store orders" rows={orders.slice((current-1)*7,current*7)} rowKey={o=>o.id} columns={[
  {id:'no',header:'Order ID',cell:o=><Link className="font-medium text-indigo-500" to={`/orders/${o.id}`}>{o.orderNo}</Link>},
  {id:'date',header:'Date',cell:o=>new Date(o.createdAt).toLocaleString()},
  {id:'product',header:'Products',cell:o=>o.items.map(l=>`${l.name}${l.variantName?' / '+l.variantName:''}`).join(', ')},
  {id:'customer',header:'Customer',cell:o=>o.customerName},
  {id:'items',header:'Items',cell:o=>o.items.length},
  {id:'total',header:'Total',cell:o=>formatPHP(o.grandTotal)},
  {id:'payment',header:'Payment Status',cell:o=><StatusBadge>{o.paymentStatus}</StatusBadge>},
  {id:'status',header:'Order Status',cell:o=><StatusBadge>{o.orderStatus}</StatusBadge>},
  {id:'actions',header:'Actions',cell:o=><div className="flex gap-2"><Link className="btn" aria-label={`View order ${o.orderNo}`} to={`/orders/${o.id}`}><Eye size={14}/></Link><Link className="btn" aria-label={`Manage order ${o.orderNo}`} to={`/orders/${o.id}`}><Pencil size={14}/></Link>{can('orders:cancel')&&o.orderStatus==='pending'&&!o.refundedTotal&&<Link className="btn text-red-500" aria-label={`Cancel order ${o.orderNo}`} to={`/orders/${o.id}?action=cancel`}><Trash2 size={14}/></Link>}</div>},
  {id:'view',header:'Receipt',cell:o=><button className="btn" aria-label={`View ${o.orderNo}`} onClick={()=>setReceipt(receiptService.get(o.id))}><Eye size={14}/></button>},
 ]}/>
 <nav aria-label="Recent orders pages" className="flex items-center justify-end gap-3 p-4"><button className="btn disabled:opacity-40" disabled={current===1} onClick={()=>setPage(current-1)}>Previous</button><span className="text-xs">{current} / {pages}</span><button className="btn disabled:opacity-40" disabled={current===pages} onClick={()=>setPage(current+1)}>Next</button></nav><ReceiptDialog receipt={receipt} reprint onClose={()=>setReceipt(null)}/></section>;
}
