import {ManagerApprovalRequired} from './discountApprovalService';
import {useRoleStore} from '../store/useRoleStore';
import {useActivityStore} from '../store/useActivityStore';
import {defaultRoles} from '../config/permissions';
import {PermissionError} from '../utils/permissions';
import {refundService} from './refundService';
import {usePosStore} from '../store/usePosStore';
import {authService} from './authService';
import {initializeStaffData} from '../data/seed/phase5';
import {useAuthStore} from '../store/useAuthStore';
import {beforeEach,describe,it,expect,vi} from 'vitest';
const {storage}=vi.hoisted(()=>{
 const values=new Map<string,string>();
 const storage={getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>{values.set(key,value);},removeItem:(key:string)=>{values.delete(key);},clear:()=>values.clear()};
 Object.defineProperty(globalThis,'window',{value:{localStorage:storage},configurable:true});Object.defineProperty(globalThis,'localStorage',{value:storage,configurable:true});return {storage};
});
import {useCatalogStore} from '../store/useCatalogStore';
import {useProductStore} from '../store/useProductStore';
import {useStockStore} from '../store/useStockStore';
import {useCustomerStore} from '../store/useCustomerStore';
import {useOrderStore} from '../store/useOrderStore';
import {useHeldOrderStore} from '../store/useHeldOrderStore';
import {products,variants} from '../data/seed/products';
import {movements} from '../data/seed/movements';
import {categories,subcategories} from '../data/seed/categories';
import {brands} from '../data/seed/brands';
import {units} from '../data/seed/units';
import {createPosSeed} from '../data/seed/pos';
import {posService} from './posService';
import {stockService} from './stockService';
import {customerService} from './customerService';
import {orderService} from './orderService';
import {holdService} from './holdService';
import type {Payment} from '../types/pos';
const cash=(amount:number):Payment=>({id:crypto.randomUUID(),method:'cash',amount,createdAt:new Date().toISOString()});
beforeEach(()=>{
 vi.restoreAllMocks();storage.clear();initializeStaffData();useRoleStore.setState({roles:structuredClone(defaultRoles)});useActivityStore.setState({logs:[]});useAuthStore.setState({currentUserId:"staff-admin"});
 useCatalogStore.setState({categories,subcategories,brands,units});
 useProductStore.setState({products:structuredClone(products),variants:structuredClone(variants)});
 useStockStore.setState({movements:structuredClone(movements)});
 useOrderStore.setState({orders:[],counter:0});useHeldOrderStore.setState({heldOrders:[]});
 useCustomerStore.setState({customers:createPosSeed().customers});posService.clear();
});
describe('checkout service',()=>{
 it('saves once, snapshots prices, records stock, awards points and resets cart',()=>{
  const id=posService.add('prod-1');posService.quantity(id,2);posService.customer('customer-1');const before=stockService.getStock('prod-1');
  const order=posService.complete([cash(200)]);expect(order).toMatchObject({orderNo:'TP-000001',grandTotal:136,change:64,pointsEarned:1,paymentStatus:'paid'});
  expect(stockService.getStock('prod-1')).toBe(before-2);expect(stockService.history('prod-1').filter(m=>m.reference===order.orderNo)).toHaveLength(1);expect(posService.state().cart).toHaveLength(0);expect(orderService.nextOrderNo()).toBe('TP-000002');
  useProductStore.setState(s=>({products:s.products.map(p=>p.id==='prod-1'?{...p,sellingPrice:999}:p)}));expect(orderService.get(order.id)?.items[0].unitPrice).toBe(68);expect(()=>posService.complete([cash(200)])).toThrow();
 });
 it('rejects overselling and fractional pieces before any write',()=>{
  const id=posService.add('prod-2');expect(()=>posService.quantity(id,0.5)).toThrow();expect(()=>posService.quantity(id,9999)).toThrow();expect(orderService.list()).toHaveLength(0);expect(posService.state().cart[0].quantity).toBe(1);
 });
 it('validates all stock before committing any sale line',()=>{
  posService.add('prod-1');posService.add('prod-2');const before=stockService.getStock('prod-1');stockService.record({productId:'prod-2',type:'out',quantity:stockService.getStock('prod-2'),reason:'Other cashier',createdAt:new Date().toISOString()});expect(()=>posService.complete([cash(1000)])).toThrow();expect(stockService.getStock('prod-1')).toBe(before);expect(orderService.list()).toHaveLength(0);expect(posService.state().cart).toHaveLength(2);
 });
 it('rolls back memory and persisted data when saving orders fails',()=>{
  posService.add('prod-1');posService.customer('customer-1');const before=stockService.getStock('prod-1'),customer=customerService.get('customer-1');
  const original=storage.setItem;let fail=true;vi.spyOn(storage,'setItem').mockImplementation((key,value)=>{if(fail&&key==='tindapos:orders'){fail=false;throw new Error('Storage full');}original(key,value);});
  expect(()=>posService.complete([cash(100)])).toThrow('Unable to save');expect(stockService.getStock('prod-1')).toBe(before);expect(customerService.get('customer-1')).toEqual(customer);expect(posService.state().cart).toHaveLength(1);expect(orderService.nextOrderNo()).toBe('TP-000001');expect(JSON.parse(storage.getItem('tindapos:orders')!).state.orders).toHaveLength(0);
 });
 it('records partial credit and blocks Walk-in credit',()=>{
  posService.add('prod-1');expect(()=>posService.complete([],{payLater:true})).toThrow('named customer');posService.customer('customer-1');const order=posService.complete([cash(20)],{payLater:true,dueDate:'2026-12-01'});expect(order).toMatchObject({balanceDue:48,paymentStatus:'partial',orderStatus:'pending'});expect(customerService.get('customer-1')?.creditBalance).toBe(48);
 });
 it('holds without stock changes and resumes only with explicit replacement',()=>{
  posService.add('prod-1');const before=stockService.getStock('prod-1');const held=holdService.hold('Lunch');expect(stockService.getStock('prod-1')).toBe(before);posService.add('prod-2');expect(()=>holdService.resume(held.id)).toThrow('replacement');holdService.resume(held.id,true);expect(posService.state().cart[0].productId).toBe('prod-1');expect(holdService.list()).toHaveLength(0);
 });
});

