import { storageOptions } from '../core/storage/options';
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import type {WalletTransaction,CustomerPayment} from '../types/phase4';
export interface WalletState {transactions:WalletTransaction[];customerPayments:CustomerPayment[]}
export const useWalletStore=create<WalletState>()(persist<WalletState>(()=>({transactions:[],customerPayments:[]}),{name:'tindapos:wallet', ...storageOptions('tindapos:wallet'),version:1}));
