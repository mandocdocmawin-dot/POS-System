import {authService} from './authService';
import {useOrderStore} from '../store/useOrderStore';
import {useCustomerStore} from '../store/useCustomerStore';
import {useRefundStore} from '../store/useRefundStore';
import {useActivityStore} from '../store/useActivityStore';
import {activitySchema,type ActivityLog} from '../types/phase4';
export const activityService={
 log:(entityType:ActivityLog['entityType'],entityId:string,action:string,description:string,actor=authService.getCurrentUser()?.name??'System')=>{const entry=activitySchema.parse({id:crypto.randomUUID(),entityType,entityId,action,description,actor,actorId:authService.getCurrentUser()?.id,createdAt:new Date().toISOString()});useActivityStore.setState(s=>({logs:[...s.logs,entry]}));return entry;},
 customerActivity:(customerId?:string)=>{const customers=useCustomerStore.getState().customers.filter(c=>!customerId||c.id===customerId).map(c=>c.id),orders=useOrderStore.getState().orders.filter(o=>customers.includes(o.customerId)).map(o=>o.id),refunds=useRefundStore.getState().refunds.filter(r=>orders.includes(r.orderId)).map(r=>r.id);return activityService.list().filter(a=>((a.entityType==='customer'||a.entityType==='wallet')&&customers.includes(a.entityId))||(a.entityType==='order'&&orders.includes(a.entityId))||(a.entityType==='refund'&&refunds.includes(a.entityId)));},
 list:(entityId?:string)=>structuredClone(useActivityStore.getState().logs.filter(x=>!entityId||x.entityId===entityId).toSorted((a,b)=>b.createdAt.localeCompare(a.createdAt))),
};
