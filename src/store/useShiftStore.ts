import { storageOptions } from '../core/storage/options';
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import type { Shift } from '../types/staff';
export interface ShiftState {shifts:Shift[]}
export const useShiftStore=create<ShiftState>()(persist<ShiftState>(()=>({shifts:[]}),{name:'tindapos:shifts', ...storageOptions('tindapos:shifts'),version:1}));