import {dataService} from './dataService';
import {salesMetrics,paymentShares,recordedPayments} from './salesMetrics';
import {useBranchStore} from '../store/useBranchStore';
import {productService} from './productService';
import {receiptService} from './receiptService';

describe('Phase 3 data and Dashboard',()=>{
 it('round trips customers, sales, held orders, counter, stock and open cart',async()=>{
  dataService.reset();authService.login();expect(orderService.list({branchId:'Main Branch'}).length+orderService.list({branchId:'Branch 2'}).length).toBe(12);
  posService.add('prod-1');const held=holdService.hold('Backup test');
  posService.add('prod-2');posService.customer('customer-1');const credit=posService.complete([],{payLater:true});
  posService.add('prod-3');const expected=JSON.parse(await dataService.export());dataService.validate(JSON.stringify(expected));
  dataService.reset();authService.login();await dataService.import(JSON.stringify(expected));
  expect(JSON.parse(await dataService.export())).toEqual(expected);expect(holdService.list()[0].id).toBe(held.id);expect(orderService.get(credit.id)?.balanceDue).toBe(16);expect(customerService.get('customer-1')?.creditBalance).toBe(16);expect(posService.state().cart[0].productId).toBe('prod-3');expect(orderService.nextOrderNo()).toBe('TP-000014');
 });
 it('rejects damaged order counters, totals and protected customer records before import',async()=>{
  dataService.reset();authService.login();const backup=JSON.parse(await dataService.export());
  const badCounter=structuredClone(backup);badCounter.counter=0;expect(()=>dataService.validate(JSON.stringify(badCounter))).toThrow('counter');
  const badTotal=structuredClone(backup);badTotal.orders[0].grandTotal=999;expect(()=>dataService.validate(JSON.stringify(badTotal))).toThrow('totals');
  const badCustomer=structuredClone(backup);badCustomer.customers[0].name='Edited';expect(()=>dataService.validate(JSON.stringify(badCustomer))).toThrow('Walk-in');
  expect(orderService.list({branchId:'Main Branch'}).length+orderService.list({branchId:'Branch 2'}).length).toBe(12);
 });
 it('accepts Phase 2 backups without adding fictional sales or credits',async()=>{
  const legacy={version:1,categories,subcategories,brands,units,products,variants,movements};
  await dataService.import(JSON.stringify(legacy));expect(orderService.list()).toHaveLength(0);expect(customerService.list()).toHaveLength(6);expect(orderService.nextOrderNo()).toBe('TP-000001');
 });
 it('computes branch-filtered revenue, cost snapshots and net recorded payment shares',()=>{
  useBranchStore.getState().setBranch('Main Branch');posService.add('prod-1');const order=posService.complete([{...cash(20),method:'gcash'},cash(100)]);
  expect(order.change).toBe(52);expect(recordedPayments().reduce((n,p)=>n+p.cents,0)).toBe(6800);expect(paymentShares().reduce((n,p)=>n+p.percent,0)).toBe(100);expect(salesMetrics()).toMatchObject({todaySales:68,totalOrders:1,netProfit:10,salesReturn:0});
  useProductStore.setState(s=>({products:s.products.map(p=>p.id==='prod-1'?{...p,costPrice:999}:p)}));expect(salesMetrics().netProfit).toBe(10);
  useBranchStore.getState().setBranch('Branch 2');expect(salesMetrics().totalOrders).toBe(0);expect(paymentShares().every(p=>p.percent===0)).toBe(true);useBranchStore.getState().setBranch('Main Branch');
 });
 it('previews a draft without allocating a number or changing stock',()=>{
  posService.add('prod-1');const before=stockService.getStock('prod-1'),number=orderService.nextOrderNo();const draft=receiptService.draft();expect(draft.draft).toBe(true);expect(draft.orderNo).toBeUndefined();expect(stockService.getStock('prod-1')).toBe(before);expect(orderService.nextOrderNo()).toBe(number);expect(posService.state().cart).toHaveLength(1);
 });
 it('protects historical sale movements when deleting catalogue products',()=>{
  posService.add('prod-1');posService.complete([cash(100)]);expect(()=>productService.removeMany(['prod-1'])).toThrow('Sold products');expect(stockService.history('prod-1').some(m=>m.reason==='Sale')).toBe(true);
 });
 it('rejects unsafe discounts without corrupting the persisted cart',()=>{
  const id=posService.add('prod-1');expect(()=>posService.discount({type:'fixed',value:1e20})).toThrow();expect(()=>posService.lineDiscount(id,{type:'fixed',value:1e20})).toThrow();expect(posService.totals().grandTotal).toBe(68);
 });
});

