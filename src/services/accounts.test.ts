import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.hoisted(()=>{const values=new Map<string,string>();const storage={getItem:(k:string)=>values.get(k)??null,setItem:(k:string,v:string)=>{values.set(k,v);},removeItem:(k:string)=>{values.delete(k);}};Object.defineProperty(globalThis,'localStorage',{value:storage,configurable:true});Object.defineProperty(globalThis,'window',{value:{localStorage:storage},configurable:true});});
import { useAccountStore } from '../store/useAccountStore';
import { useOrderStore } from '../store/useOrderStore';
import { useStaffStore } from '../store/useStaffStore';
import { useRoleStore } from '../store/useRoleStore';
import { useAuthStore } from '../store/useAuthStore';
import { createPhase5Seed } from '../data/seed/phase5';
import { createAccountSeed } from '../data/seed/accounts';
import { financeFixture } from '../utils/reports/fixtures';
import { accountService } from './accountService';
import { manualEntryService } from './manualEntryService';
import { transferService } from './transferService';
import { reportService } from './reportService';
import { financeCategoryService } from './financeCategoryService';
import { localDay, shiftDay } from '../utils/reports/period';
import type { ManualEntry } from '../types/accounts';
beforeEach(()=>{const s=createPhase5Seed();useStaffStore.setState({staff:s.staff});useRoleStore.setState({roles:s.roles});useAuthStore.setState({currentUserId:'staff-admin'});useAccountStore.setState({...createAccountSeed(),manualEntries:[],transfers:[],counter:0});useOrderStore.setState({orders:financeFixture().orders,counter:12});});
function entry(overrides:Partial<ManualEntry>={}):ManualEntry{return {id:crypto.randomUUID(),type:'expense',date:localDay(),categoryId:'expense-3',amount:10000,accountId:'account-cash',branchId:'Main Branch',createdBy:'Admin',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),...overrides};}
const transfer=(amount=1000)=>({id:crypto.randomUUID(),date:localDay(),fromAccountId:'account-cash',toAccountId:'account-bank',amount});
describe('accounts business rules',()=>{
 it('validates transfers before writing and never duplicates cash',()=>{const before=accountService.list().reduce((n,a)=>n+a.balance,0);const t=transferService.save(transfer());expect(accountService.list().reduce((n,a)=>n+a.balance,0)).toBe(before);expect(t.transferNo).toBe('TF-000001');expect(()=>transferService.save(transfer(999999999))).toThrow('Current balance');expect(transferService.list()).toHaveLength(1);expect(()=>transferService.save({...transfer(),toAccountId:'account-cash'})).toThrow('different');});
 it('blocks inactive accounts, category mismatch, nonpositive amounts and future dates',()=>{accountService.deactivate('account-maya');expect(()=>manualEntryService.save(entry({accountId:'account-maya'}))).toThrow('active');expect(()=>transferService.save({...transfer(),toAccountId:'account-maya'})).toThrow('active');expect(()=>manualEntryService.save(entry({categoryId:'income-1'}))).toThrow('matching');expect(()=>manualEntryService.save(entry({amount:0}))).toThrow();expect(()=>manualEntryService.save(entry({date:shiftDay(localDay(),3)}))).toThrow('tomorrow');});
 it('blocks manual expense overdraw and deleting consumed income or transfer',()=>{const cash=useAccountStore.getState().accounts[0];accountService.save({...cash,openingBalance:0});const inc=manualEntryService.save(entry({type:'income',categoryId:'income-1',amount:100000}));const balance=accountService.list()[0].balance;const t=transferService.save(transfer(balance));manualEntryService.save(entry({accountId:'account-bank',amount:accountService.list().find(a=>a.id==='account-bank')!.balance}));expect(()=>manualEntryService.remove(inc.id)).toThrow('negative');expect(()=>transferService.remove(t.id)).toThrow('negative');expect(()=>manualEntryService.save(entry())).toThrow('negative');});
 it('locks used accounts/categories and system categories',()=>{const e=manualEntryService.save(entry());expect(()=>accountService.remove(e.accountId)).toThrow('Deactivate');expect(()=>financeCategoryService.remove(e.categoryId)).toThrow('Deactivate');expect(()=>financeCategoryService.save({...financeCategoryService.list()[0],name:'Changed'})).toThrow('locked');expect(()=>manualEntryService.remove('payment:auto')).toThrow('Automatic');});
 it('requires account management permission on mutations',()=>{useAuthStore.setState({currentUserId:'staff-manager'});expect(()=>manualEntryService.save(entry())).toThrow("Your role can't");expect(()=>transferService.save(transfer())).toThrow("Your role can't");});
 it('rolls back a rejected opening balance edit',()=>{const a=accountService.list()[0];transferService.save(transfer(a.balance));expect(()=>accountService.save({...a,openingBalance:0})).toThrow('negative');expect(accountService.list()[0].openingBalance).toBe(a.openingBalance);});
 it('Dashboard net sales equals Sales Report net sales equals Finance revenue for every branch',()=>{for(const branchId of ['all','Main Branch','Branch 2']){const range={from:localDay(),to:localDay(),branchId,compare:false};expect(reportService.dashboard(range).sales.revenue).toBe(reportService.sales(range).revenue);expect(reportService.finance(range).revenue).toBe(reportService.sales(range).revenue);}const range={from:localDay(),to:localDay(),branchId:'all',compare:false};const before=reportService.finance(range);manualEntryService.save(entry());expect(reportService.finance(range).netProfit).toBe(before.netProfit-10000);});
});
