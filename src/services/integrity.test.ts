import { beforeEach, expect, it, vi } from 'vitest';
vi.hoisted(() => { const values = new Map<string, string>(); const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); }, removeItem: (key: string) => { values.delete(key); } }; Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true }); Object.defineProperty(globalThis, 'window', { value: { localStorage: storage }, configurable: true }); });
import { dataService } from './dataService';
import type { Backup } from './backupSchema';
import { createPhase5Seed } from '../data/seed/phase5';
import { useAuthStore } from '../store/useAuthStore';
import { useStaffStore } from '../store/useStaffStore';
import { useRoleStore } from '../store/useRoleStore';
import { useCustomerStore } from '../store/useCustomerStore';
import { useActivityStore } from '../store/useActivityStore';
import { runIntegrityCheck } from '../utils/integrity';
import { integrityService } from './integrityService';
beforeEach(() => { const s = createPhase5Seed(); useStaffStore.setState({ staff: s.staff }); useRoleStore.setState({ roles: s.roles }); useAuthStore.setState({ currentUserId: 'staff-admin' }); dataService.reset(); useAuthStore.setState({ currentUserId: 'staff-admin' }); });
const cases: [string, (data: Backup) => void, string][] = [
  ['negative stock', d => { d.movements.push({ id:'bad',productId:d.products[0].id,branchId:'Main Branch',type:'out',quantity:1000000,reason:'test',createdAt:new Date().toISOString(),createdBy:'test' }); }, 'stock:'],
  ['order totals', d => { d.orders[0].grandTotal += 1; }, 'order-total:'],
  ['payments', d => { d.orders[0].amountPaid += 1; }, 'order-paid:'],
  ['balance', d => { d.orders[0].balanceDue += 1; }, 'order-balance:'],
  ['refunds', d => { d.orders[0].refundedTotal += 1; }, 'refund:'],
  ['customer credit', d => { d.customers[0].creditBalance += 1; }, 'credit:'],
  ['wallet', d => { d.customers[0].walletBalance += 1; }, 'wallet:'],
  ['received quantity', d => { d.purchases[0].items[0].receivedQty = d.purchases[0].items[0].orderedQty + 1; }, 'purchase:'],
  ['SKU duplicates', d => { d.products[1].sku = d.products[0].sku; d.products[1].hasVariants = false; }, 'duplicate:SKU:'],
  ['order number duplicates', d => { d.orders[1].orderNo = d.orders[0].orderNo; }, 'duplicate:order number:'],
  ['coupon duplicates', d => { d.phase7.coupons[1].code = d.phase7.coupons[0].code; }, 'duplicate:coupon code:'],
  ['branch duplicates', d => { d.phase7.branches[1].code = d.phase7.branches[0].code; }, 'duplicate:branch code:'],
  ['staff email duplicates', d => { d.phase5.staff[1].email = d.phase5.staff[0].email; }, 'duplicate:staff email:'],
  ['missing role', d => { d.phase5.staff[0].role = 'missing'; }, 'role:'],
  ['missing branch', d => { d.phase5.staff[0].branchIds = ['missing']; }, 'staff-branch:'],
  ['missing category', d => { d.products[0].categoryId = 'missing'; }, 'product:'],
  ['invalid settings', d => { d.phase7.settings.general.businessName = ''; }, 'settings'],
];
it.each(cases)('reports %s without modifying the source snapshot', (_name, mutate, prefix) => {
  const data = dataService.snapshot(); mutate(data); const before = structuredClone(data);
  expect(runIntegrityCheck(data).some(issue => issue.id.startsWith(prefix))).toBe(true); expect(data).toEqual(before);
});
it('repairs only summary balances and is idempotent', () => {
  useCustomerStore.setState(s => ({ customers: s.customers.map(c => ({ ...c, creditBalance: c.creditBalance + 1, walletBalance: c.walletBalance + 1 })) }));
  integrityService.repair('credit'); integrityService.repair('wallet');
  const data = dataService.snapshot(), logCount = useActivityStore.getState().logs.length;
  expect(runIntegrityCheck(data).some(issue => issue.fixable)).toBe(false);
  integrityService.repair('credit'); integrityService.repair('wallet'); expect(dataService.snapshot()).toEqual(data); expect(useActivityStore.getState().logs).toHaveLength(logCount);
});
