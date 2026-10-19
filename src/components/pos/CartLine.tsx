import { T } from "../../i18n/T";
import {DiscountEditor} from './DiscountEditor';
import {useState} from 'react';
import {Minus,Plus,Trash2,Percent} from 'lucide-react';
import type {OrderLine} from '../../types/pos';
import {posService,decimalUnit} from '../../services/posService';
import {toast,errorMessage} from '../../services/toastService';
import {ProductImage} from '../common/ProductImage';
import {formatPHP} from '../../utils/money';
export function CartLine({line:l,selected,onSelect}:{line:OrderLine;selected:boolean;onSelect:()=>void}) {
 const [editing,setEditing]=useState(false);
 const [quantity,setQuantity]=useState(String(l.quantity));
 const change=(q:number)=>{try{posService.quantity(l.id,q);}catch(e){toast.error(errorMessage(e));}setQuantity(String(posService.state().cart.find(x=>x.id===l.id)?.quantity??q));};
 return <div onFocus={onSelect} className={`border-b border-slate-100 py-4 dark:border-slate-800 ${selected?'border-l-2 border-l-indigo-500 pl-2':''}`}>
 <div className="flex gap-2"><ProductImage imageId={l.imageId} name={l.name}/><div className="min-w-0 flex-1"><button className="text-left text-xs font-semibold" aria-pressed={selected} onClick={onSelect}>{l.name}</button><p className="text-xs text-slate-400">{l.variantName??l.sku}</p><p className="mt-1 text-xs">{formatPHP(l.unitPrice)} / {l.unitShortName}</p></div><button aria-label={`Remove ${l.name}`} className="self-start p-1 text-red-400" onClick={()=>posService.remove(l.id)}><Trash2 size={15}/></button></div>
 <div className="mt-3 flex items-center justify-between"><div className="flex items-center gap-1"><button className="btn p-1.5" disabled={l.quantity<=1} aria-label={`Decrease ${l.name}`} onClick={()=>change(Math.max(decimalUnit(l.unitShortName)?0.001:1,l.quantity-1))}><Minus size={13}/></button><input aria-label={`Quantity for ${l.name}`} className="w-16 text-center text-xs" type="number" min={decimalUnit(l.unitShortName)?0.001:1} step={decimalUnit(l.unitShortName)?'any':1} value={quantity} onChange={e=>setQuantity(e.target.value)} onBlur={()=>change(Number(quantity))} onKeyDown={e=>{if(e.key==='Enter')e.currentTarget.blur();}}/><button className="btn p-1.5" aria-label={`Increase ${l.name}`} onClick={()=>change(l.quantity+1)}><Plus size={13}/></button></div><strong className="text-sm">{formatPHP(l.lineTotal)}</strong></div>
 <button className="mt-2 flex items-center gap-1 text-xs text-indigo-500" aria-label={`Discount ${l.name}`} onClick={()=>setEditing(v=>!v)}><Percent size={12}/><T text={"Discount "}/>{l.lineDiscount>0?formatPHP(l.lineDiscount):''}</button>{editing&&<DiscountEditor value={{type:l.discountType??'percent',value:l.discountValue??0}} onSave={(v,approver)=>{posService.lineDiscount(l.id,v,approver);}} onClose={()=>setEditing(false)}/>}
 </div>;
}
