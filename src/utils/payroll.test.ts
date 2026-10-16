import { describe, expect, it } from 'vitest';
import type { AttendanceRecord, Holiday, PayrollRun, Shift, Staff } from '../types/staff';
import { computePayrollLine, payrollNet, validatePeriod } from './payroll';

const date = '2026-10-16';
const staff: Staff = { id: 'staff-1', staffNo: 'EMP-001', name: 'Test Cashier',
  email: 'cashier@example.com', role: 'cashier', branchIds: ['Main Branch'], hireDate: '2026-01-01',
  status: 'active', hourlyRate: 10000, payType: 'hourly', createdAt: '2026-01-01T00:00:00.000Z' };

function attendance(overrides: Partial<AttendanceRecord> = {}): AttendanceRecord {
  return { id: 'attendance-1', staffId: staff.id, date, clockIn: date + 'T01:00:00.000Z',
    clockOut: date + 'T09:00:00.000Z', breakMinutes: 0, status: 'present', source: 'clock', ...overrides };
}
function holiday(overrides: Partial<Holiday> = {}): Holiday {
  return { id: 'holiday-1', name: 'Demo holiday', date, type: 'regular', paid: true, ...overrides };
}
function run(overrides: Partial<PayrollRun> = {}): PayrollRun {
  return { id: 'run-1', runNo: 'PR-2026-10-A', periodStart: '2026-10-01', periodEnd: '2026-10-15',
    status: 'draft', lines: [], createdAt: date + 'T00:00:00.000Z', ...overrides };
}

