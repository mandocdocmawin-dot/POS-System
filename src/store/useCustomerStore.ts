import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import type {Customer} from '../types/pos';
export interface CustomerState {customers:Customer[]}
export const useCustomerStore=create<CustomerState>()(persist<CustomerState>(()=>({customers:[]}),{name:'tindapos:customers',version:1}));
