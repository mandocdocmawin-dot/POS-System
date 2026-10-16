import type { Order } from '../types/pos';
import { localDate } from './attendance';
import { toCentavos, fromCentavos, sumCentavos } from './pos';
export function staffPerformance(orders: Order[], start: string, end: string) {
  const byCashier = new Map<string, { name: string; orders: number; cents: number }>();
  for (const order of orders) {
    const date = localDate(new Date(order.createdAt));
    if (date < start || date > end || order.orderStatus === 'cancelled') continue;
    const key=order.cashierId??order.cashier;
    const row = byCashier.get(key) ?? { name: order.cashier, orders: 0, cents: 0 };
    row.orders++;
    row.cents = sumCentavos([row.cents, Math.max(0, toCentavos(order.grandTotal) - toCentavos(order.refundedTotal))]);
    byCashier.set(key, row);
  }
  const ranked = [...byCashier.values()].sort((a, b) => b.cents - a.cents || b.orders - a.orders || a.name.localeCompare(b.name));
  return { ranked: ranked.map(r => ({ name: r.name, orders: r.orders, sales: fromCentavos(r.cents) })), totalOrders: ranked.reduce((n, r) => n + r.orders, 0), totalSales: fromCentavos(sumCentavos(ranked.map(r => r.cents))) };
}
