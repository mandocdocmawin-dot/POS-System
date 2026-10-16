import {useState} from 'react';
import {PageActions} from '../../components/common/PageActions';
import {DataTable} from '../../components/common/DataTable';
import {EntityLink} from '../../components/common/EntityLink';
import {RefundSlip} from '../../components/orders/RefundSlip';
import {refundService} from '../../services/refundService';
import {orderService} from '../../services/orderService';
import {useLocalData} from '../../services/useLocalData';
import {formatPHP} from '../../utils/money';
import {exportCSV} from '../../utils/csv';
import type {Refund} from '../../types/phase4';
export function Component(){useLocalData();const rows=refundService.list(),[view,setView]=useState<Refund|null>(null);return <><PageActions title="Refunded"><button className="btn" onClick={()=>exportCSV('refunds.csv',[['Refund','Date','Order','Amount','Method','Restocked'],...rows.map(r=>[r.refundNo,r.createdAt,orderService.get(r.orderId)?.orderNo??'',r.refundAmount,r.refundMethod,r.restock?'yes':'no'])])}>Export CSV</button></PageActions><div className="panel"><DataTable caption="Refunds" rows={rows} rowKey={r=>r.id} searchText={r=>`${r.refundNo} ${orderService.get(r.orderId)?.customerName}`} columns={[{id:'no',header:'Refund No',cell:r=>r.refundNo},{id:'date',header:'Date',cell:r=>new Date(r.createdAt).toLocaleDateString()},{id:'order',header:'Order',cell:r=><EntityLink type="orders" id={r.orderId}>{orderService.get(r.orderId)?.orderNo??r.orderId}</EntityLink>},{id:'customer',header:'Customer',cell:r=>orderService.get(r.orderId)?.customerName??'—'},{id:'items',header:'Items',cell:r=>r.items.length},{id:'amount',header:'Amount',cell:r=>formatPHP(r.refundAmount)},{id:'method',header:'Method',cell:r=>r.refundMethod},{id:'stock',header:'Restocked',cell:r=>r.restock?'Yes':'No'}]} actions={r=><button className="btn" onClick={()=>setView(r)}>View slip</button>}/></div><RefundSlip refund={view} onClose={()=>setView(null)}/></>;}
