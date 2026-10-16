import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import type {WalletTransaction,CustomerPayment} from '../types/phase4';
export interface WalletState {transactions:WalletTransaction[];customerPayments:CustomerPayment[]}
export const useWalletStore=create<WalletState>()(persist<WalletState>(()=>({transactions:[],customerPayments:[]}),{name:'tindapos:wallet',version:1}));
