import type {StockMovement} from '../types/models';
export function movementBalances(movements:StockMovement[],branchId:string){
 const running=new Map<string,number>(),result=new Map<string,{before:number;after:number}>();
 movements.map((m,index)=>({m,index})).filter(({m})=>(m.branchId??'Main Branch')===branchId).sort((a,b)=>a.m.createdAt.localeCompare(b.m.createdAt)||a.index-b.index).forEach(({m})=>{const key=JSON.stringify([m.productId,m.variantId??'']);const before=running.get(key)??0;const after=Math.round((before+(m.type==='out'?-m.quantity:m.quantity))*1e8)/1e8;result.set(m.id,{before,after});running.set(key,after);});
 return result;
}
