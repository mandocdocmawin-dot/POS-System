import { z } from 'zod';
import { staffSchema, roleSchema, attendanceSchema, holidaySchema, shiftSchema, payrollRunSchema } from '../types/staff';
import { permissionKeys } from '../config/permissions';
import { branches } from '../store/useBranchStore';
import { localDate } from '../utils/attendance';
import { validateShift } from '../utils/schedule';
import { sumCentavos } from '../utils/pos';
import { payrollNet, validatePeriod } from '../utils/payroll';
export const staffBackupSchema = z.object({
  staff: z.array(staffSchema).min(1), roles: z.array(roleSchema).min(3), records: z.array(attendanceSchema),
  holidays: z.array(holidaySchema), shifts: z.array(shiftSchema), runs: z.array(payrollRunSchema),
  auth: z.object({ currentUserId: z.string().min(1).nullable() }).strict(),
}).strict();
export type StaffBackup = z.infer<typeof staffBackupSchema>;
export function validateStaffBackup(data: StaffBackup, branchIds:readonly string[]=branches) {
  const fail = (message: string): never => { throw new Error(`Invalid staff backup: ${message}`); };
  for (const rows of [data.staff, data.roles, data.records, data.holidays, data.shifts, data.runs]) {
    if (new Set(rows.map(r => r.id)).size !== rows.length) fail('duplicate IDs.');
  }
  const unique = (values: string[], label: string) => { if (new Set(values).size !== values.length) fail(`duplicate ${label}.`); };
  unique(data.staff.map(s => s.email.toLowerCase()), 'staff emails');
  unique(data.staff.map(s => s.staffNo), 'staff numbers');
  unique(data.roles.map(r => r.name.trim().toLowerCase()), 'role names');
  for (const id of ['admin', 'manager', 'cashier']) if (!data.roles.some(r => r.id === id && r.isSystem)) fail('a system role is missing.');
  const admin = data.roles.find(r => r.id === 'admin')!;
  if (admin.name !== 'Admin' || admin.permissions.length !== permissionKeys.length || !permissionKeys.every(p => admin.permissions.includes(p))) fail('Admin permissions are locked.');
  for (const role of data.roles) {
    unique(role.permissions, 'role permissions');
    if (role.permissions.some(p => !permissionKeys.some(k => k === p))) fail('unknown permission.');
    if (role.isSystem && !['admin', 'manager', 'cashier'].includes(role.id)) fail('custom roles cannot be system roles.');
  }
  if (!data.staff.some(s => s.role === 'admin' && s.status === 'active')) fail('last active Admin is missing.');
  for (const staff of data.staff) {
    if (!data.roles.some(r => r.id === staff.role)) fail('staff role is missing.');
    unique(staff.branchIds, 'staff branches');
    if (staff.branchIds.some(b => !branchIds.some(branch => branch === b))) fail('staff branch is missing.');
  }
  if (data.auth.currentUserId && !data.staff.some(s => s.id === data.auth.currentUserId)) fail('session staff is missing.');
  unique(data.records.map(r => `${r.staffId}:${r.date}`), 'staff/date attendance');
  for (const record of data.records) {
    if (!data.staff.some(s => s.id === record.staffId)) fail('attendance staff is missing.');
    if (record.source === 'manual' && !record.note?.trim()) fail('manual attendance needs a note.');
    if (record.clockOut && (!record.clockIn || Date.parse(record.clockOut) < Date.parse(record.clockIn))) fail('clock out is before clock in.');
    if ([record.clockIn, record.clockOut].some(value => value && localDate(new Date(value)) !== record.date)) fail('clock time is outside attendance date.');
  }
  unique(data.holidays.map(h => `${h.date}:${h.name.trim().toLowerCase()}`), 'holiday date/name');
  for (const shift of data.shifts) {
    if (!data.staff.some(s => s.id === shift.staffId) || !branchIds.some(b => b === shift.branchId)) fail('shift staff or branch is missing.');
    validateShift(shift, data.shifts);
  }
  unique(data.runs.map(r => r.runNo), 'payroll run numbers');
  for (const run of data.runs) {
    validatePeriod(run.periodStart, run.periodEnd, data.runs, run.id);
    if (Date.parse(run.periodEnd) - Date.parse(run.periodStart) > 366 * 86400000) fail('payroll period exceeds one year.');
    unique(run.lines.map(l => l.staffId), 'payroll staff lines');
    for (const line of run.lines) {
      if (!data.staff.some(s => s.id === line.staffId)) fail('payroll staff is missing.');
      if (line.payType === 'monthly' && !line.monthlyRate) fail('monthly payroll snapshot rate is missing.');
      if (line.earnings && sumCentavos(line.earnings.map(e => e.amount)) !== line.grossPay) fail('payroll gross earnings do not match the snapshot.');
      if (line.netPay !== payrollNet(line)) fail('payroll net pay does not match earnings and deductions.');
    }
  }
  return data;
}
