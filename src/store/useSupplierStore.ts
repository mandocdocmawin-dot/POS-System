import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import type {Supplier} from '../types/phase4';
export interface SupplierState {suppliers:Supplier[]}
export const useSupplierStore=create<SupplierState>()(persist<SupplierState>(()=>({suppliers:[]}),{name:'tindapos:supplier',version:1}));
