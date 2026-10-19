import { BookOpen, Boxes, CreditCard, Settings, ShoppingBag, Users } from 'lucide-react';
import type { Faq } from '../../types/phase8';
const icons=[BookOpen,ShoppingBag,Boxes,CreditCard,Users,Settings];
export function FaqCategories({faqs,selected,onSelect}:{faqs:Faq[];selected:string;onSelect:(category:string)=>void}) {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{[...new Set(faqs.map(f=>f.category))].map((category,index)=>{const Icon=icons[index%icons.length];return <button className={`card space-y-3 text-left transition-colors hover:border-indigo-400 ${selected===category?'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10':''}`} aria-pressed={selected===category} onClick={()=>onSelect(selected===category?'':category)} key={category}><Icon className="text-indigo-500" size={30}/><h2 className="font-semibold">{category}</h2><p className="text-sm">{faqs.filter(f=>f.category===category).length} articles · Browse answers →</p></button>;})}</div>;
}
