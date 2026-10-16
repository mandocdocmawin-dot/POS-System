import {useNavigate} from 'react-router-dom';
import type {Order} from '../../types/pos';
import {DataTable} from '../common/DataTable';
import {EntityLink} from '../common/EntityLink';
import {StatusBadge} from '../common/StatusBadge';
import {formatPHP} from '../../utils/money';
export function OrderTable({rows,selection,onSelectionChange}:{rows:Order[];selection?:string[];onSelectionChange?:(ids:string[])=>void}){const navigate=useNavigate();return <DataTable caption="Orders" rows={rows} rowKey={o=>o.id} searchText={o=>`${o.orderNo} ${o.customerName}`} selection={selection} onSelectionChange={onSelectionChange} onRowClick={o=>navigate(`/orders/${o.id}`)} columns={[
 {id:'no',header:'Order No',cell:o=><EntityLink type="orders" id={o.id}>{o.orderNo}</EntityLink>,sortValue:o=>o.orderNo},
 {id:'date',header:'Date',cell:o=>new Date(o.createdAt).toLocaleDateString(),sortValue:o=>o.createdAt},
 {id:'customer',header:'Customer',cell:o=><EntityLink type="customers" id={o.customerId}><span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs dark:bg-indigo-950">{o.customerName.split(' ').slice(0,2).map(n=>n[0]).join('')}</span>{o.customerName}</EntityLink>},
 {id:'items',header:'Items',cell:o=>o.items.length},...(['grandTotal','amountPaid','balanceDue'] as const).map((id,i)=>({id,header:['Total','Paid','Balance'][i],cell:(o:Order)=>formatPHP(o[id]),sortValue:(o:Order)=>o[id]})),
 {id:'payment',header:'Payment',cell:o=><StatusBadge>{o.paymentStatus}</StatusBadge>},{id:'status',header:'Status',cell:o=><StatusBadge>{o.orderStatus}</StatusBadge>}
 ]} actions={o=><div className="flex gap-2"><EntityLink type="orders" id={o.id}>View</EntityLink>{o.orderStatus!=='cancelled'&&o.amountPaid>o.refundedTotal&&<a className="text-indigo-600" href={`/orders/${o.id}?action=refund`}>Refund</a>}{o.orderStatus==='pending'&&!o.refundedTotal&&<a className="text-red-500" href={`/orders/${o.id}?action=cancel`}>Cancel</a>}</div>}/>;}
