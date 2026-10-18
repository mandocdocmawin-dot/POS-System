import type { LedgerFilter } from '../types/accounts';
import { filterLedger, mergeLedger, statement } from '../utils/ledger';
import { requirePermission } from './authService';
import { financeData } from './financeData';
export const ledgerService={
 getEntries:(filters:LedgerFilter={})=>{requirePermission('accounts:view');return filterLedger(mergeLedger(financeData()),filters);},
 summary:(filters:LedgerFilter={})=>{const entries=ledgerService.getEntries(filters),sums=new Map<string,number>();for(const e of entries)sums.set(e.category,(sums.get(e.category)??0)+e.amount);return {total:entries.reduce((n,e)=>n+e.amount,0),auto:entries.filter(e=>e.isAuto).reduce((n,e)=>n+e.amount,0),manual:entries.filter(e=>!e.isAuto).reduce((n,e)=>n+e.amount,0),top:[...sums].sort((a,b)=>b[1]-a[1])[0]?.[0]??'—',count:entries.length};},
 categoryNames:(type:'income'|'expense')=>[...new Set(ledgerService.getEntries({type}).map(e=>e.category))].sort(),
 statement:(accountId:string,range:{from:string;to:string})=>{requirePermission('accounts:view');const data=financeData(),a=data.accounts.find(a=>a.id===accountId);if(!a)throw new Error('Account not found.');return statement(a,mergeLedger(data),range);},
};