describe('Cashier permissions and manager discount approval',()=>{
 it('allows 10%, requires explicit approval at 20%, and snapshots the actual cashier',()=>{
  authService.switchRole('cashier');posService.add('prod-1');posService.discount({type:'percent',value:10});
  expect(()=>posService.discount({type:'percent',value:20})).toThrow(ManagerApprovalRequired);
  expect(posService.state().orderDiscount.value).toBe(10);
  posService.discount({type:'percent',value:20},'staff-manager');
  expect(authService.getCurrentUser()?.role).toBe('cashier');
  const log=useActivityStore.getState().logs.find(l=>l.action==='discount-approved');
  expect(log).toMatchObject({actor:'Demo Cashier'});expect(log?.description).toContain('Demo Manager');
  const order=posService.complete([cash(100)]);expect(order.cashier).toBe('Demo Cashier');
  expect(()=>refundService.create({orderId:order.id,lines:[{id:order.items[0].id,quantity:1}],reason:'Other',refundMethod:'cash',restock:true})).toThrow(PermissionError);
 });
 it('does not dilute a high item discount across other items or stack small discounts past the limit',()=>{
  authService.switchRole('cashier');const first=posService.add('prod-1');const second=posService.add('prod-2');posService.quantity(second,10);
  expect(()=>posService.lineDiscount(first,{type:'percent',value:20})).toThrow(ManagerApprovalRequired);
  posService.clear();const line=posService.add('prod-1');posService.lineDiscount(line,{type:'percent',value:10});
  expect(()=>posService.discount({type:'percent',value:10})).toThrow(ManagerApprovalRequired);
 });
 it('persists a cart-specific approval and immediately rechecks the approver permissions',async()=>{
  authService.switchRole('cashier');posService.add('prod-1');posService.discount({type:'percent',value:20},'staff-manager');
  await usePosStore.persist.rehydrate();expect(posService.state().discountApproval?.approverId).toBe('staff-manager');
  useRoleStore.setState(s=>({roles:s.roles.map(r=>r.id==='manager'?{...r,permissions:r.permissions.filter(p=>p!=='pos:discount')}:r)}));
  expect(()=>posService.complete([cash(100)])).toThrow(ManagerApprovalRequired);
  expect(useOrderStore.getState().orders).toHaveLength(0);
 });
 it('rolls back approval and its log if the cart cannot persist',()=>{
  authService.switchRole('cashier');posService.add('prod-1');const before=posService.state(),logs=structuredClone(useActivityStore.getState().logs),write=storage.setItem;let fail=true;
  vi.spyOn(storage,'setItem').mockImplementation((key,value)=>{if(key==='tindapos:pos'&&fail){fail=false;throw new Error('Disk full');}write(key,value);});
  expect(()=>posService.discount({type:'percent',value:20},'staff-manager')).toThrow();
  expect(posService.state()).toEqual(before);expect(useActivityStore.getState().logs).toEqual(logs);
  expect(()=>posService.discount({type:'percent',value:20})).toThrow(ManagerApprovalRequired);
 });
 it('lets Cashier create customers but blocks existing-customer edits and product deletion',()=>{
  authService.switchRole('cashier');const customer=customerService.saveProfile({name:'Created by Cashier',phone:'',email:'',address:'',notes:'',status:'active',openingWallet:0});
  expect(customer.name).toBe('Created by Cashier');expect(()=>customerService.update(customer.id,{name:'Changed'})).toThrow(PermissionError);
  expect(()=>productService.removeMany(['prod-1'])).toThrow(PermissionError);
 });
});
