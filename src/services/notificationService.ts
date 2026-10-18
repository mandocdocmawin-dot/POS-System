import { useNotificationStore } from '../store/useNotificationStore';
import { useProductStore } from '../store/useProductStore';
import { useStockStore } from '../store/useStockStore';
import { useOrderStore } from '../store/useOrderStore';
import { useHeldOrderStore } from '../store/useHeldOrderStore';
import { useCouponStore } from '../store/useCouponStore';
import { useTransferStore } from '../store/useTransferStore';
import { usePayrollStore } from '../store/usePayrollStore';
import { useAttendanceStore } from '../store/useAttendanceStore';
import { useShiftStore } from '../store/useShiftStore';
import { useDocumentStore } from '../store/useDocumentStore';
import { useMetaStore } from '../store/useMetaStore';
import { permissionKeys } from '../config/permissions';
import { notificationTypes, notificationPrefsSchema, type NotificationPrefs } from '../types/phase8';
import { deriveNotifications } from '../utils/notifications';
import { localDay } from '../utils/calendar';
import { currentUser, canUse, timestamp } from './phase8Context';
import { branchService } from './branchService';
import { chatService } from './chatService';
import { emailService } from './emailService';
import { calendarService } from './calendarService';
let usage = { ratio: 0, localBytes: 0 };
export const notificationService = {
  prefs: (): NotificationPrefs => { const u = currentUser(); return structuredClone(useNotificationStore.getState().prefs.find(p => p.userId === u.id) ?? { userId: u.id, types: Object.fromEntries(notificationTypes.map(type => [type, true])) as NotificationPrefs['types'], autoReply: true }); },
  savePrefs: (input: NotificationPrefs) => { const u = currentUser(); const prefs = notificationPrefsSchema.parse({ ...input, userId: u.id }); useNotificationStore.setState(s => ({ prefs: [...s.prefs.filter(p => p.userId !== u.id), prefs] })); },
  setUsage: (ratio: number, localBytes: number) => { usage = { ratio, localBytes }; },
  list: (now = new Date()) => {
    const u = currentUser(), branchId = branchService.activeId(), day = localDay(now), permissions = permissionKeys.filter(canUse);
    const movements = useStockStore.getState().movements.filter(m => m.branchId === branchId);
    const balances = new Map<string, number>(); movements.forEach(m => balances.set(m.productId, (balances.get(m.productId) ?? 0) + (m.type === 'out' ? -m.quantity : m.quantity)));
    const shift = useShiftStore.getState().shifts.find(s => s.staffId === u.id && s.date === day);
    const derived = deriveNotifications({ branchId, stock: useProductStore.getState().products.filter(p => p.status === 'active').map(p => ({ quantity: balances.get(p.id) ?? 0, reorder: p.reorderLevel })), orders: useOrderStore.getState().orders.filter(o => o.orderStatus !== 'cancelled'), held: useHeldOrderStore.getState().heldOrders.map(h => ({ ...h, branchId: h.branchId ?? branchId })), transfers: useTransferStore.getState().transfers, coupons: useCouponStore.getState().coupons.filter(c => !c.branchIds?.length || c.branchIds.includes(branchId)), draftPayroll: usePayrollStore.getState().runs.filter(r => r.status === 'draft').length, lateStaff: useAttendanceStore.getState().records.filter(a => a.date === day && a.status === 'late' && (!a.branchId || a.branchId === branchId)).length, ownShiftStarted: !!shift && `${shift.date}T${shift.startTime}` < `${day}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`, clockedIn: useAttendanceStore.getState().records.some(a => a.staffId === u.id && a.date === day && a.clockIn), documents: useDocumentStore.getState().documents, reminders: canUse('calendar:view') ? calendarService.events({ start: now.toISOString(), end: new Date(now.getTime() + 86400000).toISOString() }).filter(e => e.createdBy === u.id || e.attendeeStaffIds.includes(u.id)) : [], unreadChat: canUse('chat:use') ? chatService.unread() : 0, unreadEmail: canUse('email:use') ? emailService.list().filter(e => e.folder === 'inbox' && !e.read).length : 0, lastBackupAt: useMetaStore.getState().lastBackupAt, storageRatio: usage.ratio, localBytes: usage.localBytes }, { id: u.id, permissions }, notificationService.prefs(), now);
    return derived.flatMap(n => { const state = useNotificationStore.getState().notificationStates.find(s => s.userId === u.id && s.key === n.key); return state?.dismissedAt ? [] : [{ ...n, readAt: state?.readAt }]; });
  },
  mark: (key: string, dismiss = false) => { const u = currentUser(); useNotificationStore.setState(s => { const old = s.notificationStates.find(n => n.userId === u.id && n.key === key); return { notificationStates: [...s.notificationStates.filter(n => n.userId !== u.id || n.key !== key), { ...old, userId: u.id, key, readAt: timestamp(), dismissedAt: dismiss ? timestamp() : old?.dismissedAt }] }; }); },
  markAll: () => { notificationService.list().forEach(n => notificationService.mark(n.key)); },
};
