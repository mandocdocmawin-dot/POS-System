import { describe, it, expect } from 'vitest';
import { calculatePayments,calculateTotals,toCentavos,fromCentavos,multiplyCentavos } from './pos';
import type { CartItem, Payment } from '../types/pos';
const item=(overrides:Partial<CartItem>={}):CartItem=>({id:'line',productId:'p',name:'Test',sku:'S',unitPrice:112,costPrice:50,quantity:1,taxRate:12,unitShortName:'pcs',...overrides});
const payment=(method:Payment['method'],amount:number):Payment=>({id:crypto.randomUUID(),method,amount,createdAt:new Date().toISOString()});
describe('centavo helpers',()=>{
 it('rounds decimal and scientific notation half up',()=>{expect(toCentavos(1.005)).toBe(101);expect(toCentavos(0.005)).toBe(1);expect(toCentavos(1e-7)).toBe(0);expect(fromCentavos(101)).toBe(1.01);expect(multiplyCentavos(101,0.5)).toBe(51);});
 it('rejects invalid and unsafe money',()=>{expect(()=>toCentavos(NaN)).toThrow();expect(()=>toCentavos(-1)).toThrow();expect(()=>toCentavos(1e20)).toThrow();});
});
describe('totals',()=>{
 it('extracts inclusive VAT',()=>{expect(calculateTotals([item()])).toMatchObject({subtotal:112,taxTotal:12,grandTotal:112});});
 it('supports exclusive VAT in the same calculation',()=>{expect(calculateTotals([item({unitPrice:100})],undefined,'exclusive')).toMatchObject({taxTotal:12,grandTotal:112});});
 it('zero tax, fractional weight, and quantity',()=>{expect(calculateTotals([item({unitPrice:55,quantity:0.5,taxRate:0,unitShortName:'kg'})])).toMatchObject({grandTotal:27.5,taxTotal:0});});
 it('applies percent then order discounts before extracting tax',()=>{expect(calculateTotals([item({discountType:'percent',discountValue:10})],{type:'percent',value:50})).toMatchObject({itemDiscountTotal:11.2,grandTotal:50.4,taxTotal:5.4});});
 it('fixed discounts apply per line and cap at base',()=>{expect(calculateTotals([item({quantity:2,discountType:'fixed',discountValue:24})])).toMatchObject({itemDiscountTotal:24,grandTotal:200});expect(calculateTotals([item({discountType:'fixed',discountValue:999})],{type:'fixed',value:999}).grandTotal).toBe(0);expect(calculateTotals([item()],{type:'percent',value:150}).grandTotal).toBe(0);});
 it('allocates a one-cent order discount deterministically',()=>{const t=calculateTotals([item({id:'a',unitPrice:0.01}),item({id:'b',unitPrice:0.01}),item({id:'c',unitPrice:0.01})],{type:'fixed',value:0.01});expect(t.items.map(i=>i.orderDiscountAmount)).toEqual([0.01,0,0]);expect(t.grandTotal).toBe(0.02);});
 it('proportionally distributes discounts across mixed tax rates',()=>{const t=calculateTotals([item(),item({id:'b',unitPrice:224,taxRate:0})],{type:'fixed',value:33.6});expect(t.items.map(i=>i.orderDiscountAmount)).toEqual([11.2,22.4]);expect(t.taxTotal).toBe(10.8);expect(t.grandTotal).toBe(302.4);});
 it('handles empty and invalid carts',()=>{expect(calculateTotals([]).grandTotal).toBe(0);expect(()=>calculateTotals([item({quantity:0})])).toThrow();});
 it('preserves cent totals over many allocations',()=>{for(let n=1;n<=30;n++){const t=calculateTotals(Array.from({length:n},(_,i)=>item({id:String(i),unitPrice:0.07+i/100})),{type:'fixed',value:0.03});expect(t.items.reduce((a,i)=>a+toCentavos(i.orderDiscountAmount),0)).toBe(toCentavos(t.orderDiscount.amount));expect(toCentavos(t.grandTotal)).toBe(toCentavos(t.subtotal)-toCentavos(t.orderDiscount.amount));}});
});
describe('payments',()=>{
 it('covers split payments exactly',()=>expect(calculatePayments(112,[payment('cash',50),payment('gcash',62)])).toMatchObject({amountPaid:112,change:0,balanceDue:0,paymentStatus:'paid'}));
 it('returns change for cash only',()=>expect(calculatePayments(112,[payment('gcash',50),payment('cash',100)])).toMatchObject({amountPaid:112,change:38}));
 it('blocks non-cash overpayment',()=>expect(()=>calculatePayments(112,[payment('cash',100),payment('card',13)])).toThrow());
 it('computes partial and unpaid balances',()=>{expect(calculatePayments(112,[]).paymentStatus).toBe('unpaid');expect(calculatePayments(112,[payment('maya',12)])).toMatchObject({balanceDue:100,paymentStatus:'partial'});});
});
