import type { LedgerFilter } from '../types/accounts';
import { filterLedger, mergeLedger, statement } from '../utils/ledger';
import { requirePermission } from './authService';
import { financeData } from './financeData';
export const ledgerService={
 getEntries:(filters:LedgerFilter={})=>{requirePermission('accounts:view');return filterLedger(mergeLedger(financeData()),filters);},
 statement:(accountId:string,range:{from:string;to:string})=>{requirePermission('accounts:view');const data=financeData(),a=data.accounts.find(a=>a.id===accountId);if(!a)throw new Error('Account not found.');return statement(a,mergeLedger(data),range);},
};
