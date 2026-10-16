import {useActivityStore} from '../store/useActivityStore';
import {activitySchema,type ActivityLog} from '../types/phase4';
export const activityService={
 log:(entityType:ActivityLog['entityType'],entityId:string,action:string,description:string)=>{const entry=activitySchema.parse({id:crypto.randomUUID(),entityType,entityId,action,description,actor:'Demo Admin',createdAt:new Date().toISOString()});useActivityStore.setState(s=>({logs:[...s.logs,entry]}));return entry;},
 list:(entityId?:string)=>structuredClone(useActivityStore.getState().logs.filter(x=>!entityId||x.entityId===entityId).toSorted((a,b)=>b.createdAt.localeCompare(a.createdAt))),
};
