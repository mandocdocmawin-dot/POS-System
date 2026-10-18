import {formatDateTime as displayDateTime} from '../../utils/date';
import {useState} from 'react';
import {Drawer} from '../common/Drawer';
import {ConfirmDialog} from '../common/ConfirmDialog';
import {holdService} from '../../services/holdService';
import {customerService} from '../../services/customerService';
import {posService} from '../../services/posService';
import {toast,errorMessage} from '../../services/toastService';
import {calculateTotals} from '../../utils/pos';
import {formatPHP} from '../../utils/money';
export function HeldOrdersDrawer({open,onClose}:{open:boolean;onClose:()=>void}) {
 const [confirm,setConfirm]=useState<{id:string;action:'resume'|'delete'}|null>(null);
 const resume=(id:string,replace=false)=>{try{holdService.resume(id,replace);onClose();toast.success('Held order resumed.');}catch(e){toast.error(errorMessage(e));}};
 const orders=holdService.list();
 return <><Drawer open={open} title="Held orders" onClose={onClose}><div className="space-y-3">{orders.map(o=><article key={o.id} className="card p-4"><h3 className="font-semibold">{o.label}</h3><p className="my-2 text-xs text-slate-500">{customerService.get(o.customerId)?.name} · {displayDateTime(new Date(o.createdAt))} · {o.cart.length} items</p><strong>{formatPHP(calculateTotals(o.cart,o.orderDiscount).grandTotal)}</strong><div className="mt-3 flex gap-2"><button className="btn-primary" onClick={()=>posService.state().cart.length?setConfirm({id:o.id,action:'resume'}):resume(o.id)}>Resume</button><button className="btn text-red-500" onClick={()=>setConfirm({id:o.id,action:'delete'})}>Delete</button></div></article>)}</div>{!orders.length&&<p className="py-12 text-center text-slate-500">No held orders.</p>}</Drawer>
 <ConfirmDialog open={!!confirm} title={confirm?.action==='resume'?'Replace current cart?':'Delete held order?'} message={confirm?.action==='resume'?'The current cart will be replaced by the held order.':'This held order will be removed.'} onClose={()=>setConfirm(null)} onConfirm={()=>{if(confirm?.action==='resume')resume(confirm.id,true);else if(confirm)holdService.remove(confirm.id);}}/>
 </>;
}
