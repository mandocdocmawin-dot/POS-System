import type {BankAccount} from '../types/accounts';
import type {PaymentMethod} from '../types/pos';
import {paymentAccounts} from '../config/accounts';
export function paymentAccount(method:PaymentMethod,branchId:string,accounts:BankAccount[],mapping=paymentAccounts){return method==='wallet'?undefined:method==='cash'?(accounts.find(a=>a.branchId===branchId&&a.type==='cash')?.id??mapping.cash):mapping[method];}
