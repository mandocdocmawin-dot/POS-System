import {useState} from 'react';
import {ShoppingBag,Trash2} from 'lucide-react';
import {useLocalData} from '../../services/useLocalData';
import {posService} from '../../services/posService';
import {orderService} from '../../services/orderService';
import {CartLine} from '../../components/pos/CartLine';
import {ConfirmDialog} from '../../components/common/ConfirmDialog';
export function OrderPanel(){
 useLocalData();const s=posService.state(),totals=posService.totals();
 const [selected,setSelected]=useState(''),[clear,setClear]=useState(false);
 return <aside aria-label="Current order" className="flex w-full shrink-0 flex-col border-l border-slate-200 bg-white p-5 xl:w-[380px] xl:overflow-y-auto 2xl:w-[420px] dark:border-slate-800 dark:bg-slate-900">
 <div className="flex items-center justify-between border-b pb-4"><h2 className="text-sm font-semibold">Order ID: #{orderService.nextOrderNo()}</h2><button className="btn text-red-500" aria-label="Clear cart" onClick={()=>setClear(true)}><Trash2 size={15}/></button></div>
 <div className="my-5 flex items-center justify-between"><h3 className="text-sm font-semibold">Order Detail (Items: {s.cart.length})</h3><button className="text-xs text-red-500" onClick={()=>setClear(true)}>Clear All</button></div>
 {s.cart.length?totals.items.map(l=><CartLine key={`${l.id}-${l.quantity}`} line={l} selected={selected===l.id} onSelect={()=>setSelected(l.id)}/>):<div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-slate-400"><ShoppingBag size={65} strokeWidth={1}/><p>Your cart is empty</p><p className="text-xs">Select products to start a sale.</p></div>}
 <ConfirmDialog open={clear} title="Clear current cart?" message="All current items, discounts, customer and notes will be cleared." onClose={()=>setClear(false)} onConfirm={()=>{posService.clear();}}/>
 </aside>;
}

