import {SimulatedGateway} from './SimulatedGateway';
import {useSettings} from '../../hooks/useSettings';
import {cashRounding} from '../../utils/cashRounding';
import {useState} from 'react';
import {useFieldArray,useForm,useWatch} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {Modal} from '../common/Modal';
import {posService} from '../../services/posService';
import {customerService} from '../../services/customerService';
import {calculatePayments,fromCentavos,toCentavos,sumCentavos} from '../../utils/pos';
import {formatPHP} from '../../utils/money';
import {errorMessage} from '../../services/toastService';

import type {Payment} from '../../types/pos';
const rowSchema=z.object({method:z.enum(['cash','gcash','maya','card','bank','wallet']),amount:z.number().finite().nonnegative(),reference:z.string().max(120)});
const schema=z.object({rows:z.array(rowSchema).min(1).max(20),dueDate:z.union([z.literal(''),z.string().regex(/^\d{4}-\d{2}-\d{2}$/)])});
type FormValues=z.infer<typeof schema>;
export function PaymentModal({onClose,onComplete,payLater=false}:{onClose:()=>void;onComplete?:(payments:Payment[],dueDate?:string)=>void;payLater?:boolean}) {
 const config=useSettings(s=>s.pos), PAYMENT_METHODS=useSettings(s=>s.payment.methods).filter(m=>m.enabled);
 const simulated=useSettings(s=>s.payment.simulatedGateway);
 const [gateway,setGateway]=useState<{payments:Payment[];dueDate?:string}>();
 const customer=customerService.get(posService.state().customerId);
 const walletBalance=customer&&!customer.isWalkIn?customer.walletBalance:0;
 const baseTotal=posService.totals().grandTotal;
 const [error,setError]=useState('');
 const {register,setValue,control,handleSubmit,formState:{isSubmitting,errors}}=useForm<FormValues>({resolver:zodResolver(schema),defaultValues:{rows:[{method:config.defaultPaymentMethod,amount:payLater?0:fromCentavos(cashRounding(toCentavos(baseTotal),[config.defaultPaymentMethod],config.cashRounding).total),reference:''}],dueDate:''}});
 const {fields,append,remove}=useFieldArray({control,name:'rows'});
 const rows=useWatch({control,name:'rows'});
 const rounded=cashRounding(toCentavos(baseTotal),rows.filter(r=>(r.amount??0)>0).map(r=>r.method??'cash'),config.cashRounding);
 const total=fromCentavos(rounded.total);
 const dueDate=useWatch({control,name:'dueDate'});
 const parsed=schema.safeParse({rows,dueDate});
 const payments:Payment[]=parsed.success?parsed.data.rows.map((p,i)=>({...p,id:`preview-${i}`,createdAt:new Date().toISOString()})):[];
 let result:ReturnType<typeof calculatePayments>|null=null,validation='';
 try{if(parsed.success)result=calculatePayments(total,payments);else validation='Enter a valid non-negative amount for every payment.';}catch(e){validation=errorMessage(e);}
 const walletUsed=payments.filter(p=>p.method==='wallet').reduce((n,p)=>n+toCentavos(p.amount),0);
 if(walletUsed>toCentavos(walletBalance)){validation='Wallet payments exceed the customer wallet balance.';result=null;}
 const remaining=result?.balanceDue??total;
 return <><Modal open title={payLater?'Pay Later':'Payment'} onClose={onClose}><form onSubmit={handleSubmit(values=>{if(!onComplete||!result||(!payLater&&result.balanceDue>0))return;try{const final=payments.filter(p=>p.amount>0).map(p=>({...p,id:crypto.randomUUID()}));if(simulated&&final.some(p=>['gcash','maya','card'].includes(p.method)))setGateway({payments:final,dueDate:values.dueDate||undefined});else onComplete(final,values.dueDate||undefined);}catch(e){setError(errorMessage(e));}})}>
  <p className="text-sm text-slate-500">{customerService.get(posService.state().customerId)?.name}</p><p className="text-xs text-slate-500">Wallet available: {formatPHP(walletBalance)}</p><p className="my-3 text-3xl font-semibold">{formatPHP(total)}</p>
  <p className="mb-4 text-xs text-slate-400">Record payments received by the cashier. Non-cash methods do not process or verify payments.</p>
  {payLater&&<div className="mb-4 rounded-lg bg-amber-50 p-3 text-sm dark:bg-amber-500/10"><p>Down payment is optional. The balance is added to this customer’s credit balance.</p><label className="mt-3 block">Due date (informational)<input type="date" className="ml-3" {...register('dueDate')}/></label></div>}
  <div className="space-y-4">{fields.map((field,index)=>{const method=rows[index]?.method??'cash';return <fieldset key={field.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"><legend className="px-1 text-xs">Payment {index+1}</legend>
   <div className="mb-3 flex flex-wrap gap-1">{PAYMENT_METHODS.map(m=><button key={m.id} disabled={m.id==='wallet'&&walletBalance<=0} type="button" aria-pressed={method===m.id} className={`rounded-lg border px-2 py-2 text-xs ${method===m.id?'border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15':'border-slate-200 dark:border-slate-700'}`} onClick={()=>{setValue(`rows.${index}.method`,m.id);const before=sumCentavos(rows.slice(0,index).map(r=>Number.isFinite(r.amount)&&r.amount>=0?toCentavos(r.amount):0));setValue(`rows.${index}.amount`,fromCentavos(Math.min(Math.max(0,toCentavos(total)-before),m.id==='wallet'?Math.max(0,toCentavos(walletBalance)-rows.filter((r,i)=>i!==index&&r.method==='wallet').reduce((n,r)=>n+toCentavos(r.amount||0),0)):Number.MAX_SAFE_INTEGER)));}}>{m.label}</button>)}</div>
   <label className="block text-sm">{method==='cash'?'Amount received':'Amount'}<input autoFocus={index===0} aria-label={`Payment ${index+1} amount`} type="number" step="0.01" min="0" className="mt-2 w-full" {...register(`rows.${index}.amount`,{valueAsNumber:true})}/></label>
   {method==='cash'?<div className="my-3 flex flex-wrap gap-1"><button type="button" className="btn text-xs" onClick={()=>{const prior=sumCentavos(rows.slice(0,index).map(r=>Number.isFinite(r.amount)&&r.amount>=0?toCentavos(r.amount):0));setValue(`rows.${index}.amount`,fromCentavos(Math.max(0,toCentavos(total)-prior)));}}>Exact amount</button>{config.quickCashAmounts.map(bill=>{const prior=sumCentavos(rows.slice(0,index).map(r=>Number.isFinite(r.amount)&&r.amount>=0?toCentavos(r.amount):0));const value=fromCentavos(Math.ceil(Math.max(0,toCentavos(total)-prior)/(bill*100))*bill*100);return <button key={bill} type="button" className="btn text-xs" onClick={()=>setValue(`rows.${index}.amount`,value)}>₱{bill} → {formatPHP(value)}</button>;})}</div>:<label className="mt-3 block text-sm">Reference no.<input className="mt-1 w-full" maxLength={120} {...register(`rows.${index}.reference`)}/></label>}
   {fields.length>1&&<button type="button" className="mt-2 text-xs text-red-500" onClick={()=>remove(index)}>Remove payment</button>}
   {errors.rows?.[index]?.reference&&<p className="text-xs text-red-500">{errors.rows[index]?.reference?.message}</p>}
  </fieldset>;})}</div>
  <button type="button" disabled={fields.length>=20||remaining===0||!result} className="btn mt-3 disabled:opacity-40" onClick={()=>append({method:PAYMENT_METHODS.find(m=>m.id!=='wallet')?.id??'cash',amount:remaining,reference:''})}>Add another payment</button>
  <div className="my-4 flex justify-between"><span>Change</span><strong>{formatPHP(result?.change??0)}</strong></div><div className="my-4 flex justify-between"><span>Remaining</span><strong>{formatPHP(remaining)}</strong></div>
  {(error||validation)&&<p role="alert" className="my-3 text-red-500">{error||validation}</p>}
  <button className="btn-primary w-full disabled:opacity-40" disabled={!onComplete||!result||(!payLater&&remaining>0)||isSubmitting}>{payLater?'Save Pay Later':'Complete Sale'}</button>
 </form></Modal>{gateway&&<SimulatedGateway onFailure={()=>{setGateway(undefined);setError('Simulated payment failed. Try again.');}} onSuccess={reference=>{try{onComplete?.(gateway.payments.map(p=>['gcash','maya','card'].includes(p.method)?{...p,reference}:p),gateway.dueDate);setGateway(undefined);}catch(cause){setGateway(undefined);setError(errorMessage(cause));}}}/>}</>;
}
