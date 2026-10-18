import type { Notification, NotificationPrefs, NotificationType } from '../types/phase8';
import { localDay } from './calendar';
export interface NotificationData {
  branchId: string; stock: { quantity: number; reorder: number }[];
  orders: { balanceDue: number; dueDate?: string; branchId: string }[];
  held: { createdAt: string; branchId: string }[]; transfers: { status: string; toBranchId: string }[];
  coupons: { endsAt?: string; status: string }[]; draftPayroll: number;
  lateStaff: number; ownShiftStarted: boolean; clockedIn: boolean;
  documents: { staffId: string; expiresAt?: string }[]; reminders: { start: string; reminderMinutes?: number }[];
  unreadChat: number; unreadEmail: number; lastBackupAt?: string; storageRatio: number; localBytes: number;
}
export function deriveNotifications(data: NotificationData, user: { id: string; permissions: string[] }, prefs: NotificationPrefs, now: Date): Notification[] {
  const day = localDay(now), result: Notification[] = [];
  const can = (permission: string) => user.permissions.includes(permission);
  const add = (type: NotificationType, count: number, title: string, link: string, severity: Notification['severity'] = 'info', permission?: string) => {
    if (!count || prefs.types[type] === false || (permission && !can(permission))) return;
    result.push({ key: `${type}:${day}:${data.branchId}:${count}`, type, severity, title, body: `${count} ${count === 1 ? 'item needs' : 'items need'} attention. Demo notification.`, link, createdAt: now.toISOString(), branchId: data.branchId });
  };
  add('low_stock', data.stock.filter(s => s.quantity > 0 && s.quantity <= s.reorder).length, 'Low stock', '/products/all-products', 'warning', 'products:view');
  add('out_of_stock', data.stock.filter(s => s.quantity <= 0).length, 'Out of stock', '/products/all-products', 'critical', 'products:view');
  const orders = data.orders.filter(o => o.branchId === data.branchId && o.balanceDue > 0 && o.dueDate);
  add('due_balance', orders.filter(o => o.dueDate!.slice(0, 10) === day).length, 'Balances due today', '/orders/all-orders', 'warning', 'orders:view');
  add('overdue_balance', orders.filter(o => o.dueDate!.slice(0, 10) < day).length, 'Overdue balances', '/orders/all-orders', 'critical', 'orders:view');
  add('held_orders', data.held.filter(h => h.branchId === data.branchId && now.getTime() - Date.parse(h.createdAt) > 86400000).length, 'Held orders over 24 hours', '/pos', 'warning', 'pos:hold');
  add('transfer_incoming', data.transfers.filter(t => ['sent', 'in_transit'].includes(t.status) && t.toBranchId === data.branchId).length, 'Incoming transfers', '/inventory/stock-transfer', 'info', 'inventory:transfer');
  add('coupon_expiring', data.coupons.filter(c => c.status === 'active' && c.endsAt && Date.parse(c.endsAt) >= now.getTime() && Date.parse(c.endsAt) - now.getTime() <= 7 * 86400000).length, 'Coupons expiring soon', '/settings/coupons', 'warning', 'coupons:manage');
  add('payroll_draft', data.draftPayroll, 'Draft payroll', '/staff/payroll', 'info', 'payroll:view');
  add('staff_late', data.lateStaff, 'Staff late today', '/staff/attendance', 'warning', 'staff:view');
  add('not_clocked_in', data.ownShiftStarted && !data.clockedIn ? 1 : 0, 'You have not clocked in', '/staff/attendance', 'warning', 'attendance:view');
  add('document_expiring', data.documents.filter(d => (d.staffId === user.id || can('documents:manage')) && d.expiresAt && d.expiresAt >= day && Date.parse(d.expiresAt) - now.getTime() <= 30 * 86400000).length, 'Documents expiring soon', '/profile/documents', 'warning');
  add('calendar_reminder', data.reminders.filter(e => e.reminderMinutes !== undefined && Date.parse(e.start) >= now.getTime() && Date.parse(e.start) - e.reminderMinutes! * 60000 <= now.getTime()).length, 'Calendar reminders', '/calendar/default', 'info', 'calendar:view');
  add('unread_chat', data.unreadChat, 'Unread demo messages', '/chat/default', 'info', 'chat:use');
  add('unread_email', data.unreadEmail, 'Unread demo email', '/email/mailbox', 'info', 'email:use');
  add('backup_reminder', !data.lastBackupAt || now.getTime() - Date.parse(data.lastBackupAt) > 7 * 86400000 ? 1 : 0, 'Export a data backup', '/settings/general#data', 'warning', 'settings:manage');
  add('storage_warning', data.storageRatio > .8 || data.localBytes > 4 * 1024 * 1024 ? 1 : 0, 'Browser storage is nearly full', '/settings/general#data', 'critical', 'settings:manage');
  return result;
}
