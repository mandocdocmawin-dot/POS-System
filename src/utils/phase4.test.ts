import {describe,it,expect} from 'vitest';
import {refundLine,reversedPoints} from './refund';
import {supplierBalance,purchaseBalance} from './supplierBalance';
import {aging} from './aging';
import {createPosSeed} from '../data/seed/pos';
import {createPhase4Seed} from '../data/seed/phase4';
import type {RefundLine} from '../types/phase4';
describe('Phase 4 money helpers',()=>{
 it('distributes last-unit remainder across repeated partial refunds',()=>{const l={...createPosSeed().orders[0].items[0],quantity:3,lineTotal:10};const history:RefundLine[]=[];for(let i=0;i<3;i++)history.push(refundLine(l,1,history));expect(history.map(x=>x.lineRefund)).toEqual([3.33,3.34,3.33]);expect(()=>refundLine(l,1,history)).toThrow('quantity');});
 it('handles decimal quantities and rejects invalid quantities',()=>{const l={...createPosSeed().orders[0].items[0],quantity:0.75,lineTotal:1};const first=refundLine(l,0.25,[]);expect(first.lineRefund).toBe(.33);expect(refundLine(l,.5,[first]).lineRefund).toBe(.67);for(const q of [0,-1,NaN,Infinity,1])expect(()=>refundLine(l,q,[])).toThrow();});
 it('reverses loyalty proportionally using a cumulative floor',()=>{expect(reversedPoints(7,50,100)).toBe(3);expect(reversedPoints(7,100,100)).toBe(7);expect(reversedPoints(7,0,0)).toBe(0);});
 it('derives supplier liabilities and overpaid return credits',()=>{const s=createPosSeed(),d=createPhase4Seed(s.customers,s.orders),p=d.purchases[0];const b=purchaseBalance(p,d.returns,d.payments);expect(b.balanceDue).toBe(0);expect(b.credit).toBe(p.items[0].unitCost);const report=supplierBalance(p.supplierId,[p],d.returns,d.payments.filter(x=>x.supplierId===p.supplierId&&x.purchaseId===p.id));expect(report.balance).toBe(-p.items[0].unitCost);});
 it('ages remaining unpaid balances at 30 and 60 day boundaries',()=>{const s=createPosSeed(),d=createPhase4Seed(s.customers,s.orders),base=d.purchases[0];const rows=['2026-10-01','2026-09-01','2026-08-01'].map(date=>({...base,date,balanceDue:10}));expect(aging(rows,new Date('2026-10-16T12:00:00'))).toEqual([10,10,10]);});
});
