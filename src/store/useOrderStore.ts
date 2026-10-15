import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import type {Order} from '../types/pos';
export interface OrderState {orders:Order[]; counter:number}
export const useOrderStore=create<OrderState>()(persist<OrderState>(()=>({orders:[],counter:0}),{name:'tindapos:orders',version:1}));
