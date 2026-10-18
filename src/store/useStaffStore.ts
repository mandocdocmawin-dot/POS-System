import { storageOptions } from '../core/storage/options';
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import type { Staff } from '../types/staff';
export interface StaffState {staff:Staff[]}
export const useStaffStore=create<StaffState>()(persist<StaffState>(()=>({staff:[]}),{name:'tindapos:staff', ...storageOptions('tindapos:staff'),version:1}));
