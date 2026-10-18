import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {Modal} from '../common/Modal';
import {errorMessage} from '../../services/toastService';
const schema=z.object({text:z.string().max(2000)});
export function OrderTextModal({title,initial='',label,onSave,onClose}:{title:string;initial?:string;label:string;onSave:(value:string)=>void;onClose:()=>void}) {
 const [error,setError]=useState('');const {register,handleSubmit,formState:{errors}}=useForm<z.infer<typeof schema>>({resolver:zodResolver(schema),defaultValues:{text:initial}});
 return <Modal open title={title} onClose={onClose}><form onSubmit={handleSubmit(v=>{try{onSave(v.text);onClose();}catch(e){setError(errorMessage(e));}})}><label className="block">{label}<textarea className="mt-2 w-full rounded-lg border border-slate-200 bg-transparent p-3 dark:border-slate-700" rows={3} {...register('text')}/></label>{(error||errors.text)&&<p role="alert" className="my-2 text-red-500">{error||errors.text?.message}</p>}<button className="btn-primary mt-4">Save</button></form></Modal>;
}
