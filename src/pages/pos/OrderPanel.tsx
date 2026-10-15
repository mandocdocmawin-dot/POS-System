import {ShoppingBag} from 'lucide-react';
import {useLocalData} from '../../services/useLocalData';
import {posService} from '../../services/posService';
import {orderService} from '../../services/orderService';
import {formatPHP} from '../../utils/money';
export function OrderPanel(){
 useLocalData();const s=posService.state();
 return <aside aria-label="Current order" className="flex w-full shrink-0 flex-col border-l border-slate-200 bg-white p-5 xl:w-[380px] xl:overflow-y-auto 2xl:w-[420px] dark:border-slate-800 dark:bg-slate-900">
 <h2 className="border-b pb-4 text-sm font-semibold">Order ID: #{orderService.nextOrderNo()}</h2>
 <h3 className="my-5 text-sm font-semibold">Order Detail (Items: {s.cart.length})</h3>
 {s.cart.length?s.cart.map(l=><div key={l.id} className="border-b py-3 text-sm">{l.name} × {l.quantity} <span className="float-right">{formatPHP(l.unitPrice)}</span></div>):<div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-slate-400"><ShoppingBag size={65} strokeWidth={1}/><p>Your cart is empty</p><p className="text-xs">Select products to start a sale.</p></div>}
 </aside>;
}
