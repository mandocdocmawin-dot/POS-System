import { financeCategorySchema, type FinanceCategory } from '../types/accounts';
import { useAccountStore } from '../store/useAccountStore';
import { requirePermission } from './authService';
import { localTransaction } from './localTransaction';
export const financeCategoryService={
 list:(type?:FinanceCategory['type'])=>{requirePermission('accounts:view');return structuredClone(useAccountStore.getState().categories.filter(c=>!type||c.type===type));},
 save:(input:FinanceCategory)=>{requirePermission('accounts:manage');const c=financeCategorySchema.parse(input),s=useAccountStore.getState(),old=s.categories.find(x=>x.id===c.id);if(old?.isSystem)throw new Error('System categories are locked.');if(c.isSystem)throw new Error('New categories cannot be system categories.');if(old&&old.type!==c.type&&s.manualEntries.some(e=>e.categoryId===c.id))throw new Error('Category type is locked while in use.');if(s.categories.some(x=>x.id!==c.id&&x.type===c.type&&x.name.trim().toLowerCase()===c.name.trim().toLowerCase()))throw new Error('Category name must be unique.');localTransaction(()=>useAccountStore.setState({categories:old?s.categories.map(x=>x.id===c.id?c:x):[...s.categories,c]}));},
 remove:(id:string)=>{requirePermission('accounts:manage');const s=useAccountStore.getState();if(s.categories.find(c=>c.id===id)?.isSystem)throw new Error('System categories are locked.');if(s.manualEntries.some(e=>e.categoryId===id))throw new Error('Category is in use. Deactivate instead.');localTransaction(()=>useAccountStore.setState({categories:s.categories.filter(c=>c.id!==id)}));},
};
