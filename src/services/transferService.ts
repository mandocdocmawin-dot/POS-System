import {settingsService} from './settingsService';
import {documentNumber} from '../utils/numbering';
import { transferSchema, type Transfer } from '../types/accounts';
import { useAccountStore } from '../store/useAccountStore';
import { requirePermission, authService } from './authService';
import { activeAccount, financeData, validateBalances, validateFinanceDate } from './financeData';
import { localTransaction } from './localTransaction';
import {accountBalance,mergeLedger} from '../utils/ledger';
export const transferService={
 preview:(input:{id?:string;fromAccountId:string;toAccountId:string;amount:number})=>{const d=financeData(),without=mergeLedger({...d,transfers:d.transfers.filter(t=>t.id!==input.id)});return d.accounts.map(a=>({id:a.id,balance:accountBalance(a,mergeLedger(d)),after:accountBalance(a,without)+(a.id===input.fromAccountId?-input.amount:0)+(a.id===input.toAccountId?input.amount:0)}));},
 list:()=>{requirePermission('accounts:view');return structuredClone(useAccountStore.getState().transfers).reverse();},
 save:(input:Omit<Transfer,'transferNo'|'createdBy'|'createdAt'> & Partial<Pick<Transfer,'transferNo'|'createdBy'|'createdAt'>>)=>{requirePermission('accounts:manage');const state=useAccountStore.getState(),old=state.transfers.find(t=>t.id===input.id);const t=transferSchema.parse({...input,transferNo:old?.transferNo??documentNumber(state.counter+1,settingsService.get().invoice,undefined,settingsService.get().invoice.accountTransferPrefix),createdBy:old?.createdBy??authService.getCurrentUser()!.name,createdAt:old?.createdAt??new Date().toISOString()});if(t.fromAccountId===t.toAccountId)throw new Error('Source and destination must be different accounts.');validateFinanceDate(t.date);activeAccount(t.fromAccountId,t.date);activeAccount(t.toAccountId,t.date);const transfers=old?state.transfers.map(x=>x.id===t.id?t:x):[...state.transfers,t];validateBalances(financeData({transfers}));return localTransaction(()=>{useAccountStore.setState({transfers,counter:old?state.counter:state.counter+1});return t;});},
 remove:(id:string)=>{requirePermission('accounts:manage');const state=useAccountStore.getState();if(!state.transfers.some(t=>t.id===id))throw new Error('Transfer not found.');const transfers=state.transfers.filter(t=>t.id!==id);validateBalances(financeData({transfers}));localTransaction(()=>useAccountStore.setState({transfers}));},
};
