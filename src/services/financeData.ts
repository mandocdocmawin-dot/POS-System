import {settingsService} from './settingsService';
import {branchService} from './branchService';
import {paymentAccount} from '../utils/paymentAccounts';
import type { FinanceData, AccountState } from '../types/accounts';
import { useAccountStore } from '../store/useAccountStore';
import { useOrderStore } from '../store/useOrderStore';
import { useWalletStore } from '../store/useWalletStore';
import { useRefundStore } from '../store/useRefundStore';
import { usePurchaseStore } from '../store/usePurchaseStore';
import { useSupplierStore } from '../store/useSupplierStore';
import { usePayrollStore } from '../store/usePayrollStore';
import { useStaffStore } from '../store/useStaffStore';
import { useCustomerStore } from '../store/useCustomerStore';
import { useProductStore } from '../store/useProductStore';
import { useCatalogStore } from '../store/useCatalogStore';
import { useStockStore } from '../store/useStockStore';
import { accountBalance, mergeLedger } from '../utils/ledger';
import { localDay, shiftDay } from '../utils/reports/period';
import { financeConfig } from '../config/accounts';
import type {PaymentMethod} from '../types/pos';
import { payrollMoney } from '../utils/money';
export function financeData(override:Partial<AccountState>={}):FinanceData {const a=useAccountStore.getState(),p=usePurchaseStore.getState(),w=useWalletStore.getState();return {...a,...override,orders:useOrderStore.getState().orders,collections:w.customerPayments,wallet:w.transactions,refunds:useRefundStore.getState().refunds,supplierPayments:p.payments,purchases:p.purchases,purchaseReturns:p.returns,suppliers:useSupplierStore.getState().suppliers,payroll:usePayrollStore.getState().runs,staff:useStaffStore.getState().staff,customers:useCustomerStore.getState().customers,products:useProductStore.getState().products,productCategories:useCatalogStore.getState().categories,movements:useStockStore.getState().movements};}
export function validateBalances(candidate:FinanceData,accountIds?:string[]){const ledger=mergeLedger(candidate);for(const a of candidate.accounts.filter(a=>!accountIds||accountIds.includes(a.id))){if(accountBalance(a,ledger)<0)throw new Error(`${a.name} cannot become negative. Current balance: ${payrollMoney(accountBalance(a,mergeLedger(financeData())))}.`);}}
export function validateFinanceDate(date:string){if(date>shiftDay(localDay(),financeConfig.maxFutureDays))throw new Error('Date must be no later than tomorrow.');}
export function activeAccount(id:string,date?:string){const a=useAccountStore.getState().accounts.find(a=>a.id===id);if(!a||a.status!=='active')throw new Error('Choose an active account.');if(date&&date<a.openingDate)throw new Error('Date cannot precede the account opening date.');return a;}
export function validatePaymentAccount(method:PaymentMethod,branchId=branchService.activeId()){const config=settingsService.get().payment.methods.find(m=>m.id===method);if(!config?.enabled)throw new Error('Payment method is disabled.');const mapping=Object.fromEntries(settingsService.get().payment.methods.map(m=>[m.id,m.accountId]));const id=paymentAccount(method,branchId,useAccountStore.getState().accounts,mapping);if(id&&useAccountStore.getState().accounts.length)activeAccount(id);return id;}
