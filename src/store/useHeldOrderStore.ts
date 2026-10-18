import { storageOptions } from '../core/storage/options';
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import type {HeldOrder} from '../types/pos';
export interface HeldOrderState {heldOrders:HeldOrder[]}
export const useHeldOrderStore=create<HeldOrderState>()(persist<HeldOrderState>(()=>({heldOrders:[]}),{name:'tindapos:held-orders', ...storageOptions('tindapos:held-orders'),version:1}));
