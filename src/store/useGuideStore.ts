import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { storageOptions } from '../core/storage/options';
import type { DemoGuideState } from '../types/phase8';
type State=DemoGuideState;
export const useGuideStore=create<State>()(persist<State>(()=>({startedAt:'',dismissed:false,collapsed:false}),{name:'tindapos:guide',...storageOptions<State>('tindapos:guide'),version:1}));
