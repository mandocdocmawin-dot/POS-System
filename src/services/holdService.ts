import {approvalService} from './approvalService';
import {requirePermission} from './authService';
import {useHeldOrderStore} from '../store/useHeldOrderStore';
import {heldOrderSchema} from '../types/pos';
import {posService} from './posService';
import {customerService} from './customerService';
import {localTransaction} from './localTransaction';
export const holdService={
 list:()=>structuredClone(useHeldOrderStore.getState().heldOrders.toSorted((a,b)=>b.createdAt.localeCompare(a.createdAt))),
 hold:(label='')=>{requirePermission('pos:hold');
  const s=posService.state();if(!s.cart.length)throw new Error('Add items before holding an order.');
  const held=heldOrderSchema.parse({id:crypto.randomUUID(),label:label.trim()||`${customerService.get(s.customerId)?.name??'Customer'} · ${new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`,cart:s.cart,customerId:s.customerId,orderDiscount:s.orderDiscount,note:s.note,createdAt:new Date().toISOString()});
  return localTransaction(()=>{useHeldOrderStore.setState(s=>({heldOrders:[...s.heldOrders,held]}));posService.clear();return held;});
 },
 resume:(id:string,replace=false)=>{requirePermission('pos:hold');
  const held=holdService.list().find(o=>o.id===id);if(!held)throw new Error('Held order not found.');
  if(posService.state().cart.length&&!replace)throw new Error('Confirm replacement of the current cart first.');
  localTransaction(()=>{posService.restore({cart:held.cart,customerId:held.customerId,orderDiscount:held.orderDiscount??{type:'fixed',value:0},note:held.note??''});holdService.remove(id);});
 },
 remove:(id:string)=>{requirePermission('pos:hold');approvalService.ensure('void-held',0,'void-held:'+id);useHeldOrderStore.setState(s=>({heldOrders:s.heldOrders.filter(o=>o.id!==id)}));},
};
