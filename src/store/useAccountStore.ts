import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AccountState } from '../types/accounts';
export const useAccountStore=create<AccountState>()(persist<AccountState>(()=>({accounts:[],categories:[],manualEntries:[],transfers:[],counter:0,demoHistoryGenerated:false}),{name:'tindapos:accounts',version:1}));

