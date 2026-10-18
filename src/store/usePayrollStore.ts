import { storageOptions } from '../core/storage/options';
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import type { PayrollRun } from '../types/staff';
export interface PayrollState {runs:PayrollRun[]}
export const usePayrollStore=create<PayrollState>()(persist<PayrollState>(()=>({runs:[]}),{name:'tindapos:payroll', ...storageOptions('tindapos:payroll'),version:1}));
