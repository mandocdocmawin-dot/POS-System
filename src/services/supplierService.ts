import {useSupplierStore} from '../store/useSupplierStore';
import {usePurchaseStore} from '../store/usePurchaseStore';
import {supplierSchema,type Supplier} from '../types/phase4';
import {supplierBalance} from '../utils/supplierBalance';
import {aging} from '../utils/aging';
import {localTransaction} from './localTransaction';
import {activityService} from './activityService';
export const supplierService={
 list:()=>structuredClone(useSupplierStore.getState().suppliers),
 get:(id:string)=>structuredClone(useSupplierStore.getState().suppliers.find(s=>s.id===id)),
 save:(input:Omit<Supplier,'id'|'createdAt'>,id?:string)=>{const old=id?supplierService.get(id):undefined;if(id&&!old)throw new Error('Supplier not found.');const supplier=supplierSchema.parse({...input,id:id??crypto.randomUUID(),createdAt:old?.createdAt??new Date().toISOString()});return localTransaction(()=>{useSupplierStore.setState(s=>({suppliers:old?s.suppliers.map(x=>x.id===id?supplier:x):[...s.suppliers,supplier]}));activityService.log('supplier',supplier.id,old?'update':'create',`${old?'Updated':'Created'} ${supplier.name}`);return supplier;});},
 remove:(id:string)=>{if(usePurchaseStore.getState().purchases.some(p=>p.supplierId===id))throw new Error('Supplier has purchases. Deactivate instead.');return localTransaction(()=>{useSupplierStore.setState(s=>({suppliers:s.suppliers.filter(x=>x.id!==id)}));activityService.log('supplier',id,'delete','Supplier deleted');});},
 report:(id:string)=>{const s=usePurchaseStore.getState();const purchases=s.purchases.filter(p=>p.supplierId===id&&p.receiveStatus!=='cancelled');return {...supplierBalance(id,s.purchases,s.returns,s.payments),aging:aging(purchases),lastPurchase:purchases.map(p=>p.date).sort().at(-1)??'—'};},
};
