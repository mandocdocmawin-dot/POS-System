import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {Modal} from '../common/Modal';
import {posService} from '../../services/posService';
import {customerService} from '../../services/customerService';
import {calculatePayments,fromCentavos,toCentavos} from '../../utils/pos';
import {formatPHP} from '../../utils/money';
import {errorMessage} from '../../services/toastService';
import type {Payment} from '../../types/pos';
const schema=z.object({amount:z.number().finite().nonnegative()});
export function PaymentModal({onClose,onComplete}:{onClose:()=>void;onComplete?:(payments:Payment[])=>void}) {
 const total=posService.totals().grandTotal;
 const [error,setError]=useState('');
 const {register,watch,setValue,handleSubmit,formState:{isSubmitting}}=useForm<z.infer<typeof schema>>({resolver:zodResolver(schema),defaultValues:{amount:total}});
 const amount=watch('amount');
 const payment:Payment={id:'cash-preview',method:'cash',amount,createdAt:new Date().toISOString()};
 const result=schema.safeParse({amount}).success?calculatePayments(total,[payment]):null;
 return <Modal open title="Payment" onClose={onClose}><form onSubmit={handleSubmit(()=>{if(!onComplete||!result||result.balanceDue>0)return;try{onComplete([{...payment,id:crypto.randomUUID()}]);}catch(e){setError(errorMessage(e));}})}>
  <p className="text-sm text-slate-500">{customerService.get(posService.state().customerId)?.name}</p><p className="my-3 text-3xl font-semibold">{formatPHP(total)}</p>
  <span className="mb-4 inline-block rounded-lg bg-indigo-50 px-4 py-2 text-indigo-600 dark:bg-indigo-500/15">Cash</span>
  <label className="block">Amount received<input autoFocus type="number" step="0.01" min="0" className="mt-2 w-full" {...register('amount',{valueAsNumber:true})}/></label>
  <div className="my-3 flex flex-wrap gap-2"><button type="button" className="btn text-xs" onClick={()=>setValue('amount',total)}>Exact amount</button>{[50,100,500,1000].map(bill=>{const value=fromCentavos(Math.ceil(toCentavos(total)/(bill*100))*bill*100);return <button key={bill} type="button" className="btn text-xs" onClick={()=>setValue('amount',value)}>₱{bill} → {formatPHP(value)}</button>;})}</div>
  <div className="my-4 flex justify-between"><span>Change</span><strong>{formatPHP(result?.change??0)}</strong></div><div className="my-4 flex justify-between"><span>Remaining</span><strong>{formatPHP(result?.balanceDue??total)}</strong></div>
  {error&&<p role="alert" className="my-3 text-red-500">{error}</p>}
  <button className="btn-primary w-full disabled:opacity-40" disabled={!onComplete||!result||result.balanceDue>0||isSubmitting}>Complete Sale</button>
 </form></Modal>;
}
