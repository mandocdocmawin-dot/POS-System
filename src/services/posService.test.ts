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
 vi.restoreAllMocks();storage.clear();
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

