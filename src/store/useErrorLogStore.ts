import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { storageOptions } from '../core/storage/options';
import type { ErrorLogEntry } from '../types/phase8';
type State={errors:ErrorLogEntry[]};
export const useErrorLogStore=create<State>()(persist<State>(()=>({errors:[]}),{name:'tindapos:errors',...storageOptions<State>('tindapos:errors'),version:1}));
