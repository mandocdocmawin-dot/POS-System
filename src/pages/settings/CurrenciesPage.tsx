import { T } from "../../i18n/T";
import { useState } from 'react';
import { SettingsPage, SettingsCard } from '../../components/settings/SettingsPage';
import { SettingText, SettingNumber, SettingSelect } from '../../components/settings/SettingFields';
import { Modal } from '../../components/common/Modal';
import { currencySchema, type Currency } from '../../types/settings';
import { formatMoney } from '../../utils/formatters';
import { multiplyCentavos, toCentavos } from '../../utils/pos';
import { errorMessage } from '../../services/toastService';
export function Component(){
 const [edit,setEdit]=useState<Currency>(),[error,setError]=useState(''),[amount,setAmount]=useState(10),[currency,setCurrency]=useState('usd');
 return <SettingsPage section="currency" title="Currencies">{(s,change)=><>
 <p className="rounded-lg border border-amber-300 p-4">Changing the base currency format does not convert stored amounts. Exchange rates are manual display references.</p>
 <SettingsCard title="Base currency format">{(['code','symbol','thousandSeparator','decimalSeparator'] as const).map(k=><SettingText key={k} label={k.replace(/([A-Z])/g,' $1')} value={s.base[k]} onChange={v=>change({...s,base:{...s.base,[k]:v}})}/>)}<SettingSelect label="Symbol position" value={s.base.position} options={['before','after']} onChange={v=>change({...s,base:{...s.base,position:v}})}/><SettingNumber label="Decimals" value={s.base.decimals} max={3} step="1" onChange={v=>change({...s,base:{...s.base,decimals:v}})}/><p aria-live="polite"><T text={"Preview: "}/>{Number.isInteger(s.base.decimals)&&s.base.decimals>=0&&s.base.decimals<=3?formatMoney(123456,s.base):'Choose 0–3 decimals'}</p></SettingsCard>
 <section className="card space-y-4"><div className="flex justify-between"><h2 className="text-lg font-semibold">Other currencies</h2><button className="btn" onClick={()=>setEdit({id:crypto.randomUUID(),code:'',name:'',symbol:'',rateToBase:1,status:'active'})}><T text={"Add currency"}/></button></div>{s.others.map(c=><div key={c.id} className="flex flex-wrap items-center justify-between gap-3 border-b py-3 dark:border-slate-700"><span>{c.code} · {c.name} ({c.symbol}) · 1 = {c.rateToBase} {s.base.code} · {c.status}</span><button className="btn" onClick={()=>setEdit(c)}><T text={"Edit"}/></button></div>)}</section>
 <SettingsCard title="Reference converter"><SettingNumber label="Foreign amount" value={amount} onChange={setAmount}/><SettingSelect label="Currency" value={currency} options={s.others.filter(c=>c.status==='active').map(c=>c.id)} onChange={setCurrency}/><output>{formatMoney(multiplyCentavos(toCentavos(amount),s.others.find(c=>c.id===currency)?.rateToBase??1),s.base)}</output></SettingsCard>
 <Modal open={!!edit} title="Currency" onClose={()=>setEdit(undefined)}>{edit&&<form className="space-y-4" onSubmit={e=>{e.preventDefault();try{const c=currencySchema.parse(edit);if(s.others.some(x=>x.id!==c.id&&x.code===c.code)||c.code===s.base.code)throw new Error('Currency code must be unique.');change({...s,others:s.others.some(x=>x.id===c.id)?s.others.map(x=>x.id===c.id?c:x):[...s.others,c]});setEdit(undefined);setError('');}catch(cause){setError(errorMessage(cause));}}}>{(['code','name','symbol'] as const).map(k=><SettingText key={k} label={k} value={edit[k]} onChange={v=>setEdit({...edit,[k]:k==='code'?v.toUpperCase():v})}/>)}<SettingNumber label="Manual rate to base" value={edit.rateToBase} onChange={v=>setEdit({...edit,rateToBase:v})}/><SettingSelect label="Status" value={edit.status} options={['active','inactive']} onChange={v=>setEdit({...edit,status:v})}/>{error&&<p role="alert">{error}</p>}<button className="btn-primary">Apply to draft</button></form>}</Modal>
 </>}</SettingsPage>;
}
