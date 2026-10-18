import { useStaffStore } from '../store/useStaffStore';
import { useOrderStore } from '../store/useOrderStore';
import { useAttendanceStore } from '../store/useAttendanceStore';
import { usePayrollStore } from '../store/usePayrollStore';
import { useActivityStore } from '../store/useActivityStore';
import { staffSchema } from '../types/staff';
import { currentUser, requireOwn, canUse } from './phase8Context';
import { activityService } from './activityService';
import { localDay } from '../utils/calendar';
import { toCentavos } from '../utils/pos';
export const profileService = {
  get: (id = currentUser().id) => { requireOwn(id, 'staff:view'); const user = useStaffStore.getState().staff.find(s => s.id === id); if (!user) throw new Error('Staff profile not found.'); return structuredClone(user); },
  saveOwn: (input: { name: string; email: string; phone?: string; avatarId?: string }) => {
    const user = currentUser(), next = staffSchema.parse({ ...user, ...input });
    if (useStaffStore.getState().staff.some(s => s.id !== user.id && s.email.toLowerCase() === next.email.toLowerCase())) throw new Error('Email must be unique.');
    useStaffStore.setState(s => ({ staff: s.staff.map(p => p.id === user.id ? next : p) })); activityService.log('staff', user.id, 'edit', 'Updated own account profile'); return next;
  },
  setPin: (pin: string) => { const user = currentUser('approvals:grant'); const next = staffSchema.parse({ ...user, approvalPin: pin }); useStaffStore.setState(s => ({ staff: s.staff.map(p => p.id === user.id ? next : p) })); activityService.log('auth', user.id, 'pin', 'Changed demo approval PIN'); },
  logs: (id = currentUser().id) => { const user = profileService.get(id); return structuredClone(useActivityStore.getState().logs.filter(log => log.actorId === id || (!log.actorId && log.actor === user.name)).sort((a, b) => b.createdAt.localeCompare(a.createdAt))); },
  statement: (id = currentUser().id, month = localDay(new Date()).slice(0, 7)) => {
    const user = profileService.get(id);
    const attendance = useAttendanceStore.getState().records.filter(a => a.staffId === id && a.date.startsWith(month));
    const orders = useOrderStore.getState().orders.filter(o => (o.cashierId === id || (!o.cashierId && o.cashier === user.name)) && o.createdAt.slice(0, 7) === month && o.orderStatus !== 'cancelled');
    const hours = attendance.reduce((sum, a) => sum + (a.clockIn && a.clockOut ? Math.max(0, (Date.parse(a.clockOut) - Date.parse(a.clockIn)) / 3600000 - a.breakMinutes / 60) : 0), 0);
    const present = attendance.filter(a => ['present', 'late'].includes(a.status)).length;
    const payslips = usePayrollStore.getState().runs.filter(r => r.status !== 'draft' && r.periodEnd.startsWith(month)).flatMap(r => r.lines.filter(l => l.staffId === id).map(l => ({ runNo: r.runNo, ...l })));
    return structuredClone({ attendance, orders, hours, attendanceRate: attendance.length ? present / attendance.length * 100 : 0, sales: orders.reduce((sum, o) => sum + toCentavos(Math.max(0, o.amountPaid - o.refundedTotal)), 0), payslips: id === currentUser().id || canUse('payroll:view') ? payslips : [] });
  },
};
