import { z } from 'zod';
import { payrollRunSchema, type PayrollLine, type PayrollRun } from '../types/staff';
import { usePayrollStore } from '../store/usePayrollStore';
import { useStaffStore } from '../store/useStaffStore';
import { useAttendanceStore } from '../store/useAttendanceStore';
import { useHolidayStore } from '../store/useHolidayStore';
import { useShiftStore } from '../store/useShiftStore';
import { computePayrollLine, payrollNet, validatePeriod } from '../utils/payroll';
import { requirePermission, authService } from './authService';
import { activityService } from './activityService';
import { localTransaction } from './localTransaction';

function preview(start: string, end: string): PayrollRun {
  requirePermission('payroll:view');
  z.iso.date().parse(start);
  z.iso.date().parse(end);
  validatePeriod(start, end, usePayrollStore.getState().runs);
  if (Date.parse(end) - Date.parse(start) > 366 * 86400000) throw new Error('Choose a period of at most one year.');
  const runs = usePayrollStore.getState().runs;
  return payrollRunSchema.parse({
    id: crypto.randomUUID(), runNo: `PR-${start.slice(0, 7)}-${String(runs.length + 1).padStart(3, '0')}`,
    periodStart: start, periodEnd: end, status: 'draft', createdAt: new Date().toISOString(),
    lines: useStaffStore.getState().staff.filter(s => s.status === 'active').map(s => computePayrollLine(
      s, useAttendanceStore.getState().records, useHolidayStore.getState().holidays, start, end, useShiftStore.getState().shifts,
    )),
  });
}

export const payrollService = {
  preview,
  saveDraft: (input: PayrollRun) => {
    requirePermission('payroll:view');
    const run = payrollRunSchema.parse(input), runs = usePayrollStore.getState().runs;
    if (run.status !== 'draft') throw new Error('New payroll runs must be drafts.');
    if (runs.some(r => r.id === run.id || r.runNo === run.runNo)) throw new Error('Payroll already saved. Reopen the existing run.');
    const expected = preview(run.periodStart, run.periodEnd);
    const keys = ['regularHours', 'overtimeHours', 'holidayHours', 'lateMinutes', 'grossPay', 'hourlyRate', 'monthlyRate', 'payType'] as const;
    if (run.lines.length !== expected.lines.length || new Set(run.lines.map(l => l.staffId)).size !== run.lines.length || run.lines.some(line => {
      const original = expected.lines.find(l => l.staffId === line.staffId);
      return !original || keys.some(key => line[key] !== original[key]) || line.netPay !== payrollNet(line);
    })) throw new Error('Attendance or staff rates changed. Compute the preview again before saving.');
    return localTransaction(() => {
      usePayrollStore.setState({ runs: [...runs, run] });
      activityService.log('payroll', run.id, 'create', run.runNo, authService.getCurrentUser()!.name);
      return run;
    });
  },
  create: (start: string, end: string) => payrollService.saveDraft(preview(start, end)),
  adjust: (id: string, staffId: string, additions: PayrollLine['additions'], deductions: PayrollLine['deductions']) => {
    requirePermission('payroll:view');
    const run = usePayrollStore.getState().runs.find(r => r.id === id);
    if (!run || run.status !== 'draft') throw new Error('Finalized payroll runs are locked.');
    const next = payrollService.adjustPreview(run, staffId, additions, deductions);
    return localTransaction(() => {
      usePayrollStore.setState(s => ({ runs: s.runs.map(r => r.id === id ? next : r) }));
      activityService.log('payroll', id, 'adjust', 'Updated payroll adjustments', authService.getCurrentUser()!.name);
    });
  },
  adjustPreview: (run: PayrollRun, staffId: string, additions: PayrollLine['additions'], deductions: PayrollLine['deductions']) => {
    requirePermission('payroll:view');
    if (run.status !== 'draft') throw new Error('Finalized payroll runs are locked.');
    const original = run.lines.find(l => l.staffId === staffId);
    if (!original) throw new Error('Payroll line not found.');
    const late = original.deductions.find(d => d.label === 'Late minutes');
    if (late && !deductions.some(d => d.label === late.label && d.amount === late.amount)) throw new Error('The computed late deduction is locked. Add a manual adjustment instead.');
    return payrollRunSchema.parse({ ...run, lines: run.lines.map(line => {
      if (line.staffId !== staffId) return line;
      const updated = { ...line, additions, deductions };
      return { ...updated, netPay: payrollNet(updated) };
    }) });
  },
  transition: (id: string, status: 'finalized' | 'paid') => {
    requirePermission('payroll:view');
    const runs = usePayrollStore.getState().runs, run = runs.find(r => r.id === id);
    if (!run || (status === 'finalized' ? run.status !== 'draft' : run.status !== 'finalized')) throw new Error('Invalid payroll status transition.');
    validatePeriod(run.periodStart, run.periodEnd, runs, id);
    const next = payrollRunSchema.parse({ ...run, status, ...(status==='paid'?{paidAt:new Date().toISOString(),paymentAccountId:'account-bank',lines:run.lines.map(line=>({...line,branchId:useStaffStore.getState().staff.find(s=>s.id===line.staffId)?.branchIds[0]??'Main Branch'}))}:{}) });
    return localTransaction(() => {
      usePayrollStore.setState({ runs: runs.map(r => r.id === id ? next : r) });
      activityService.log('payroll', id, status, `${run.runNo} ${status}; demo only`, authService.getCurrentUser()!.name);
      return next;
    });
  },
};

