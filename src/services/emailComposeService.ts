import { currentUser, canUse, activePeople } from './phase8Context';
import { useCustomerStore } from '../store/useCustomerStore';
import { useSupplierStore } from '../store/useSupplierStore';
import { useRefundStore } from '../store/useRefundStore';
import { orderService } from './orderService';
import { purchaseService } from './purchaseService';
import { templateService } from './templateService';
import { settingsService } from './settingsService';
import { formatPHP } from '../utils/money';
import type { Email } from '../types/phase8';
export const emailComposeService = {
  suggestions: () => { currentUser('email:use'); return [...activePeople().map(s => ({ name: s.name, email: s.email })), ...(canUse('customers:view') ? useCustomerStore.getState().customers.filter(c => c.email).map(c => ({ name: c.name, email: c.email! })) : []), ...(canUse('suppliers:view') ? useSupplierStore.getState().suppliers.filter(s => s.email).map(s => ({ name: s.name, email: s.email! })) : [])]; },
  prepare: (type: string, id: string): Partial<Email> => {
    const user = currentUser('email:use'), values: Record<string, string> = { 'business.name': settingsService.get().general.businessName, 'staff.name': user.name };
    let to: string[] = [], templateId = type, relatedType = 'order';
    if (type === 'purchase-order') {
      currentUser('purchases:view'); const purchase = purchaseService.get(id); if (!purchase) throw new Error('Purchase not found.'); const supplier = useSupplierStore.getState().suppliers.find(s => s.id === purchase.supplierId); to = supplier?.email ? [supplier.email] : []; Object.assign(values, { 'supplier.name': supplier?.name ?? 'Supplier', 'purchase.no': purchase.purchaseNo, 'branch.name': purchase.receivingBranchId ?? purchase.branchId ?? '' }); relatedType = 'purchase';
    } else {
      currentUser('orders:view'); let order = type === 'payment-reminder' ? orderService.list({ branchId: 'all' }).find(o => o.customerId === id && o.balanceDue > 0 && o.orderStatus !== 'cancelled') : undefined;
      if (type === 'refund-confirmation') { const refund = useRefundStore.getState().refunds.find(r => r.id === id); if (!refund) throw new Error('Refund not found.'); order = orderService.get(refund.orderId); relatedType = 'refund'; }
      else if (type !== 'payment-reminder') order = orderService.get(id);
      if (!order) throw new Error('No accessible related order found.');
      const customer = useCustomerStore.getState().customers.find(c => c.id === order!.customerId); to = customer?.email ? [customer.email] : [];
      Object.assign(values, { 'customer.name': customer?.name ?? order.customerName, 'order.no': order.orderNo, 'order.total': formatPHP(order.grandTotal), 'order.balance': formatPHP(order.balanceDue), 'order.date': order.createdAt.slice(0, 10), 'branch.name': order.branchId });
      if (type === 'payment-reminder') { relatedType = 'customer'; templateId = 'payment-reminder'; }
    }
    const template = templateService.list().find(t => t.id === templateId); if (!template) throw new Error('Template not found.');
    return { to, subject: templateService.render(template.subject, values).text, body: templateService.render(template.body, values).text, relatedEntity: { type: relatedType, id }, templateId };
  },
};
