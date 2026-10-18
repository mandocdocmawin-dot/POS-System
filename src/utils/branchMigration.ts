import {paymentAccounts} from '../config/accounts';
import type {Branch} from '../types/settings';
import type {StockMovement} from '../types/models';
import type {Order,HeldOrder} from '../types/pos';
import type {Purchase} from '../types/phase4';
import type {BankAccount} from '../types/accounts';
import type {AttendanceRecord} from '../types/staff';
export const MAIN_BRANCH='Main Branch';
export function defaultBranches():Branch[]{const openingHours=Object.fromEntries(['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(day=>[day,{open:true,start:'08:00',end:'21:00'}])) as Branch['openingHours'];return ['Main Branch','Branch 2','Head Office'].map((name,i)=>({id:name,code:['MAIN','BR02','HQ'][i],name,type:i===2?'head_office':'branch',canSell:i!==2,address:['123 Rizal Avenue, Santa Cruz, Manila','45 Aurora Boulevard, Quezon City','8 Ayala Avenue, Makati City'][i],city:['Manila','Quezon City','Makati'][i],phone:'0917 555 0100',openingHours:structuredClone(openingHours),status:'active',isDefault:i===0,createdAt:'2026-01-01T00:00:00.000Z'}));}
export interface BranchMigrationData {branches?:Branch[];movements:StockMovement[];orders:Order[];heldOrders:HeldOrder[];purchases:Purchase[];accounts:BankAccount[];attendance:AttendanceRecord[]}
export function migrateBranchData(data:BranchMigrationData):Required<BranchMigrationData>{return {...structuredClone(data),branches:data.branches?.length?structuredClone(data.branches):defaultBranches(),movements:data.movements.map(m=>({...m,branchId:m.branchId??MAIN_BRANCH})),orders:data.orders.map(o=>({...o,branchId:o.branchId||MAIN_BRANCH,payments:o.payments.map(p=>({...p,accountId:p.accountId??paymentAccounts[p.method]})),taxMode:o.taxMode??'inclusive',roundingAdjustment:o.roundingAdjustment??0})),heldOrders:data.heldOrders.map(h=>({...h,branchId:h.branchId??MAIN_BRANCH})),purchases:data.purchases.map(p=>({...p,receivingBranchId:p.receivingBranchId??p.branchId??MAIN_BRANCH,branchId:p.branchId??MAIN_BRANCH})),accounts:data.accounts.map(a=>({...a,...(a.id==='account-cash'?{branchId:a.branchId??MAIN_BRANCH}:{})})),attendance:data.attendance.map(a=>({...a,branchId:a.branchId??MAIN_BRANCH}))};}
