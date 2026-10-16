import type { AttendanceRecord, Holiday, PayrollLine, PayrollRun, Shift, Staff } from '../types/staff';
import { payrollConfig as config } from '../config/payroll';
import { lateMinutes, workedHours } from './attendance';
import { addDays } from './schedule';
import { ratioCentavos, sumCentavos } from './pos';
export function validatePeriod(start: string, end: string, runs: PayrollRun[], excludeId?: string) {
  if (end < start) throw new Error('Period end must follow start.');
  if (runs.some(run => run.id !== excludeId && start <= run.periodEnd && end >= run.periodStart)) throw new Error('Payroll periods cannot overlap.');
}
function earningsForTime(rate: number, milliseconds: number, multiplier = 1) {
  return ratioCentavos(rate, milliseconds * Math.round(multiplier * 10000), 3600000 * 10000);
}
export function computePayrollLine(staff: Staff, records: AttendanceRecord[], holidays: Holiday[], start: string, end: string, shifts: Shift[] = []): PayrollLine {
  validatePeriod(start, end, []);
  let regularHours = 0, overtimeHours = 0, holidayHours = 0, late = 0, absences = 0;
  const regularPay: number[] = [], overtimePay: number[] = [], holidayPay: number[] = [], unworkedHolidayPay: number[] = [];
  const rate = staff.hourlyRate, monthly = staff.payType === 'monthly';
  for (let date = start; date <= end; date = addDays(date, 1)) {
    const record = records.find(r => r.staffId === staff.id && r.date === date), holiday = holidays.find(h => h.date === date);
    const hours = record ? workedHours(record) : 0;
    // Integer milliseconds avoid half-cent errors from repeating fractional hours.
    const workedMs = Math.round(hours * 3600000), regularMs = Math.min(config.dailyHours * 3600000, workedMs), overtimeMs = Math.max(0, workedMs - regularMs);
    if (holiday && workedMs > 0) {
      holidayHours += hours;
      const multiplier = holiday.type === 'regular' ? config.regularHolidayMultiplier : holiday.type === 'special' ? config.specialHolidayMultiplier : 1;
      holidayPay.push(earningsForTime(rate, regularMs, monthly ? multiplier - 1 : multiplier));
      holidayPay.push(earningsForTime(rate, overtimeMs, multiplier * config.overtimeMultiplier));
    } else {
      regularHours += regularMs / 3600000;
      overtimeHours += overtimeMs / 3600000;
      if (!monthly) regularPay.push(earningsForTime(rate, regularMs));
      overtimePay.push(earningsForTime(rate, overtimeMs, config.overtimeMultiplier));
    }
    if (!monthly && holiday?.paid && !hours) unworkedHolidayPay.push(ratioCentavos(rate, config.dailyHours, 1));
    if (monthly && record && ['absent', 'leave'].includes(record.status) && !holiday?.paid) absences++;
    if (record?.clockIn) {
      const shift = shifts.filter(s => s.staffId === staff.id && s.date === date).toSorted((a, b) => a.startTime.localeCompare(b.startTime))[0];
      late += lateMinutes(record.clockIn, shift?.startTime);
    }
  }
  const earnings: PayrollLine['additions'] = [
    ...(monthly ? [{ label: 'Semi-monthly base after unpaid absences', amount: ratioCentavos(staff.monthlyRate ?? 0, Math.max(0, 13 - absences), 26) }] : [{ label: 'Regular earnings', amount: sumCentavos(regularPay) }]),
    { label: 'Overtime earnings (1.25x)', amount: sumCentavos(overtimePay) },
    { label: monthly ? 'Holiday premiums and holiday overtime' : 'Holiday worked earnings', amount: sumCentavos(holidayPay) },
    ...(!monthly ? [{ label: 'Paid holidays not worked', amount: sumCentavos(unworkedHolidayPay) }] : []),
  ];
  const grossPay = sumCentavos(earnings.map(e => e.amount));
  const deduction = ratioCentavos(rate, late, 60);
  const deductions = deduction ? [{ label: 'Late minutes', amount: deduction }] : [];
  return { staffId: staff.id, regularHours, overtimeHours, holidayHours, lateMinutes: late, grossPay, earnings, deductions, additions: [], netPay: Math.max(0, grossPay - deduction), hourlyRate: rate, monthlyRate: staff.monthlyRate, payType: staff.payType };
}
export function payrollNet(line: PayrollLine) {
  return Math.max(0, sumCentavos([line.grossPay, ...line.additions.map(a => a.amount)]) - sumCentavos(line.deductions.map(a => a.amount)));
}
