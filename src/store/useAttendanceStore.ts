import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import type { AttendanceRecord } from '../types/staff';
export interface AttendanceState {records:AttendanceRecord[]}
export const useAttendanceStore=create<AttendanceState>()(persist<AttendanceState>(()=>({records:[]}),{name:'tindapos:attendance',version:1}));
