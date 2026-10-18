import { storageOptions } from '../core/storage/options';
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import type {Customer} from '../types/pos';
export interface CustomerState {customers:Customer[]}
export const useCustomerStore=create<CustomerState>()(persist<CustomerState>(()=>({customers:[]}),{name:'tindapos:customers', ...storageOptions('tindapos:customers'),version:1,merge:(persisted,current)=>({...current,...(persisted as Partial<CustomerState>),customers:((persisted as Partial<CustomerState>)?.customers??[]).map(x=>({...x,walletBalance:x.walletBalance??0,status:x.status??'active'}))})}));
