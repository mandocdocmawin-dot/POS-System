import { transferSchema, type Transfer } from '../types/accounts';
import { useAccountStore } from '../store/useAccountStore';
import { requirePermission, authService } from './authService';
import { activeAccount, financeData, validateBalances, validateFinanceDate } from './financeData';
import { localTransaction } from './localTransaction';
export const transferService={
 list:()=>{requirePermission('accounts:view');return structuredClone(useAccountStore.getState().transfers).reverse();},
 save:(input:Omit<Transfer,'transferNo'|'createdBy'|'createdAt'> & Partial<Pick<Transfer,'transferNo'|'createdBy'|'createdAt'>>)=>{requirePermission('accounts:manage');const state=useAccountStore.getState(),old=state.transfers.find(t=>t.id===input.id);const t=transferSchema.parse({...input,transferNo:old?.transferNo??`TF-${String(state.counter+1).padStart(6,'0')}`,createdBy:old?.createdBy??authService.getCurrentUser()!.name,createdAt:old?.createdAt??new Date().toISOString()});if(t.fromAccountId===t.toAccountId)throw new Error('Source and destination must be different accounts.');validateFinanceDate(t.date);activeAccount(t.fromAccountId,t.date);activeAccount(t.toAccountId,t.date);const transfers=old?state.transfers.map(x=>x.id===t.id?t:x):[...state.transfers,t];validateBalances(financeData({transfers}));return localTransaction(()=>{useAccountStore.setState({transfers,counter:old?state.counter:state.counter+1});return t;});},
 remove:(id:string)=>{requirePermission('accounts:manage');const state=useAccountStore.getState();if(!state.transfers.some(t=>t.id===id))throw new Error('Transfer not found.');const transfers=state.transfers.filter(t=>t.id!==id);validateBalances(financeData({transfers}));localTransaction(()=>useAccountStore.setState({transfers}));},
};
