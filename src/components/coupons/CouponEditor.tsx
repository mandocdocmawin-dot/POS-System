import {useState} from 'react';
import {Modal} from '../common/Modal';
import {SettingText,SettingNumber,SettingSelect,SettingToggle} from '../settings/SettingFields';
import {couponService} from '../../services/couponService';
import {productService} from '../../services/productService';
import {categoryService} from '../../services/categoryService';
import {branches} from '../../store/useBranchStore';
import type {Coupon} from '../../types/settings';
import {formatMoney} from '../../utils/formatters';
import {errorMessage} from '../../services/toastService';
export function CouponEditor({initial,onClose}:{initial:Coupon;onClose:()=>void}) {
 const [s,change]=useState(initial),[error,setError]=useState('');const used=couponService.list().find(c=>c.id===s.id)?.usedCount??0;
 const list=(label:string,options:{id:string;name:string}[],value:string[],update:(v:string[])=>void)=><fieldset className="space-y-2"><legend className="font-medium">{label} (empty = all)</legend><div className="flex max-h-36 flex-wrap gap-3 overflow-auto">{options.map(o=><label key={o.id} className="flex gap-2 text-sm"><input type="checkbox" checked={value.includes(o.id)} onChange={e=>update(e.target.checked?[...value,o.id]:value.filter(x=>x!==o.id))}/>{o.name}</label>)}</div></fieldset>;
 return <Modal open title="Coupon" onClose={onClose}><form className="space-y-5" onSubmit={e=>{e.preventDefault();try{couponService.save(s);onClose();}catch(cause){setError(errorMessage(cause));}}}>
 <fieldset disabled={used>0} className="flex items-end gap-2"><SettingText label="Code" value={s.code} onChange={v=>change({...s,code:v.toUpperCase()})}/><button type="button" className="btn" onClick={()=>change({...s,code:couponService.generateCode()})}>Generate</button></fieldset>
 <div className="grid gap-4 sm:grid-cols-2"><SettingText label="Name" value={s.name} onChange={v=>change({...s,name:v})}/><SettingText label="Description" value={s.description??''} onChange={v=>change({...s,description:v})}/><SettingSelect label="Type" value={s.type} options={['percent','fixed']} onChange={v=>change({...s,type:v})}/><SettingNumber label={s.type==='percent'?'Percent':'Fixed discount (centavos)'} value={s.value} onChange={v=>change({...s,value:v})}/><SettingNumber label="Minimum spend (centavos)" value={s.minSubtotal} onChange={v=>change({...s,minSubtotal:v})}/>{s.type==='percent'&&<SettingNumber label="Maximum discount (centavos; 0 = none)" value={s.maxDiscount??0} onChange={v=>change({...s,maxDiscount:v||undefined})}/>}{(['usageLimit','perCustomerLimit'] as const).map(k=><SettingNumber key={k} label={`${k} (0 = none)`} value={s[k]??0} step="1" onChange={v=>change({...s,[k]:v||undefined})}/>)}{(['startsAt','endsAt'] as const).map(k=><SettingText key={k} label={`${k} (local time)`} type="datetime-local" value={s[k]?new Date(new Date(s[k]).getTime()-new Date(s[k]).getTimezoneOffset()*60000).toISOString().slice(0,16):''} onChange={v=>change({...s,[k]:v?new Date(v).toISOString():undefined})}/>)}<SettingSelect label="Status" value={s.status} options={['active','inactive']} onChange={v=>change({...s,status:v})}/></div>
 <SettingToggle label="Exclude already discounted items" value={s.excludeDiscountedItems} onChange={v=>change({...s,excludeDiscountedItems:v})}/>
 {list('Eligible tiers',['Regular','Silver','Gold','Platinum'].map(id=>({id,name:id})),s.eligibleTiers??[],v=>change({...s,eligibleTiers:v as NonNullable<Coupon['eligibleTiers']>}))}
 {list('Categories',categoryService.list(),s.categoryIds??[],v=>change({...s,categoryIds:v}))}{list('Products',productService.list(),s.productIds??[],v=>change({...s,productIds:v}))}{list('Branches',branches.map(id=>({id,name:id})),s.branchIds??[],v=>change({...s,branchIds:v}))}
 <p className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">On a ₱1,000 eligible cart this gives {formatMoney(Math.min(100000,s.type==='fixed'?s.value:Math.round(1000*s.value),s.maxDiscount??Number.MAX_SAFE_INTEGER))} off (before validity checks).</p>
 {error&&<p role="alert" className="text-red-500">{error}</p>}<button className="btn-primary">Save coupon</button></form></Modal>;
}