describe('hourly payroll computation in centavos', () => {
  it('pays up to eight regular hours a day', () => {
    const line = computePayrollLine(staff, [attendance()], [], date, date);
    expect(line).toMatchObject({ regularHours: 8, overtimeHours: 0, holidayHours: 0,
      lateMinutes: 0, grossPay: 80000, deductions: [], additions: [], netPay: 80000,
      hourlyRate: 10000, payType: 'hourly' });
  });

  it('pays overtime beyond eight hours at 1.25x after deducting breaks', () => {
    const line = computePayrollLine(staff, [attendance({ clockOut: date + 'T12:00:00.000Z', breakMinutes: 60 })], [], date, date);
    expect(line.regularHours).toBe(8);
    expect(line.overtimeHours).toBe(2);
    expect(line.grossPay).toBe(105000);
  });

  it('caps regular hours independently for each day', () => {
    const records = [attendance({ clockOut: date + 'T11:00:00.000Z' }), attendance({ id: 'next', date: '2026-10-17',
      clockIn: '2026-10-17T01:00:00.000Z', clockOut: '2026-10-17T07:00:00.000Z' })];
    const line = computePayrollLine(staff, records, [], date, '2026-10-17');
    expect(line.regularHours).toBe(14);
    expect(line.overtimeHours).toBe(2);
    expect(line.grossPay).toBe(165000);
  });

  it.each([
    ['regular', 160000], ['special', 104000], ['store', 80000],
  ] as const)('pays %s holiday work at the configured multiplier', (type, expected) => {
    const line = computePayrollLine(staff, [attendance()], [holiday({ type })], date, date);
    expect(line.holidayHours).toBe(8);
    expect(line.regularHours).toBe(0);
    expect(line.grossPay).toBe(expected);
  });

  it('combines holiday and overtime premiums', () => {
    const line = computePayrollLine(staff, [attendance({ clockOut: date + 'T11:00:00.000Z' })], [holiday()], date, date);
    expect(line.holidayHours).toBe(10);
    expect(line.grossPay).toBe(210000);
  });

  it('pays a paid holiday not worked with or without an explicit holiday record', () => {
    expect(computePayrollLine(staff, [], [holiday()], date, date).grossPay).toBe(80000);
    const off = attendance({ clockIn: undefined, clockOut: undefined, status: 'holiday' });
    expect(computePayrollLine(staff, [off], [holiday()], date, date).grossPay).toBe(80000);
    expect(computePayrollLine(staff, [off], [holiday({ paid: false })], date, date).grossPay).toBe(0);
  });

  it.each(['absent', 'leave', 'day_off'] as const)('does not pay unworked %s records on ordinary days', status => {
    const line = computePayrollLine(staff, [attendance({ clockIn: undefined, clockOut: undefined, status })], [], date, date);
    expect(line.grossPay).toBe(0);
    expect(line.netPay).toBe(0);
  });

  it('deducts late minutes proportionally and rounds to the nearest centavo', () => {
    const line = computePayrollLine(staff, [attendance({ clockIn: date + 'T01:11:00.000Z', clockOut: date + 'T09:11:00.000Z' })], [], date, date);
    expect(line.lateMinutes).toBe(11);
    expect(line.deductions).toEqual([{ label: 'Late minutes', amount: 1833 }]);
    expect(line.netPay).toBe(78167);
  });

  it('uses that staff member’s scheduled shift instead of the default start time', () => {
    const shift: Shift = { id: 'shift-1', staffId: staff.id, date, startTime: '14:00', endTime: '22:00', branchId: 'Main Branch' };
    const record = attendance({ clockIn: date + 'T06:00:00.000Z', clockOut: date + 'T14:00:00.000Z' });
    expect(computePayrollLine(staff, [record], [], date, date, [shift]).lateMinutes).toBe(0);
    expect(computePayrollLine(staff, [record], [], date, date, [{ ...shift, staffId: 'someone-else' }]).lateMinutes).toBe(300);
  });

  it('pays only records and holidays within the inclusive period and for the selected staff', () => {
    const records = [attendance(), attendance({ id: 'other', staffId: 'other' }), attendance({ id: 'outside', date: '2026-10-17' })];
    expect(computePayrollLine(staff, records, [holiday({ date: '2026-10-17' })], date, date).grossPay).toBe(80000);
  });

  it('keeps fractional-hour gross pay and late deductions as integer centavos', () => {
    const line = computePayrollLine({ ...staff, hourlyRate: 12345 }, [attendance({
      clockIn: date + 'T01:11:00.000Z', clockOut: date + 'T02:12:00.000Z',
    })], [], date, date);
    expect(line.grossPay).toBe(12551); // 12,345 × 61/60, rounded once.
    expect(line.deductions).toEqual([{ label: 'Late minutes', amount: 2263 }]);
    expect(line.netPay).toBe(10288);
    for (const value of [line.grossPay, line.netPay, ...line.deductions.map(d => d.amount)]) {
      expect(Number.isSafeInteger(value)).toBe(true);
    }
  });

  it('does not mutate attendance, holiday, staff or shift inputs', () => {
    const records = [attendance()], holidays = [holiday()], person = { ...staff }, shifts: Shift[] = [];
    const before = structuredClone({ person, records, holidays, shifts });
    computePayrollLine(person, records, holidays, date, date, shifts);
    expect({ person, records, holidays, shifts }).toEqual(before);
  });

  it('clamps net pay at zero when deductions exceed earnings', () => {
    const line = computePayrollLine(staff, [attendance({ clockIn: date + 'T08:00:00.000Z' })], [], date, date);
    expect(line.grossPay).toBe(10000);
    expect(line.netPay).toBe(0);
  });
});

