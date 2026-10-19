import { T } from "../../i18n/T";
import {Minus,Plus,ShoppingCart,ShoppingBag} from 'lucide-react';
import {Popover} from '../common/Popover';
import {ProductImage} from '../common/ProductImage';
import {useLocalData} from '../../services/useLocalData';
import {posService,decimalUnit} from '../../services/posService';
import {formatPHP} from '../../utils/money';
import {toast,errorMessage} from '../../services/toastService';
export function CartPopover(){
 useLocalData();const cart=posService.state().cart,totals=posService.totals();
 const change=(id:string,quantity:number)=>{try{posService.quantity(id,quantity);}catch(error){toast.error(errorMessage(error));}};
 return <Popover label={`Cart, ${cart.length} items`} trigger={<span className="relative"><ShoppingCart size={18}/>{cart.length>0&&<span className="absolute -right-2 -top-2 min-w-4 rounded-full bg-red-600 px-1 text-[10px] text-white">{cart.length}</span>}</span>}>
  <section className="w-[min(28rem,calc(100vw-3.5rem))]"><header className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-700"><h2 className="font-semibold"><T text={"Cart"}/></h2><span className="rounded bg-slate-100 px-2 py-1 text-xs dark:bg-slate-800">{cart.length}<T text={" items"}/></span></header>
   <div className="max-h-[min(23rem,50dvh)] overflow-y-auto">{totals.items.map(line=><div key={line.id} className="flex items-center gap-3 border-b border-slate-100 p-4 dark:border-slate-700"><ProductImage imageId={line.imageId} name={line.name}/><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium" title={line.name}>{line.name}</p><p className="mt-1 text-xs text-slate-500">{line.variantName??line.sku}</p><div className="mt-2 inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-700"><button className="p-1.5 disabled:opacity-40" aria-label={`Cart decrease ${line.name}`} disabled={line.quantity<=(decimalUnit(line.unitShortName)?0.001:1)} onClick={e=>{e.stopPropagation();change(line.id,Math.max(decimalUnit(line.unitShortName)?0.001:1,line.quantity-1));}}><Minus size={14}/></button><span className="min-w-8 text-center text-xs">{line.quantity}</span><button className="p-1.5" aria-label={`Cart increase ${line.name}`} onClick={e=>{e.stopPropagation();change(line.id,line.quantity+1);}}><Plus size={14}/></button></div></div><strong className="shrink-0 text-sm">{formatPHP(line.lineTotal)}</strong></div>)}{!cart.length&&<div className="flex flex-col items-center gap-3 px-5 py-10 text-slate-500"><ShoppingBag size={32}/><p><T text={"Your cart is empty."}/></p><p className="text-xs"><T text={"Select a product to add it."}/></p></div>}</div>
   <footer className="flex items-center justify-between p-4"><span className="text-sm text-slate-500"><T text={"Grand total"}/></span><strong>{formatPHP(totals.grandTotal)}</strong></footer>
  </section>
 </Popover>;
}
