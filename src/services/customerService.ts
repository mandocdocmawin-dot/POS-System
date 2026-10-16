import {activityService} from './activityService';
import {z} from 'zod';
import {useCustomerStore} from '../store/useCustomerStore';
import {WALK_IN_ID,POS_CONFIG} from '../config/pos';
import {customerSchema,type Customer} from '../types/pos';
import {toCentavos,fromCentavos,sumCentavos} from '../utils/pos';
export const quickCustomerSchema=z.object({name:z.string().trim().min(1,'Name is required.').max(120),phone:z.string().trim().max(40).optional()});
export const customerService={
 list:(query='')=>structuredClone(useCustomerStore.getState().customers.filter(c=>`${c.name} ${c.phone??''}`.toLowerCase().includes(query.toLowerCase()))),
 get:(id=WALK_IN_ID)=>structuredClone(useCustomerStore.getState().customers.find(c=>c.id===id)),
 add:(input:z.infer<typeof quickCustomerSchema>)=>{const fields=quickCustomerSchema.parse(input);const c=customerSchema.parse({...fields,id:crypto.randomUUID(),points:0,tier:'Regular',creditBalance:0,createdAt:new Date().toISOString()});useCustomerStore.setState(s=>({customers:[...s.customers,c]}));activityService.log("customer",c.id,"create",`Created ${c.name}`);return c;},
 update:(id:string,fields:Partial<Pick<Customer,'name'|'phone'|'email'>>)=>{const c=customerService.get(id);if(!c)throw new Error('Customer not found.');if(c.isWalkIn)throw new Error('Walk-in Customer cannot be edited.');const updated=customerSchema.parse({...c,...fields});useCustomerStore.setState(s=>({customers:s.customers.map(c=>c.id===id?updated:c)}));activityService.log("customer",id,"update",`Updated ${updated.name}`);return updated;},
 remove:(id:string)=>{const c=customerService.get(id);if(c?.isWalkIn || id===WALK_IN_ID)throw new Error('Walk-in Customer cannot be deleted.');throw new Error('Customer management is available in a later phase.');},
 recordSale:(id:string,paid:number,balance:number)=>{
 const c=customerService.get(id);if(!c)throw new Error('Customer no longer exists.');
 if(c.isWalkIn){if(toCentavos(balance)>0)throw new Error('Pay Later requires a named customer.');return 0;}
 const earned=Math.floor(toCentavos(paid)/toCentavos(POS_CONFIG.loyaltyPesosPerPoint));
 const points=c.points+earned;
 const tier=([...Object.entries(POS_CONFIG.tiers)] as [Customer['tier'],number][]).reverse().find(([,threshold])=>points>=threshold)![0];
 useCustomerStore.setState(s=>({customers:s.customers.map(x=>x.id===id?{...x,points,tier,creditBalance:fromCentavos(sumCentavos([toCentavos(x.creditBalance),toCentavos(balance)]))}:x)}));return earned;
 }
};
