import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {discountSchema,type Discount} from '../../types/pos';
import {errorMessage} from '../../services/toastService';
export function DiscountEditor({value,onSave,onClose}:{value:Discount;onSave:(value:Discount)=>void;onClose:()=>void}){
 const [error,setError]=useState('');
 const {register,handleSubmit,formState:{errors}}=useForm<Discount>({resolver:zodResolver(discountSchema),defaultValues:value});
 return <form className="my-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-800" onSubmit={handleSubmit(v=>{try{onSave(v);onClose();}catch(e){setError(errorMessage(e));}})}>
 <div className="flex gap-2"><select className="min-w-0 flex-1" aria-label="Discount type" {...register('type')}><option value="percent">Percent (%)</option><option value="fixed">Amount (₱)</option></select><input className="w-24" aria-label="Discount value" type="number" min="0" step="0.01" {...register('value',{valueAsNumber:true})}/></div>
 {(error||errors.value)&&<p role="alert" className="text-xs text-red-500">{error||errors.value?.message}</p>}
 <div className="mt-2 flex gap-2"><button type="submit" className="btn-primary px-3 py-1 text-xs">Apply</button><button type="button" className="btn text-xs" onClick={onClose}>Cancel</button></div><p className="mt-2 text-xs text-slate-400">Discounts are capped at the amount they apply to.</p></form>;
}
