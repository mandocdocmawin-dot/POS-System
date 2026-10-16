import { describe, expect, it } from 'vitest';
import { defaultRoles, permissionKeys, routePermission, routePermissions } from '../config/permissions';
import type { Role } from '../types/staff';
import { hasPermission, PermissionError } from './permissions';

describe('role permissions', () => {
  it('grants Admin every permission, including future permissions', () => {
    for (const key of [...permissionKeys, 'future:manage']) {
      expect(hasPermission({ role: 'admin' }, key, [])).toBe(true);
    }
  });

  it('grants Manager everything except staff management, payroll and settings', () => {
    for (const key of permissionKeys) {
      expect(hasPermission({ role: 'manager' }, key), key).toBe(
        !['staff:manage', 'payroll:view', 'settings:manage'].includes(key),
      );
    }
    expect(hasPermission({ role: 'manager' }, 'future:manage')).toBe(false);
  });

  it('limits Cashier to sales, read access, customer creation and own attendance/schedule', () => {
    const allowed = ['pos:use', 'pos:hold', 'orders:view', 'customers:view', 'customers:edit',
      'products:view', 'attendance:view', 'schedule:view'];
    for (const key of permissionKeys) {
      expect(hasPermission({ role: 'cashier' }, key), key).toBe(allowed.includes(key));
    }
  });

  it('denies unauthenticated users and unknown roles', () => {
    for (const user of [null, undefined, { role: 'missing' }]) {
      for (const key of permissionKeys) expect(hasPermission(user, key)).toBe(false);
    }
  });

  it('uses edited and custom role data immediately without mutating defaults', () => {
    const roles: Role[] = structuredClone(defaultRoles);
    const cashier = roles.find(role => role.id === 'cashier')!;
    cashier.permissions.push('orders:refund');
    expect(hasPermission({ role: 'cashier' }, 'orders:refund', roles)).toBe(true);
    cashier.permissions = cashier.permissions.filter(key => key !== 'orders:refund');
    expect(hasPermission({ role: 'cashier' }, 'orders:refund', roles)).toBe(false);
    roles.push({ id: 'auditor', name: 'Auditor', description: 'Read orders',
      permissions: ['orders:view'], isSystem: false });
    expect(hasPermission({ role: 'auditor' }, 'orders:view', roles)).toBe(true);
    expect(hasPermission({ role: 'auditor' }, 'orders:cancel', roles)).toBe(false);
    expect(hasPermission({ role: 'cashier' }, 'orders:refund')).toBe(false);
  });

  it('exposes a typed permission error with a user-facing message', () => {
    const error = new PermissionError('orders:refund');
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('PermissionError');
    expect(error.permission).toBe('orders:refund');
    expect(error.message).toBe("Your role can't do this");
  });
});

describe('route permission mapping', () => {
  // Each tuple independently specifies Admin, Manager and Cashier access.
  const cases: [string, string, boolean, boolean, boolean][] = [
    ['/', 'dashboard:view', true, true, false],
    ['/pos', 'pos:use', true, true, true],
    ['/products', 'products:view', true, true, true],
    ['/products/all-products', 'products:view', true, true, true],
    ['/products/add', 'products:create', true, true, false],
    ['/products/add-product', 'products:create', true, true, false],
    ['/products/item-1/edit', 'products:edit', true, true, false],
    ['/inventory/stock-list', 'inventory:view', true, true, false],
    ['/inventory/stock-in', 'inventory:adjust', true, true, false],
    ['/inventory/stock-out', 'inventory:adjust', true, true, false],
    ['/inventory/adjustment', 'inventory:adjust', true, true, false],
    ['/inventory/stock-adjustment', 'inventory:adjust', true, true, false],
    ['/orders', 'orders:view', true, true, true],
    ['/orders/all-orders', 'orders:view', true, true, true],
    ['/orders/order-1', 'orders:view', true, true, true],
    ['/orders/refunded', 'orders:refund', true, true, false],
    ['/customers', 'customers:view', true, true, true],
    ['/customers/customer-list', 'customers:view', true, true, true],
    ['/customers/add', 'customers:edit', true, true, true],
    ['/customers/add-customer', 'customers:edit', true, true, true],
    ['/customers/person-1/edit', 'customers:manage', true, true, false],
    ['/customers/wallet', 'customers:manage', true, true, false],
    ['/customers/wallet-balance', 'customers:manage', true, true, false],
    ['/suppliers/supplier-list', 'suppliers:view', true, true, false],
    ['/suppliers/add-supplier', 'suppliers:manage', true, true, false],
    ['/suppliers/supplier-1/edit', 'suppliers:manage', true, true, false],
    ['/purchases/purchase', 'purchases:view', true, true, false],
    ['/purchases/add-purchase', 'purchases:create', true, true, false],
    ['/staff', 'staff:view', true, true, false],
    ['/staff/staff-list', 'staff:view', true, true, false],
    ['/staff/add', 'staff:manage', true, false, false],
    ['/staff/add-staff', 'staff:manage', true, false, false],
    ['/staff/person-1/edit', 'staff:manage', true, false, false],
    ['/staff/roles', 'roles:manage', true, true, false],
    ['/staff/role-permission', 'roles:manage', true, true, false],
    ['/staff/attendance', 'attendance:view', true, true, true],
    ['/staff/schedule', 'schedule:view', true, true, true],
    ['/staff/holidays', 'holidays:view', true, true, false],
    ['/staff/payroll', 'payroll:view', true, false, false],
    ['/settings/general', 'settings:manage', true, false, false],
    ['/reports/sales', 'reports:view', true, true, false],
    ['/accounts/income', 'accounts:view', true, true, false],
    ['/profile/overview', 'pages:view', true, true, false],
  ];

  it.each(cases)('%s requires %s and respects default roles', (path, key, admin, manager, cashier) => {
    expect(routePermission(path)).toBe(key);
    for (const [role, expected] of [['admin', admin], ['manager', manager], ['cashier', cashier]] as const) {
      expect(hasPermission({ role }, routePermission(path)), `${path}: ${role}`).toBe(expected);
    }
  });

  it('recognizes every explicit mapping, including parameterized edits', () => {
    for (const [path, key] of Object.entries(routePermissions)) {
      expect(routePermission(path.replace(':id', 'record-123'))).toBe(key);
    }
  });

  it('normalizes trailing slashes and does not match unrelated path prefixes', () => {
    expect(routePermission('/staff/payroll/')).toBe('payroll:view');
    expect(routePermission('/staffing')).toBe('pages:view');
    expect(routePermission('/products-other/add')).toBe('pages:view');
    expect(routePermission('/unregistered')).toBe('pages:view');
  });
});
