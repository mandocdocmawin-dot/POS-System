import type { AccountState, BankAccount } from '../../types/accounts';
import { financeCategories } from './financeCategories';
import { seedManualEntries } from './manualEntries';
import { seedTransfers } from './transfers';
import { useAccountStore } from '../../store/useAccountStore';
export const seedAccounts:BankAccount[]=[
 {id:'account-cash',name:'Cash Drawer',type:'cash',openingBalance:20000000,openingDate:'2020-01-01',status:'active',createdAt:'2020-01-01T00:00:00Z'},
 {id:'account-gcash',name:'GCash',type:'ewallet',openingBalance:5000000,openingDate:'2020-01-01',status:'active',createdAt:'2020-01-01T00:00:00Z'},
 {id:'account-maya',name:'Maya',type:'ewallet',openingBalance:5000000,openingDate:'2020-01-01',status:'active',createdAt:'2020-01-01T00:00:00Z'},
 {id:'account-bank',name:'Bank Account',type:'bank',accountHolder:'Demo Admin',bankName:'BDO demo',accountNo:'•••• 1024',openingBalance:50000000,openingDate:'2020-01-01',status:'active',createdAt:'2020-01-01T00:00:00Z'},
];
export function createAccountSeed():AccountState{return structuredClone({accounts:seedAccounts,categories:financeCategories,manualEntries:seedManualEntries(),transfers:seedTransfers(),counter:3,demoHistoryGenerated:false});}
export function initializeAccountData(){if(localStorage.getItem('tindapos:accounts')===null||useAccountStore.getState().accounts.length===0)useAccountStore.setState(createAccountSeed(),true);}
