import {Modal} from '../common/Modal';
import type {Product} from '../../types/models';
import {productService} from '../../services/productService';
import {stockService} from '../../services/stockService';
import {formatPHP} from '../../utils/money';
export function VariantPicker({product,onChoose,onClose}:{product:Product|null;onChoose:(id:string)=>void;onClose:()=>void}){
 return <Modal open={!!product} title={`Choose variant · ${product?.name??''}`} onClose={onClose}><div className="space-y-2">{product&&productService.variants(product.id).map(v=>{const stock=stockService.getStock(product.id,v.id);return <button key={v.id} disabled={stock<=0} className="btn flex w-full justify-between p-4 disabled:opacity-40" onClick={()=>onChoose(v.id)}><span>{v.name}<span className="block text-xs text-slate-400">{v.sku} · {stock} available</span></span><span>{formatPHP(v.sellingPrice)}</span></button>;})}</div></Modal>;
}
