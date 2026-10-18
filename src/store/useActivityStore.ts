import { storageOptions } from '../core/storage/options';
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import type {ActivityLog} from '../types/phase4';
export interface ActivityState {logs:ActivityLog[]}
export const useActivityStore=create<ActivityState>()(persist<ActivityState>(()=>({logs:[]}),{name:'tindapos:activity', ...storageOptions('tindapos:activity'),version:1}));
