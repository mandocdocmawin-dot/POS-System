import { useOrderStore } from '../store/useOrderStore';
import { useRefundStore } from '../store/useRefundStore';
import { useHeldOrderStore } from '../store/useHeldOrderStore';
import { useProductStore } from '../store/useProductStore';
import { useStockStore } from '../store/useStockStore';
import { branchService } from './branchService';
import { currentUser } from './phase8Context';
import { localDay } from '../utils/calendar';
import { toCentavos } from '../utils/pos';
export function storeSummary() {
  currentUser('pos:use');
  const branchId = branchService.activeId(), today = localDay(new Date()), orders = useOrderStore.getState().orders.filter(o => o.branchId === branchId && o.orderStatus !== 'cancelled'), ids = new Set(orders.map(o => o.id));
  const sales = orders.flatMap(o => o.payments).filter(p => localDay(new Date(p.createdAt)) === today).reduce((sum, p) => sum + toCentavos(p.amount), 0) - useRefundStore.getState().refunds.filter(r => ids.has(r.orderId) && localDay(new Date(r.createdAt)) === today).reduce((sum, r) => sum + toCentavos(r.refundAmount), 0);
  const balances = new Map<string, number>();
  useStockStore.getState().movements.filter(m => m.branchId === branchId).forEach(m => balances.set(m.productId, (balances.get(m.productId) ?? 0) + (m.type === 'out' ? -m.quantity : m.quantity)));
  return { branchId, sales, orders: orders.filter(o => localDay(new Date(o.createdAt)) === today).length, held: useHeldOrderStore.getState().heldOrders.filter(o => o.branchId === branchId).length, lowStock: useProductStore.getState().products.filter(p => p.status === 'active' && (balances.get(p.id) ?? 0) <= p.reorderLevel).length };
}
