import { T } from "../../i18n/T";
import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {customerService,quickCustomerSchema} from '../../services/customerService';
import {posService} from '../../services/posService';
import {errorMessage,toast} from '../../services/toastService';
export function QuickCustomerForm({onClose,onSaved}:{onClose:()=>void;onSaved:()=>void}) {
 const [error,setError]=useState('');
 const {register,handleSubmit,formState:{errors,isSubmitting}}=useForm<z.infer<typeof quickCustomerSchema>>({resolver:zodResolver(quickCustomerSchema)});
 return <form className="space-y-4" onSubmit={handleSubmit(values=>{try{const customer=customerService.add(values);posService.customer(customer.id);toast.success('Customer added.');onSaved();}catch(e){setError(errorMessage(e));}})}>
  <label className="block text-sm"><T text={"Name"}/><input className="mt-1 w-full" {...register('name')}/>{errors.name&&<span className="text-xs text-red-500">{errors.name.message}</span>}</label>
  <label className="block text-sm"><T text={"Phone (optional)"}/><input className="mt-1 w-full" type="tel" {...register('phone')}/>{errors.phone&&<span className="text-xs text-red-500">{errors.phone.message}</span>}</label>
  {error&&<p role="alert" className="text-sm text-red-500">{error}</p>}
  <div className="flex justify-end gap-2"><button type="button" className="btn" onClick={onClose}><T text={"Back"}/></button><button disabled={isSubmitting} className="btn-primary">Save & select customer</button></div>
 </form>;
}
