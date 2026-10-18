import {activityService} from './activityService';
import {branchService} from './branchService';
import { manualEntrySchema, type ManualEntry } from '../types/accounts';
import { useAccountStore } from '../store/useAccountStore';

import { authService, requirePermission } from './authService';
import { activeAccount, financeData, validateBalances, validateFinanceDate } from './financeData';
import { localTransaction } from './localTransaction';
import {imageService} from './imageService';
export const manualEntryService={
 saveWithReceipt:async(input:ManualEntry,blob?:Blob|null)=>{requirePermission('accounts:manage');const attachmentId=blob?await imageService.save(blob):input.attachmentId;try{return manualEntryService.save({...input,attachmentId});}catch(error){if(blob&&attachmentId)await imageService.remove(attachmentId);throw error;}},
 get:(id:string)=>{requirePermission('accounts:view');return structuredClone(useAccountStore.getState().manualEntries.find(e=>e.id===id));},
 save:(input:ManualEntry)=>{requirePermission('accounts:manage');const state=useAccountStore.getState(),old=state.manualEntries.find(e=>e.id===input.id);const entry=manualEntrySchema.parse({...input,createdBy:old?.createdBy??authService.getCurrentUser()!.name,createdAt:old?.createdAt??new Date().toISOString(),updatedAt:new Date().toISOString()});validateFinanceDate(entry.date);const account=activeAccount(entry.accountId,entry.date);if(account.branchId&&account.branchId!==entry.branchId)throw new Error('Cash drawer and entry must use the same branch.');const cat=state.categories.find(c=>c.id===entry.categoryId);if(!cat||cat.status!=='active'||cat.type!==entry.type)throw new Error('Choose an active category matching the entry type.');if(!branchService.list().map(b=>b.id).some(b=>b===entry.branchId))throw new Error('Choose a valid branch.');const manualEntries=old?state.manualEntries.map(e=>e.id===entry.id?entry:e):[...state.manualEntries,entry];if(old||entry.type==="expense")validateBalances(financeData({manualEntries}),[entry.accountId,...(old?[old.accountId]:[])]);return localTransaction(()=>{useAccountStore.setState({manualEntries});activityService.log('data',entry.id,old?'edit':entry.type,`Recorded ${entry.type} entry`);return entry;});},
 remove:(id:string)=>{requirePermission('accounts:manage');const s=useAccountStore.getState(),old=s.manualEntries.find(e=>e.id===id);if(!old)throw new Error('Automatic entries cannot be edited or deleted here.');const manualEntries=s.manualEntries.filter(e=>e.id!==id);validateBalances(financeData({manualEntries}),[old.accountId]);localTransaction(()=>useAccountStore.setState({manualEntries}));},
};

