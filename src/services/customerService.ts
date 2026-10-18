import {settingsService} from './settingsService';
import {requirePermission} from './authService';
import {customerFormSchema,type CustomerFormValues} from '../types/customer';
import {walletService} from './walletService';
import {localTransaction} from './localTransaction';
import {useOrderStore} from '../store/useOrderStore';
import {activityService} from './activityService';
import {z} from 'zod';
import {useCustomerStore} from '../store/useCustomerStore';
import {WALK_IN_ID} from '../config/pos';
import {customerSchema,type Customer} from '../types/pos';
import {toCentavos,fromCentavos,sumCentavos} from '../utils/pos';
export const quickCustomerSchema=z.object({name:z.string().trim().min(1,'Name is required.').max(120),phone:z.string().trim().max(40).optional()});
export const customerService={
 stats:(id:string)=>{const orders=useOrderStore.getState().orders.filter(o=>o.customerId===id&&o.orderStatus!=='cancelled');return {count:orders.length,spent:fromCentavos(orders.reduce((n,o)=>n+toCentavos(o.grandTotal)-toCentavos(o.refundedTotal),0))};},
 list:(query='')=>structuredClone(useCustomerStore.getState().customers.filter(c=>`${c.name} ${c.phone??''}`.toLowerCase().includes(query.toLowerCase()))),
 get:(id=WALK_IN_ID)=>structuredClone(useCustomerStore.getState().customers.find(c=>c.id===id)),
 add:(input:z.infer<typeof quickCustomerSchema>)=>{requirePermission('customers:edit');const fields=quickCustomerSchema.parse(input);const c=customerSchema.parse({...fields,id:crypto.randomUUID(),points:0,tier:'Regular',creditBalance:0,createdAt:new Date().toISOString()});return localTransaction(()=>{useCustomerStore.setState(s=>({customers:[...s.customers,c]}));activityService.log("customer",c.id,"create",`Created ${c.name}`);return c;});},
 update:(id:string,fields:Partial<Pick<Customer,'name'|'phone'|'email'|'address'|'notes'|'status'>>)=>{requirePermission('customers:manage');const c=customerService.get(id);if(!c)throw new Error('Customer not found.');if(c.isWalkIn)throw new Error('Walk-in Customer cannot be edited.');const updated=customerSchema.parse({...c,...fields});return localTransaction(()=>{useCustomerStore.setState(s=>({customers:s.customers.map(c=>c.id===id?updated:c)}));activityService.log("customer",id,"update",`Updated ${updated.name}`);return updated;});},
 saveProfile:(input:CustomerFormValues,id?:string)=>{const fields=customerFormSchema.parse(input);return localTransaction(()=>{const c=id?customerService.update(id,{...fields,email:fields.email||undefined}):customerService.add(fields);if(!id){useCustomerStore.setState(s=>({customers:s.customers.map(x=>x.id===c.id?customerSchema.parse({...x,...fields,email:fields.email||undefined}):x)}));if(fields.openingWallet>0)walletService.change({customerId:c.id,type:'topup',amount:fields.openingWallet,method:'cash',note:'Opening wallet balance'});}return customerService.get(c.id)!;});},
 remove:(id:string)=>{requirePermission('customers:manage');const c=customerService.get(id);if(!c||c.isWalkIn||id===WALK_IN_ID)throw new Error('Walk-in Customer cannot be deleted.');if(useOrderStore.getState().orders.some(o=>o.customerId===id)||c.walletBalance||c.creditBalance)throw new Error('Customer has orders or balances. Deactivate instead.');return localTransaction(()=>{useCustomerStore.setState(s=>({customers:s.customers.filter(x=>x.id!==id)}));activityService.log('customer',id,'delete','Customer deleted');});},
 recordSale:(id:string,paid:number,balance:number)=>{
 const c=customerService.get(id);if(!c)throw new Error('Customer no longer exists.');
 if(c.isWalkIn){if(toCentavos(balance)>0)throw new Error('Pay Later requires a named customer.');return 0;}
 const earned=settingsService.get().pos.loyalty.enabled?Math.floor(toCentavos(paid)/toCentavos(settingsService.get().pos.loyalty.pesosPerPoint)):0;
 const points=c.points+earned;
 const tier=([...settingsService.get().pos.loyalty.tiers.map(t=>[t.name,t.minPoints])] as [Customer['tier'],number][]).reverse().find(([,threshold])=>points>=threshold)![0];
 useCustomerStore.setState(s=>({customers:s.customers.map(x=>x.id===id?{...x,points,tier,creditBalance:fromCentavos(sumCentavos([toCentavos(x.creditBalance),toCentavos(balance)]))}:x)}));return earned;
 }
};
