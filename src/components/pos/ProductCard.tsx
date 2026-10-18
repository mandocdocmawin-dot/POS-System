import {branchService} from '../../services/branchService';
import {useSettings} from '../../hooks/useSettings';
import {Plus} from 'lucide-react';
import type {Product} from '../../types/models';
import {ProductImage} from '../common/ProductImage';
import {stockService} from '../../services/stockService';
import {formatPHP} from '../../utils/money';
export function ProductCard({product:p,onAdd}:{product:Product;onAdd:()=>void}) {
 const showStock=useSettings(s=>s.pos.showStockOnCards);
 const stock=stockService.getStock(p.id,undefined,branchService.activeId());
 return <button type="button" onClick={onAdd} disabled={stock<=0} aria-label={`Add ${p.name}`} className={`card text-left p-3 transition hover:border-indigo-400 focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed ${stock<=0?'opacity-50':''}`}>
 <div className="pos-product-art"><ProductImage imageId={p.imageId} name={p.name} large/></div><h2 className="mb-1 mt-3 truncate text-xs font-medium">{p.name}</h2><p className="text-xs text-slate-500">SKU: {p.sku}</p>{showStock&&<p className={`mt-1 text-xs ${stock<=0?'text-red-500':'text-slate-500'}`}>{stock<=0?'Out of stock':`${stock} available`}{p.hasVariants?' · Variants':''}</p>}
 <div className="mt-4 flex items-center justify-between"><span className="text-sm font-semibold">{formatPHP(p.sellingPrice)}</span><span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white"><Plus size={16}/></span></div></button>;
}
