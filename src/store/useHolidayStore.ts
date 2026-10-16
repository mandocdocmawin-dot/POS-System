import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import type { Holiday } from '../types/staff';
export interface HolidayState {holidays:Holiday[]}
export const useHolidayStore=create<HolidayState>()(persist<HolidayState>(()=>({holidays:[]}),{name:'tindapos:holidays',version:1}));
