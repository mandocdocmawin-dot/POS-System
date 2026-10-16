import { describe, expect, it } from 'vitest';
import { createPosSeed } from '../data/seed/pos';
import { staffPerformance } from './staffPerformance';
const base = createPosSeed().orders[0];
describe('staff performance from real orders', () => {
  it('ranks by refund-adjusted sales and counts actual orders per cashier', () => {
    const rows = [
      { ...base, id:'1', cashier:'Ana', grandTotal:100, refundedTotal:40, createdAt:'2026-10-16T01:00:00.000Z', orderStatus:'partially_refunded' as const },
      { ...base, id:'2', cashier:'Ana', grandTotal:20, refundedTotal:0, createdAt:'2026-10-16T02:00:00.000Z' },
      { ...base, id:'3', cashier:'Marco', grandTotal:90, refundedTotal:0, createdAt:'2026-10-16T03:00:00.000Z' },
      { ...base, id:'4', cashier:'Cancelled', grandTotal:999, refundedTotal:0, orderStatus:'cancelled' as const, createdAt:'2026-10-16T04:00:00.000Z' },
    ];
    expect(staffPerformance(rows,'2026-10-16','2026-10-16')).toEqual({ranked:[{name:'Marco',orders:1,sales:90},{name:'Ana',orders:2,sales:80}],totalOrders:3,totalSales:170});
  });
  it('uses Philippine dates and ignores orders outside the selected range', () => {
    const rows = [{...base,cashier:'Cashier',grandTotal:1.01,refundedTotal:0,createdAt:'2026-10-15T16:00:00.000Z'}, {...base,id:'outside',createdAt:'2026-10-15T15:59:00.000Z'}];
    expect(staffPerformance(rows,'2026-10-16','2026-10-16').totalSales).toBe(1.01);
    expect(staffPerformance([],'2026-10-16','2026-10-16').ranked).toEqual([]);
  });
});
