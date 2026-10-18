import {branchService} from './branchService';
import { bankAccountSchema, type BankAccount } from '../types/accounts';
import { useAccountStore } from '../store/useAccountStore';
import { useBranchStore } from '../store/useBranchStore';
import { requirePermission } from './authService';
import { financeData, validateBalances, validateFinanceDate } from './financeData';
import { accountBalance, mergeLedger } from '../utils/ledger';
import { localTransaction } from './localTransaction';
import {presetRange,inRange} from '../utils/reports/period';
export const accountService={
 list:()=>{requirePermission('accounts:view');const data=financeData(),entries=mergeLedger(data),range=presetRange('month');return data.accounts.map(a=>({...a,balance:accountBalance(a,entries),monthIn:entries.filter(e=>e.accountId===a.id&&inRange(e.date,range)&&['income','transfer_in'].includes(e.type)).reduce((n,e)=>n+e.amount,0),monthOut:entries.filter(e=>e.accountId===a.id&&inRange(e.date,range)&&['expense','transfer_out'].includes(e.type)).reduce((n,e)=>n+e.amount,0)}));},
 total:()=>accountService.list().filter(a=>a.status==='active').reduce((n,a)=>n+a.balance,0),
 branches:()=>branchService.list().map(b=>b.id),activeBranch:()=>useBranchStore.getState().activeBranchId,
 save:(input:BankAccount)=>{requirePermission('accounts:manage');const a=bankAccountSchema.parse(input),state=useAccountStore.getState();validateFinanceDate(a.openingDate);const original=state.accounts.find(x=>x.id===a.id);if(state.accounts.some(x=>x.id!==a.id&&x.name.trim().toLowerCase()===a.name.trim().toLowerCase()))throw new Error('Account name must be unique.');if(original&&a.openingDate!==original.openingDate&&mergeLedger(financeData()).some(e=>e.accountId===a.id))throw new Error('Opening date is locked after an account has entries.');const accounts=original?state.accounts.map(x=>x.id===a.id?a:x):[...state.accounts,a];validateBalances(financeData({accounts}),[a.id]);return localTransaction(()=>{useAccountStore.setState({accounts});return a;});},
 deactivate:(id:string)=>{requirePermission('accounts:manage');const a=useAccountStore.getState().accounts.find(a=>a.id===id);if(!a)throw new Error('Account not found.');return accountService.save({...a,status:'inactive'});},
 remove:(id:string)=>{requirePermission('accounts:manage');const data=financeData();if(['account-cash','account-gcash','account-maya','account-bank'].includes(id)||mergeLedger(data).some(e=>e.accountId===id))throw new Error('Account is mapped or has entries. Deactivate instead.');localTransaction(()=>useAccountStore.setState(s=>({accounts:s.accounts.filter(a=>a.id!==id)})));},
};
