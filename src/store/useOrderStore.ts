import { storageOptions } from '../core/storage/options';
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import type {Order} from '../types/pos';
export interface OrderState {orders:Order[]; counter:number}
export const useOrderStore=create<OrderState>()(persist<OrderState>(()=>({orders:[],counter:0}),{name:'tindapos:orders', ...storageOptions('tindapos:orders'),version:1,merge:(persisted,current)=>({...current,...(persisted as Partial<OrderState>),orders:((persisted as Partial<OrderState>)?.orders??[]).map(x=>({...x,refundedTotal:x.refundedTotal??0}))})}));
