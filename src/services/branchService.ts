import {ensureCashDrawers} from './cashDrawerService';
import {holdService} from './holdService';
import {usePosStore} from '../store/usePosStore';
import {toast} from './toastService';
import {useBranchesStore} from '../store/useBranchesStore';
import {useStockStore} from '../store/useStockStore';
import {useOrderStore} from '../store/useOrderStore';
import {useStaffStore} from '../store/useStaffStore';
import {useShiftStore} from '../store/useShiftStore';
import {useAccountStore} from '../store/useAccountStore';
import {useTransferStore} from '../store/useTransferStore';
import {usePurchaseStore} from '../store/usePurchaseStore';
import {useBranchStore} from '../store/useBranchStore';
import {branchSchema,type Branch} from '../types/settings';
import {requirePermission,authService} from './authService';
import {activityService} from './activityService';
import {localTransaction} from './localTransaction';
import {PermissionError} from '../utils/permissions';
export const branchService={
 switchTo:(id:string,confirmed=false)=>{branchService.assertAccess(id);if(id===branchService.activeId())return;const cart=usePosStore.getState().cart;if(cart.length&&!confirmed)throw new Error('Confirm branch switch to hold the current cart.');localTransaction(()=>{if(cart.length)holdService.hold('Auto-held on branch switch');useBranchStore.setState({activeBranchId:id});});},
 ensureActive:()=>{const allowed=branchService.allowed();if(!allowed.length)return;if(!allowed.some(b=>b.id===branchService.activeId())){branchService.switchTo(allowed[0].id,true);toast.info('Active location changed to '+allowed[0].name);}},
 list:()=>structuredClone(useBranchesStore.getState().branches),
 get:(id:string)=>structuredClone(useBranchesStore.getState().branches.find(b=>b.id===id)),
 activeId:()=>useBranchStore.getState().activeBranchId,
 allowed:()=>{const user=authService.getCurrentUser();return branchService.list().filter(b=>b.status==='active'&&!!user&&(user.role==='admin'||user.branchIds.includes(b.id)));},
 assertAccess:(id:string)=>{if(!branchService.allowed().some(b=>b.id===id))throw new PermissionError('branch:access');},
 assertSell:(id:string)=>{branchService.assertAccess(id);if(!branchService.get(id)?.canSell)throw new Error('This location cannot sell. Switch to a selling branch.');},
 warnings:(id:string)=>{const movements=useStockStore.getState().movements.filter(m=>m.branchId===id),stock=movements.reduce((n,m)=>n+(m.type==='out'?-m.quantity:m.quantity),0),transfers=useTransferStore.getState().transfers.filter(t=>t.status==='in_transit'&&(t.fromBranchId===id||t.toBranchId===id)).length;return [stock>0?`${stock} units of stock remain`:'',transfers?`${transfers} transfers are in transit`:''].filter(Boolean);},
 hasRecords:(id:string)=>useOrderStore.getState().orders.some(o=>o.branchId===id)||useStockStore.getState().movements.some(m=>m.branchId===id)||useShiftStore.getState().shifts.some(s=>s.branchId===id)||useAccountStore.getState().manualEntries.some(e=>e.branchId===id)||useTransferStore.getState().transfers.some(t=>t.fromBranchId===id||t.toBranchId===id)||usePurchaseStore.getState().purchases.some(p=>p.receivingBranchId===id),
 save:(input:Branch,confirmed=false)=>{requirePermission('stores:manage');const b=branchSchema.parse(input),branches=branchService.list(),old=branches.find(x=>x.id===b.id);if(branches.some(x=>x.id!==b.id&&x.code===b.code))throw new Error('Branch code must be unique.');if(!b.canSell||b.status!=='active'){if(!branches.some(x=>x.id!==b.id&&x.status==='active'&&x.canSell))throw new Error('At least one active selling branch is required.');}if(old?.status==='active'&&b.status==='inactive'&&branchService.warnings(b.id).length&&!confirmed)throw new Error('Confirm deactivation: '+branchService.warnings(b.id).join('; '));if(b.managerStaffId&&!useStaffStore.getState().staff.some(s=>s.id===b.managerStaffId))throw new Error('Choose an existing staff manager.');return localTransaction(()=>{useBranchesStore.setState({branches:old?branches.map(x=>x.id===b.id?b:x):[...branches,b]});ensureCashDrawers();activityService.log('branch',b.id,old?'update':'create',`${b.name} (${b.code})`);return b;});},
 remove:(id:string)=>{requirePermission('stores:manage');const b=branchService.get(id);if(!b)return;if(b.isDefault||branchService.hasRecords(id))throw new Error('This branch has records or is the default. Deactivate instead.');if(b.status==='active'&&b.canSell&&!branchService.list().some(x=>x.id!==id&&x.status==='active'&&x.canSell))throw new Error('At least one active selling branch is required.');localTransaction(()=>{useBranchesStore.setState(s=>({branches:s.branches.filter(x=>x.id!==id)}));activityService.log('branch',id,'delete',b.name);});},
 staff:(id:string)=>structuredClone(useStaffStore.getState().staff.filter(s=>s.branchIds.includes(id))),
};
