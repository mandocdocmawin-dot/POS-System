import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {supplierSchema,type Supplier} from '../../types/phase4';
import {supplierService} from '../../services/supplierService';
const schema=supplierSchema.omit({id:true,createdAt:true});
type Values=z.infer<typeof schema>;
export function SupplierEditor({supplier,onSave}:{supplier?:Supplier;onSave:(s:Supplier)=>void}){const [error,setError]=useState('');const {register,handleSubmit,formState:{errors}}=useForm<Values>({resolver:zodResolver(schema),defaultValues:supplier??{name:'',contactPerson:'',phone:'',email:'',address:'',notes:'',status:'active'}});return <form className="space-y-4" onSubmit={handleSubmit(v=>{try{onSave(supplierService.save(v,supplier?.id));}catch(e){setError(e instanceof Error?e.message:'Save failed.');}})}><div className="grid gap-4 sm:grid-cols-2">{(['name','companyName','contactPerson','phone','email','address','country'] as const).map(key=><label className="grid gap-1" key={key}>{({name:'Supplier name',companyName:'Company name',country:'Country',contactPerson:'Contact person',phone:'Phone',email:'Email',address:'Address'})[key]}<input {...register(key)}/>{errors[key]&&<span className="text-sm text-red-500">{errors[key]?.message}</span>}</label>)}<label className="grid gap-1">Status<select {...register('status')}><option>active</option><option>inactive</option></select></label></div><label className="grid gap-1">Notes<textarea {...register('notes')}/></label>{error&&<p role="alert" className="text-red-500">{error}</p>}<button className="btn-primary">Save Supplier</button></form>;}
