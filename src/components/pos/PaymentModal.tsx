import {useState} from 'react';
import {useFieldArray,useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {Modal} from '../common/Modal';
import {posService} from '../../services/posService';
import {customerService} from '../../services/customerService';
import {calculatePayments,fromCentavos,toCentavos,sumCentavos} from '../../utils/pos';
import {formatPHP} from '../../utils/money';
import {errorMessage} from '../../services/toastService';
import {PAYMENT_METHODS} from '../../config/pos';
import type {Payment} from '../../types/pos';
const rowSchema=z.object({method:z.enum(['cash','gcash','maya','card','bank']),amount:z.number().finite().nonnegative(),reference:z.string().max(120)});
const schema=z.object({rows:z.array(rowSchema).min(1).max(20),dueDate:z.union([z.literal(''),z.string().regex(/^\d{4}-\d{2}-\d{2}$/)])});
type FormValues=z.infer<typeof schema>;
export function PaymentModal({onClose,onComplete,payLater=false}:{onClose:()=>void;onComplete?:(payments:Payment[],dueDate?:string)=>void;payLater?:boolean}) {
 const total=posService.totals().grandTotal;
 const [error,setError]=useState('');
 const {register,watch,setValue,control,handleSubmit,formState:{isSubmitting,errors}}=useForm<FormValues>({resolver:zodResolver(schema),defaultValues:{rows:[{method:'cash',amount:payLater?0:total,reference:''}],dueDate:''}});
 const {fields,append,remove}=useFieldArray({control,name:'rows'});
 const rows=watch('rows');
 const parsed=schema.safeParse({rows,dueDate:watch('dueDate')});
 const payments:Payment[]=parsed.success?parsed.data.rows.map((p,i)=>({...p,id:`preview-${i}`,createdAt:new Date().toISOString()})):[];
 let result:ReturnType<typeof calculatePayments>|null=null,validation='';
 try{if(parsed.success)result=calculatePayments(total,payments);else validation='Enter a valid non-negative amount for every payment.';}catch(e){validation=errorMessage(e);}
 const remaining=result?.balanceDue??total;
 return <Modal open title={payLater?'Pay Later':'Payment'} onClose={onClose}><form onSubmit={handleSubmit(values=>{if(!onComplete||!result||(!payLater&&result.balanceDue>0))return;try{onComplete(payments.filter(p=>p.amount>0).map(p=>({...p,id:crypto.randomUUID()})),values.dueDate||undefined);}catch(e){setError(errorMessage(e));}})}>
  <p className="text-sm text-slate-500">{customerService.get(posService.state().customerId)?.name}</p><p className="my-3 text-3xl font-semibold">{formatPHP(total)}</p>
  <p className="mb-4 text-xs text-slate-400">Record payments received by the cashier. Non-cash methods do not process or verify payments.</p>
  {payLater&&<div className="mb-4 rounded-lg bg-amber-50 p-3 text-sm dark:bg-amber-500/10"><p>Down payment is optional. The balance is added to this customer’s credit balance.</p><label className="mt-3 block">Due date (informational)<input type="date" className="ml-3" {...register('dueDate')}/></label></div>}
  <div className="space-y-4">{fields.map((field,index)=>{const method=rows[index]?.method??'cash';return <fieldset key={field.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"><legend className="px-1 text-xs">Payment {index+1}</legend>
   <div className="mb-3 flex flex-wrap gap-1">{PAYMENT_METHODS.map(m=><button key={m.id} type="button" aria-pressed={method===m.id} className={`rounded-lg border px-2 py-2 text-xs ${method===m.id?'border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15':'border-slate-200 dark:border-slate-700'}`} onClick={()=>{setValue(`rows.${index}.method`,m.id);const before=sumCentavos(rows.slice(0,index).map(r=>Number.isFinite(r.amount)&&r.amount>=0?toCentavos(r.amount):0));setValue(`rows.${index}.amount`,fromCentavos(Math.max(0,toCentavos(total)-before)));}}>{m.label}</button>)}</div>
   <label className="block text-sm">{method==='cash'?'Amount received':'Amount'}<input autoFocus={index===0} aria-label={`Payment ${index+1} amount`} type="number" step="0.01" min="0" className="mt-2 w-full" {...register(`rows.${index}.amount`,{valueAsNumber:true})}/></label>
   {method==='cash'?<div className="my-3 flex flex-wrap gap-1"><button type="button" className="btn text-xs" onClick={()=>{const prior=sumCentavos(rows.slice(0,index).map(r=>Number.isFinite(r.amount)&&r.amount>=0?toCentavos(r.amount):0));setValue(`rows.${index}.amount`,fromCentavos(Math.max(0,toCentavos(total)-prior)));}}>Exact amount</button>{[50,100,500,1000].map(bill=>{const prior=sumCentavos(rows.slice(0,index).map(r=>Number.isFinite(r.amount)&&r.amount>=0?toCentavos(r.amount):0));const value=fromCentavos(Math.ceil(Math.max(0,toCentavos(total)-prior)/(bill*100))*bill*100);return <button key={bill} type="button" className="btn text-xs" onClick={()=>setValue(`rows.${index}.amount`,value)}>₱{bill} → {formatPHP(value)}</button>;})}</div>:<label className="mt-3 block text-sm">Reference no. (optional)<input className="mt-1 w-full" maxLength={120} {...register(`rows.${index}.reference`)}/></label>}
   {fields.length>1&&<button type="button" className="mt-2 text-xs text-red-500" onClick={()=>remove(index)}>Remove payment</button>}
   {errors.rows?.[index]?.reference&&<p className="text-xs text-red-500">{errors.rows[index]?.reference?.message}</p>}
  </fieldset>;})}</div>
  <button type="button" disabled={fields.length>=20||remaining===0||!result} className="btn mt-3 disabled:opacity-40" onClick={()=>append({method:'gcash',amount:remaining,reference:''})}>Add another payment</button>
  <div className="my-4 flex justify-between"><span>Change</span><strong>{formatPHP(result?.change??0)}</strong></div><div className="my-4 flex justify-between"><span>Remaining</span><strong>{formatPHP(remaining)}</strong></div>
  {(error||validation)&&<p role="alert" className="my-3 text-red-500">{error||validation}</p>}
  <button className="btn-primary w-full disabled:opacity-40" disabled={!onComplete||!result||(!payLater&&remaining>0)||isSubmitting}>{payLater?'Save Pay Later':'Complete Sale'}</button>
 </form></Modal>;
}
