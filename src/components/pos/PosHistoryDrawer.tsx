import {useState} from 'react';
import {Drawer} from '../common/Drawer';
import {ReceiptDialog} from './ReceiptDialog';
import {orderService} from '../../services/orderService';
import {receiptService,type ReceiptDocument} from '../../services/receiptService';
import {formatPHP} from '../../utils/money';
import {StatusBadge} from '../common/StatusBadge';
export function PosHistoryDrawer({open,onClose}:{open:boolean;onClose:()=>void}) {
 const [search,setSearch]=useState(''),[receipt,setReceipt]=useState<ReceiptDocument|null>(null);
 const orders=orderService.list({today:true,search});
 return <><Drawer open={open} title="Today's POS orders" onClose={onClose}><p className="mb-3 text-xs text-slate-500">Current branch · newest first</p><input autoFocus className="mb-4 w-full" aria-label="Search order number" placeholder="Search TP-000123…" value={search} onChange={e=>setSearch(e.target.value)}/><div className="space-y-2">{orders.map(o=><button key={o.id} className="btn flex w-full items-center justify-between gap-3 p-4 text-left" onClick={()=>setReceipt(receiptService.get(o.id))}><span><strong className="text-indigo-500">{o.orderNo}</strong><small className="mt-1 block text-slate-500">{new Date(o.createdAt).toLocaleTimeString()} · {o.customerName}</small></span><span className="text-right"><strong className="block">{formatPHP(o.grandTotal)}</strong><StatusBadge>{o.paymentStatus}</StatusBadge></span></button>)}</div>{!orders.length&&<p className="py-12 text-center text-slate-400">No orders match for today.</p>}</Drawer><ReceiptDialog receipt={receipt} reprint onClose={()=>setReceipt(null)}/></>;
}
