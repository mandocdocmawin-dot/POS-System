import { Pencil } from 'lucide-react';
import type { Customer } from '../../types/pos';
import { Avatar } from '../common/Avatar';
export function CustomerCard({customer,onSelect}:{customer:Customer|undefined;onSelect:()=>void}) {
 return <div className="my-4 flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-900 dark:bg-indigo-500/10">
  <Avatar name={customer?.name??'Walk-in Customer'} size="h-10 w-10"/>
  <div className="min-w-0 flex-1"><p className="text-sm font-semibold">{customer?.name??'Choose a customer'}</p><p className="mt-1 text-xs text-slate-500">{customer?.tier??'Regular'} · {customer?.points??0} points</p></div>
  <button className="btn p-2" aria-label="Select customer" onClick={onSelect}><Pencil size={14}/></button>
 </div>;
}
