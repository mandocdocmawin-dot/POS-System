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
import type {Payment} from '../types/pos';
const cash=(amount:number):Payment=>({id:crypto.randomUUID(),method:'cash',amount,createdAt:new Date().toISOString()});
beforeEach(()=>{
 vi.restoreAllMocks();storage.clear();
 useCatalogStore.setState({categories,subcategories,brands,units});
 useProductStore.setState({products:structuredClone(products),variants:structuredClone(variants)});
 useStockStore.setState({movements:structuredClone(movements)});
 useOrderStore.setState({orders:[],counter:0});useHeldOrderStore.setState({heldOrders:[]});
 useCustomerStore.setState({customers:createPosSeed().customers});useRefundStore.setState({refunds:[],counter:0});useWalletStore.setState({transactions:[],customerPayments:[]});useActivityStore.setState({logs:[]});posService.clear();
});

import {useRefundStore} from '../store/useRefundStore';
import {useWalletStore} from '../store/useWalletStore';
import {useActivityStore} from '../store/useActivityStore';
import {refundService} from './refundService';
import {walletService} from './walletService';
describe('Phase 4 customer transactions',()=>{
 it('cancels pending orders, restores stock and clears customer credit',()=>{posService.add('prod-1');posService.customer('customer-1');const before=stockService.getStock('prod-1');const o=posService.complete([cash(20)],{payLater:true});orderService.cancel(o.id,'Duplicate');expect(stockService.getStock('prod-1')).toBe(before);expect(customerService.get('customer-1')?.creditBalance).toBe(0);expect(orderService.get(o.id)).toMatchObject({orderStatus:'cancelled',balanceDue:0,refundedTotal:20});expect(refundService.list(o.id)[0].refundAmount).toBe(20);expect(()=>orderService.cancel(o.id,'Again')).toThrow();});
 it('rejects cancellation of completed or refunded orders without changing stock',()=>{posService.add('prod-1');const o=posService.complete([cash(100)]),stock=stockService.getStock('prod-1');expect(()=>orderService.cancel(o.id,'No')).toThrow('pending');expect(stockService.getStock('prod-1')).toBe(stock);});
 it('collects unpaid, partial, paid and allocates oldest-first across branches',()=>{posService.customer('customer-1');posService.add('prod-1');const first=posService.complete([],{payLater:true});posService.customer('customer-1');posService.add('prod-1');const second=posService.complete([],{payLater:true});orderService.collect(first.id,{amount:10,method:'cash'});expect(orderService.get(first.id)?.paymentStatus).toBe('partial');orderService.collectAll('customer-1',{amount:68,method:'cash'});expect(orderService.get(first.id)).toMatchObject({balanceDue:0,paymentStatus:'paid',orderStatus:'completed'});expect(orderService.get(second.id)?.balanceDue).toBe(58);const before=orderService.get(second.id);expect(()=>orderService.collect(second.id,{amount:100,method:'cash'})).toThrow();expect(orderService.get(second.id)).toEqual(before);});
 it('prevents wallet overdraft and records signed amount and resulting balance',()=>{walletService.change({customerId:'customer-1',type:'topup',amount:10});walletService.change({customerId:'customer-1',type:'spend',amount:-3});expect(walletService.list('customer-1').find(t=>t.type==='spend')).toMatchObject({amount:-3,balanceAfter:7});expect(()=>walletService.change({customerId:'customer-1',type:'spend',amount:-8})).toThrow('negative');expect(customerService.get('customer-1')?.walletBalance).toBe(7);expect(()=>walletService.change({customerId:'customer-walk-in',type:'topup',amount:1})).toThrow();expect(()=>walletService.change({customerId:'customer-1',type:'adjustment',amount:1})).toThrow('reason');});
 it('refunds quantities atomically, credits wallet, restores stock and reverses points',()=>{posService.customer('customer-1');const line=posService.add('prod-1');posService.quantity(line,3);const o=posService.complete([cash(300)]),stock=stockService.getStock('prod-1'),points=customerService.get('customer-1')!.points;const input={orderId:o.id,lines:[{id:line,quantity:1}],reason:'Damaged',refundMethod:'wallet' as const,restock:true};const r=refundService.create(input);expect(r.refundAmount).toBe(68);expect(stockService.getStock('prod-1')).toBe(stock+1);expect(customerService.get('customer-1')?.walletBalance).toBe(68);refundService.create({...input,lines:[{id:line,quantity:2}]});expect(orderService.get(o.id)?.orderStatus).toBe('refunded');expect(customerService.get('customer-1')?.points).toBe(points-o.pointsEarned);expect(()=>refundService.create(input)).toThrow('quantity');});
 it('caps refunds to paid amount and rolls back on a storage error',()=>{posService.customer('customer-1');const line=posService.add('prod-1');const o=posService.complete([cash(20)],{payLater:true});const input={orderId:o.id,lines:[{id:line,quantity:1}],reason:'Other',refundMethod:'cash' as const,restock:true};const stock=stockService.getStock('prod-1');expect(()=>refundService.create(input)).toThrow('paid');orderService.collect(o.id,{amount:48,method:'cash'});const original=storage.setItem;let fail=true;vi.spyOn(storage,'setItem').mockImplementation((key,value)=>{if(fail&&key==='tindapos:refund'){fail=false;throw new Error('Disk full');}original(key,value);});expect(()=>refundService.create(input)).toThrow();expect(stockService.getStock('prod-1')).toBe(stock);expect(refundService.list(o.id)).toHaveLength(0);expect(orderService.get(o.id)?.refundedTotal).toBe(0);});
});
