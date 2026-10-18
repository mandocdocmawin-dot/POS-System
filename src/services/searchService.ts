import { routes } from '../config/menu';
import { routePermission } from '../config/permissions';
import { useProductStore } from '../store/useProductStore';
import { useCustomerStore } from '../store/useCustomerStore';
import { useOrderStore } from '../store/useOrderStore';
import { usePurchaseStore } from '../store/usePurchaseStore';
import { useSupplierStore } from '../store/useSupplierStore';
import { useStaffStore } from '../store/useStaffStore';
import { useCouponStore } from '../store/useCouponStore';
import { useContentStore } from '../store/useContentStore';
import { useRoleStore } from '../store/useRoleStore';
import type { Staff } from '../types/staff';
import { rankSearch, type SearchResult } from '../utils/search';
import { hasPermission, PermissionError } from '../utils/permissions';
import { ticketService } from './ticketService';
import { currentUser } from './phase8Context';
import { branchService } from './branchService';
export const searchService = {
  recent: () => { const user = currentUser(); return useContentStore.getState().recentSearches[user.id] ?? []; },
  remember: (query: string) => { const user = currentUser(), q = query.trim(); if (!q) return; useContentStore.setState(s => ({ recentSearches: { ...s.recentSearches, [user.id]: [q, ...(s.recentSearches[user.id] ?? []).filter(old => old !== q)].slice(0, 8) } })); },
  search: (query: string, user: Staff = currentUser(), activeBranch = branchService.activeId()) => {
    if (user.id !== currentUser().id) throw new PermissionError('search:identity');
    branchService.assertAccess(activeBranch);
    const can = (permission: string) => hasPermission(user, permission, useRoleStore.getState().roles), results: SearchResult[] = [];
    const add = (group: string, id: string, label: string, link: string, terms: (string | undefined)[]) => results.push({ group, id, label, link, terms: terms.filter((value): value is string => !!value) });
    routes.filter(r => r.layout !== 'auth' && can(routePermission(r.path))).forEach(r => add('Pages', r.path, r.title, r.path, [r.title, r.path]));
    if (can('products:view')) useProductStore.getState().products.forEach(p => add('Products', p.id, p.name, `/products/all-products?q=${encodeURIComponent(p.sku)}`, [p.name, p.sku, p.barcode]));
    if (can('customers:view')) useCustomerStore.getState().customers.forEach(c => add('Customers', c.id, c.name, `/customers/${c.id}`, [c.name, c.phone]));
    if (can('orders:view')) useOrderStore.getState().orders.filter(o => o.branchId === activeBranch).forEach(o => add('Orders', o.id, o.orderNo, `/orders/${o.id}`, [o.orderNo]));
    if (can('purchases:view')) usePurchaseStore.getState().purchases.filter(p => (p.receivingBranchId ?? p.branchId) === activeBranch).forEach(p => add('Purchases', p.id, p.purchaseNo, `/purchases/${p.id}`, [p.purchaseNo]));
    if (can('suppliers:view')) useSupplierStore.getState().suppliers.forEach(s => add('Suppliers', s.id, s.name, `/suppliers/supplier-list?q=${encodeURIComponent(s.name)}`, [s.name]));
    if (can('staff:view')) useStaffStore.getState().staff.forEach(s => add('Staff', s.id, s.name, `/profile/${s.id}`, [s.name, s.staffNo]));
    if (can('coupons:manage')) useCouponStore.getState().coupons.filter(c => !c.branchIds?.length || c.branchIds.includes(activeBranch)).forEach(c => add('Coupons', c.id, c.code, `/settings/coupons?q=${encodeURIComponent(c.code)}`, [c.code, c.name]));
    if (can('help:use')) { useContentStore.getState().faqs.filter(f => f.status === 'active').forEach(f => add('Help', f.id, f.question, `/faq-s?q=${encodeURIComponent(f.question)}`, [f.question, f.answer])); ticketService.list().forEach(t => add('Help', t.id, t.ticketNo + ' ' + t.subject, `/help-center?ticket=${t.id}`, [t.ticketNo, t.subject])); }
    return rankSearch(results, query);
  },
};
