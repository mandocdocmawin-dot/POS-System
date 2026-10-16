import {useState} from 'react';
import {PageActions} from '../../components/common/PageActions';
import {DataTable} from '../../components/common/DataTable';
import {StatusBadge} from '../../components/common/StatusBadge';
import {EntityLink} from '../../components/common/EntityLink';
import {ReceiptDialog} from '../../components/pos/ReceiptDialog';
import {orderService} from '../../services/orderService';
import {toast} from '../../services/toastService';
import {useLocalData} from '../../services/useLocalData';
import type {Order} from '../../types/pos';
import {formatPHP} from '../../utils/money';
export function Component(){useLocalData();const [status,setStatus]=useState(''),[print,setPrint]=useState<Order|null>(null),today=new Date().toLocaleDateString('en-CA');const rows=orderService.list({branchId:'all'}).filter(o=>!status||(status==='overdue'?o.orderStatus==='pending'&&!!o.dueDate&&o.dueDate<today:status==='unpaid'?o.balanceDue>0:o.paymentStatus==='paid'));return <><PageActions title="Invoices"/><select className="mb-4" aria-label="Invoice status" value={status} onChange={e=>setStatus(e.target.value)}><option value="">All invoices</option>{['paid','unpaid','overdue'].map(x=><option key={x}>{x}</option>)}</select><div className="panel"><DataTable caption="Invoices" rows={rows} rowKey={o=>o.id} searchText={o=>`${o.orderNo} ${o.customerName}`} columns={[{id:'no',header:'Invoice no',cell:o=><EntityLink type="orders" id={o.id}>{o.orderNo}</EntityLink>},{id:'date',header:'Date',cell:o=>new Date(o.createdAt).toLocaleDateString()},{id:'customer',header:'Customer',cell:o=>o.customerName},...(['grandTotal','amountPaid','balanceDue'] as const).map((id,i)=>({id,header:['Amount','Paid','Balance'][i],cell:(o:Order)=>formatPHP(o[id])})),{id:'status',header:'Status',cell:o=><StatusBadge>{o.orderStatus==='cancelled'?'cancelled':o.balanceDue&&o.dueDate&&o.dueDate<today?'overdue':o.paymentStatus}</StatusBadge>}]} actions={o=><div className="flex gap-2"><EntityLink type="orders" id={o.id}>View</EntityLink><button className="btn" onClick={()=>setPrint(o)}>Print</button><button className="btn" onClick={()=>toast.info('Email not available in demo')}>Send</button></div>}/></div><ReceiptDialog receipt={print} onClose={()=>setPrint(null)} reprint/></>;}

