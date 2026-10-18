import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { storageOptions } from '../core/storage/options';
import type { Phase8Data } from '../types/phase8';
type State = Pick<Phase8Data, 'emails' | 'templates'>;
export const useEmailStore = create<State>()(persist<State>(() => ({emails:[],templates:[]}), {name:'tindapos:email',...storageOptions<State>('tindapos:email'),version:1}));
