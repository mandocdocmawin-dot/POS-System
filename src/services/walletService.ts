import {validatePaymentAccount} from './financeData';
import {useBranchStore} from '../store/useBranchStore';
import {requirePermission} from './authService';
import {useWalletStore} from '../store/useWalletStore';
import {useCustomerStore} from '../store/useCustomerStore';
import {walletTransactionSchema,type WalletTransaction} from '../types/phase4';
import {toCentavos as c,fromCentavos as p} from '../utils/pos';
import {localTransaction} from './localTransaction';
import {activityService} from './activityService';
export const walletService={
 list:(customerId?:string)=>structuredClone(useWalletStore.getState().transactions.filter(t=>!customerId||t.customerId===customerId).toSorted((a,b)=>b.createdAt.localeCompare(a.createdAt))),
 change:(input:Omit<WalletTransaction,'id'|'createdAt'|'balanceAfter'>)=>{requirePermission(input.type==='spend'?'pos:use':input.type==='refund'?'orders:refund':'customers:manage');
  if(input.type==="topup"&&input.method)validatePaymentAccount(input.method);const customer=useCustomerStore.getState().customers.find(x=>x.id===input.customerId);
  if(!customer||customer.isWalkIn)throw new Error('Choose a named customer for wallet transactions.');
  if(!Number.isFinite(input.amount)||!input.amount)throw new Error('Enter a non-zero amount.');
  if(input.type==='spend'&&input.amount>=0)throw new Error('Wallet spend must be negative.');
  if((input.type==='topup'||input.type==='refund')&&input.amount<=0)throw new Error('Enter a positive wallet amount.');
  if(input.type==='adjustment'&&!input.note?.trim())throw new Error('An adjustment reason is required.');
  const delta=Math.sign(input.amount)*c(Math.abs(input.amount)),balance=c(customer.walletBalance)+delta;
  if(!delta)throw new Error('Amount must be at least one centavo.');
  if(balance<0)throw new Error('Insufficient wallet balance. Wallet cannot become negative.');
  const tx=walletTransactionSchema.parse({...input,accountId:input.type==='topup'&&input.method?validatePaymentAccount(input.method,input.branchId):undefined,branchId:input.branchId??useBranchStore.getState().activeBranchId,amount:p(delta),id:crypto.randomUUID(),createdAt:new Date().toISOString(),balanceAfter:p(balance)});
  return localTransaction(()=>{useCustomerStore.setState(s=>({customers:s.customers.map(x=>x.id===customer.id?{...x,walletBalance:tx.balanceAfter}:x)}));useWalletStore.setState(s=>({transactions:[...s.transactions,tx]}));activityService.log('wallet',customer.id,input.type,`${input.type}: ${tx.amount.toFixed(2)} — ${input.note??''}`);return tx;});
 },
};


