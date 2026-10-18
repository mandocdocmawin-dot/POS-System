import {defaultSettings} from '../config/defaultSettings';
import type { Backup } from '../services/backupSchema';
import { settingsSchema } from '../types/settings';
import { calculateTotals, toCentavos } from './pos';
import { accountBalance, mergeLedger } from './ledger';
import type { FinanceData } from '../types/accounts';
export interface IntegrityIssue { id: string; severity: 'error' | 'warning'; area: string; message: string; entity?: string; fixable: boolean }
export function customerCredit(snapshot: Pick<Backup, 'orders'>, id: string) { return snapshot.orders.filter(o => o.customerId === id && o.orderStatus !== 'cancelled').reduce((sum, o) => sum + toCentavos(o.balanceDue), 0); }
export function customerWallet(snapshot: Pick<Backup, 'walletTransactions'>, id: string) { return toCentavos(snapshot.walletTransactions.filter(t => t.customerId === id).toSorted((a,b)=>a.createdAt.localeCompare(b.createdAt)).at(-1)?.balanceAfter ?? 0); }
export function runIntegrityCheck(data: Backup): IntegrityIssue[] {
  const issues: IntegrityIssue[] = [];
  const add = (id: string, area: string, message: string, entity?: string, fixable = false, severity: IntegrityIssue['severity'] = 'error') => issues.push({ id, area, message, entity, fixable, severity });
  const stock = new Map<string, number>();
  data.movements.forEach(m => { const key = `${m.productId}:${m.variantId ?? ''}:${m.branchId ?? 'Main Branch'}`; stock.set(key, (stock.get(key) ?? 0) + (m.type === 'out' ? -m.quantity : m.quantity)); });
  stock.forEach((quantity, key) => { if (quantity < -1e-8) add(`stock:${key}`, 'Stock', `Negative available quantity (${quantity}) for ${key}.`, key); });
  for (const order of data.orders) {
    try {
      const expected=calculateTotals(order.items,order.orderDiscount,{...defaultSettings.tax,...order.receiptSnapshot?.tax,mode:order.taxMode??'inclusive',vatRegistered:order.taxRegistered??true},order.coupon?order.items.map(l=>toCentavos(l.orderDiscountAmount)):undefined);
      const summaryWrong=(['subtotal','itemDiscountTotal','taxTotal'] as const).some(k=>toCentavos(order[k])!==toCentavos(expected[k]));
      const lineWrong=order.items.some((line,i)=>(['lineSubtotal','lineDiscount','orderDiscountAmount','lineTax','lineTotal'] as const).some(k=>toCentavos(line[k])!==toCentavos(expected.items[i][k])));
      if(summaryWrong||lineWrong||(!order.coupon&&toCentavos(order.orderDiscount.amount)!==toCentavos(expected.orderDiscount.amount)))add('order-components:'+order.id,'Orders',order.orderNo+': line discounts, tax or subtotal are inconsistent.',order.id);
    } catch {add('order-components:'+order.id,'Orders',order.orderNo+': items cannot be recalculated.',order.id);}
    const lines = order.items.reduce((sum, line) => sum + toCentavos(line.lineTotal), 0), total = toCentavos(order.grandTotal);
    if (lines + (order.roundingAdjustment ?? 0) !== total) add(`order-total:${order.id}`, 'Orders', `${order.orderNo}: totals do not equal the sum of allocated lines and rounding.`, order.id);
    const paid = order.payments.reduce((sum, payment) => sum + toCentavos(payment.amount), 0) - toCentavos(order.change), balance = Math.max(0, total - paid);
    if (paid !== toCentavos(order.amountPaid)) add(`order-paid:${order.id}`, 'Orders', `${order.orderNo}: amount paid differs from payments.`, order.id);
    if (order.orderStatus !== 'cancelled' && (balance !== toCentavos(order.balanceDue) || order.paymentStatus !== (balance === 0 ? 'paid' : paid > 0 ? 'partial' : 'unpaid'))) add(`order-balance:${order.id}`, 'Orders', `${order.orderNo}: balance or payment status is inconsistent.`, order.id);
    const refunds = data.refunds.filter(r => r.orderId === order.id).reduce((sum, r) => sum + toCentavos(r.refundAmount), 0);
    if (refunds !== toCentavos(order.refundedTotal) || refunds > paid) add(`refund:${order.id}`, 'Refunds', `${order.orderNo}: refunded total is inconsistent or exceeds payments.`, order.id);
  }
  for (const customer of data.customers) {
    if (toCentavos(customer.creditBalance) !== customerCredit(data, customer.id)) add(`credit:${customer.id}`, 'Customer credit', `${customer.name}: credit balance differs from non-cancelled order balances.`, customer.id, true);
    if (toCentavos(customer.walletBalance) !== customerWallet(data, customer.id)) add(`wallet:${customer.id}`, 'Customer wallets', `${customer.name}: wallet balance differs from the last transaction.`, customer.id, true);
  }
  for (const purchase of data.purchases) for (const line of purchase.items) {
    const returned = data.purchaseReturns.filter(r => r.purchaseId === purchase.id).flatMap(r => r.items).filter(r => r.purchaseLineId === line.id).reduce((sum, r) => sum + r.quantity, 0);
    if (line.receivedQty > line.orderedQty || returned > line.receivedQty) add(`purchase:${purchase.id}:${line.id}`, 'Purchases', `${purchase.purchaseNo}: received/returned quantity exceeds its source quantity.`, purchase.id);
  }
  for (const transfer of data.phase7.transfers.filter(t => ['in_transit', 'received'].includes(t.status))) for (const line of transfer.items) {
    const out = data.movements.filter(m => m.reference === transfer.transferNo && m.productId === line.productId && m.variantId === line.variantId && m.branchId === transfer.fromBranchId && m.type === 'out').reduce((sum, m) => sum + m.quantity, 0);
    if (Math.abs(out - line.quantity) > 1e-8) add(`transfer:${transfer.id}:${line.productId}:${line.variantId ?? ''}`, 'Transfers', `${transfer.transferNo}: transfer-out movements do not match its items.`, transfer.id);
  }
  const duplicates = (area: string, values: { id: string; value: string }[]) => { const seen = new Set<string>(); values.forEach(({ id, value }) => { const normalized = value.trim().toLowerCase(); if (seen.has(normalized)) add(`duplicate:${area}:${id}`, 'Duplicates', `Duplicate ${area}: ${value}.`, id); seen.add(normalized); }); };
  duplicates('SKU', [...data.products.filter(p => !p.hasVariants), ...data.variants].map(p => ({ id: p.id, value: p.sku })));
  duplicates('order number', data.orders.map(o => ({ id: o.id, value: o.orderNo })));
  duplicates('coupon code', data.phase7.coupons.map(c => ({ id: c.id, value: c.code })));
  duplicates('branch code', data.phase7.branches.map(b => ({ id: b.id, value: b.code })));
  duplicates('staff email', data.phase5.staff.map(s => ({ id: s.id, value: s.email })));
  for (const staff of data.phase5.staff) {
    if (!data.phase5.roles.some(r => r.id === staff.role)) add(`role:${staff.id}`, 'References', `${staff.name}: missing role.`, staff.id);
    for (const branch of staff.branchIds) if (!data.phase7.branches.some(b => b.id === branch)) add(`staff-branch:${staff.id}:${branch}`, 'References', `${staff.name}: missing branch ${branch}.`, staff.id);
  }
  for (const product of data.products) for (const [key, values] of [['categoryId', data.categories], ['brandId', data.brands], ['unitId', data.units]] as const) if (product[key] && !values.some(value => value.id === product[key])) add(`product:${product.id}:${key}`, 'References', `${product.name}: missing ${key}.`, product.id);
  for (const record of [...data.movements, ...data.orders, ...data.heldOrders, ...data.phase6.manualEntries, ...data.phase5.records]) if (record.branchId && !data.phase7.branches.some(b => b.id === record.branchId)) add(`branch:${record.id}`, 'References', `Record ${record.id}: missing branch ${record.branchId}.`, record.id);
  const finance: FinanceData = { orders:data.orders,collections:data.customerPayments,refunds:data.refunds,wallet:data.walletTransactions,supplierPayments:data.supplierPayments,purchases:data.purchases,purchaseReturns:data.purchaseReturns,suppliers:data.suppliers,payroll:data.phase5.runs,staff:data.phase5.staff,products:data.products,productCategories:data.categories,movements:data.movements,customers:data.customers,...data.phase6 };
  const ledger = mergeLedger(finance);
  for (const account of data.phase6.accounts) if(accountBalance(account,ledger)<0) add(`account:${account.id}`, 'Accounts', `${account.name}: account balance is negative.`, account.id);
  if (!settingsSchema.safeParse(data.phase7.settings).success) add('settings', 'Settings', 'Settings do not pass their schema.');
  return issues;
}
