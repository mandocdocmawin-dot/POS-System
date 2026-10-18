import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { storageOptions } from '../core/storage/options';
import type { Phase8Data } from '../types/phase8';
type State = Pick<Phase8Data, 'faqs' | 'plans' | 'subscription' | 'invoices' | 'votes' | 'recentSearches'>;
export const useContentStore = create<State>()(persist<State>(() => ({faqs:[],plans:[],subscription:null,invoices:[],votes:{},recentSearches:{}}), {name:'tindapos:content',...storageOptions<State>('tindapos:content'),version:1}));
