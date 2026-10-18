import type {Totals} from '../../types/pos';
import {formatPHP} from '../../utils/money';
import {useSettings} from '../../hooks/useSettings';
export function CartSummary({totals:t,onDiscount}:{totals:Totals;onDiscount:()=>void}){
 const tax=useSettings(s=>s.tax);
 return <div className="mt-4 space-y-3 rounded-lg bg-slate-50 p-4 text-xs dark:bg-slate-800"><div className="flex justify-between"><span>Subtotal</span><span>{formatPHP(t.subtotal)}</span></div><div className="flex justify-between"><span>Item discounts</span><span>−{formatPHP(t.itemDiscountTotal)}</span></div><button className="flex w-full justify-between text-indigo-500" onClick={onDiscount}><span>Order discount · Edit</span><span>−{formatPHP(t.orderDiscount.amount)}</span></button><div className="flex justify-between text-slate-500"><span>{tax.vatRegistered?'Tax (VAT '+(tax.mode==='inclusive'?'incl.':'excl.')+')':'NON-VAT'}</span><span>{formatPHP(t.taxTotal)}</span></div><div className="flex justify-between border-t border-dashed border-slate-300 pt-4 text-lg font-semibold dark:border-slate-600"><span>Grand Total</span><span>{formatPHP(t.grandTotal)}</span></div></div>;
}
