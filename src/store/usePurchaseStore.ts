import { storageOptions } from '../core/storage/options';
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import type {Purchase,PurchaseReturn,SupplierPayment} from '../types/phase4';
export interface PurchaseState {purchases:Purchase[];returns:PurchaseReturn[];payments:SupplierPayment[];counter:number;returnCounter:number}
export const usePurchaseStore=create<PurchaseState>()(persist<PurchaseState>(()=>({purchases:[],returns:[],payments:[],counter:0,returnCounter:0}),{name:'tindapos:purchase', ...storageOptions('tindapos:purchase'),version:1}));