describe('monthly payroll and manual adjustments', () => {
  const monthly: Staff = { ...staff, payType: 'monthly', monthlyRate: 2600000 };

  it('snapshots rates and pays monthlyRate / 2 for a semi-monthly period', () => {
    const line = computePayrollLine(monthly, [], [], '2026-10-01', '2026-10-15');
    expect(line).toMatchObject({ grossPay: 1300000, netPay: 1300000, monthlyRate: 2600000,
      hourlyRate: 10000, payType: 'monthly' });
    expect(computePayrollLine(monthly, [attendance()], [], date, '2026-10-31').grossPay).toBe(1300000);
    monthly.monthlyRate = 2800000;
    expect(line.monthlyRate).toBe(2600000);
    monthly.monthlyRate = 2600000;
  });

  it('includes paid unworked holidays in the monthly base without paying twice', () => {
    expect(computePayrollLine(monthly, [], [holiday()], date, '2026-10-31').grossPay).toBe(1300000);
  });

  it('adds overtime and holiday premiums to the monthly base', () => {
    const overtime = attendance({ clockOut: date + 'T11:00:00.000Z' });
    expect(computePayrollLine(monthly, [overtime], [], date, '2026-10-31').grossPay).toBe(1325000);
    expect(computePayrollLine(monthly, [attendance()], [holiday()], date, '2026-10-31').grossPay).toBe(1380000);
    expect(computePayrollLine(monthly, [attendance()], [holiday({ type: 'special' })], date, '2026-10-31').grossPay).toBe(1324000);
  });

  it.each(['absent', 'leave'] as const)('removes daily pay for unpaid %s', status => {
    const off = attendance({ clockIn: undefined, clockOut: undefined, status });
    expect(computePayrollLine(monthly, [off], [], date, '2026-10-31').grossPay).toBe(1200000);
  });

  it('recomputes net pay using manual additions and deductions without mutating the line', () => {
    const line = computePayrollLine(staff, [attendance()], [], date, date);
    line.additions = [{ label: 'Bonus', amount: 5000 }];
    line.deductions = [{ label: 'Advance', amount: 2000 }, { label: 'Other', amount: 1000 }];
    expect(payrollNet(line)).toBe(82000);
    expect(line.netPay).toBe(80000);
    line.deductions = [{ label: 'Advance', amount: 100000 }];
    expect(payrollNet(line)).toBe(0);
  });
});

describe('payroll period validation', () => {
  it('allows a new period, a one-day period and directly adjacent periods', () => {
    expect(() => validatePeriod('2026-10-01', '2026-10-15', [])).not.toThrow();
    expect(() => validatePeriod('2026-10-16', '2026-10-16', [run()])).not.toThrow();
    expect(() => validatePeriod('2026-09-16', '2026-09-30', [run()])).not.toThrow();
    expect(() => validatePeriod('2026-10-16', '2026-10-31', [run()])).not.toThrow();
  });

  it.each([
    ['2026-10-01', '2026-10-15'], ['2026-09-20', '2026-10-01'],
    ['2026-10-15', '2026-10-31'], ['2026-10-05', '2026-10-10'], ['2026-09-01', '2026-11-01'],
  ])('rejects inclusive overlap for %s through %s', (start, end) => {
    for (const status of ['draft', 'finalized', 'paid'] as const) {
      expect(() => validatePeriod(start, end, [run({ status })])).toThrow('overlap');
    }
  });

  it('rejects an end date before the start date', () => {
    expect(() => validatePeriod('2026-10-16', '2026-10-15', [])).toThrow('Period end');
  });

  it('excludes only the run being edited and still checks other periods', () => {
    expect(() => validatePeriod('2026-10-01', '2026-10-15', [run()], 'run-1')).not.toThrow();
    expect(() => validatePeriod('2026-10-01', '2026-10-16', [run(), run({ id: 'run-2',
      periodStart: '2026-10-16', periodEnd: '2026-10-31' })], 'run-1')).toThrow('overlap');
  });
});

describe('exact payroll rounding and earning snapshots', () => {
 it('rounds an exact half cent up without floating point drift', () => {
  const line=computePayrollLine({...staff,hourlyRate:10050},[attendance({clockOut:date+'T02:01:00.000Z'})],[],date,date);
  expect(line.grossPay).toBe(10218);
  expect(line.earnings?.reduce((n,e)=>n+e.amount,0)).toBe(line.grossPay);
 });
 it('pays a configured paid holiday when it was not worked, including an absent entry', () => {
  const line=computePayrollLine(staff,[attendance({clockIn:undefined,clockOut:undefined,status:'absent'})],[holiday()],date,date);
  expect(line.grossPay).toBe(80000);expect(line.earnings?.find(e=>e.label==='Paid holidays not worked')?.amount).toBe(80000);
 });
 it('rejects amounts beyond the supported centavo range',()=>{
  expect(()=>computePayrollLine({...staff,hourlyRate:Number.MAX_SAFE_INTEGER},[attendance()],[],date,date)).toThrow('supported');
 });
});
