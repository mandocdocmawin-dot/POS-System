import { describe, expect, it } from 'vitest';
import type { Shift } from '../types/staff';
import { addDays, validateShift, weekStart } from './schedule';

function shift(overrides: Partial<Shift> = {}): Shift {
  return { id: 'shift-1', staffId: 'staff-1', date: '2026-10-16',
    startTime: '08:00', endTime: '16:00', branchId: 'Main Branch', ...overrides };
}

describe('shift validation', () => {
  it('allows same-day shifts and editing the same shift', () => {
    expect(() => validateShift(shift(), [])).not.toThrow();
    expect(() => validateShift(shift({ endTime: '17:00' }), [shift()])).not.toThrow();
  });

  it.each([
    ['08:00', '08:00'], ['16:00', '08:00'], ['16:00', '00:00'],
  ])('rejects zero-length, reversed or overnight shifts: %s–%s', (startTime, endTime) => {
    expect(() => validateShift(shift({ startTime, endTime }), [])).toThrow('End time must be after start time');
  });

  it.each([
    ['07:00', '09:00'], ['15:00', '17:00'], ['09:00', '15:00'], ['07:00', '17:00'], ['08:00', '16:00'],
  ])('rejects overlapping shift %s–%s for the same person and date', (startTime, endTime) => {
    expect(() => validateShift(shift({ id: 'shift-2', startTime, endTime }), [shift()])).toThrow('overlap');
  });

  it('allows adjacent shifts with no overlap', () => {
    expect(() => validateShift(shift({ id: 'before', startTime: '06:00', endTime: '08:00' }), [shift()])).not.toThrow();
    expect(() => validateShift(shift({ id: 'after', startTime: '16:00', endTime: '22:00' }), [shift()])).not.toThrow();
  });

  it('allows the same hours for another person or date', () => {
    expect(() => validateShift(shift({ id: 'other', staffId: 'staff-2' }), [shift()])).not.toThrow();
    expect(() => validateShift(shift({ id: 'tomorrow', date: '2026-10-17' }), [shift()])).not.toThrow();
  });

  it('blocks overlapping shifts even at different branches', () => {
    expect(() => validateShift(shift({ id: 'other-branch', branchId: 'Branch 2' }), [shift()])).toThrow('overlap');
  });
});

describe('schedule calendar navigation', () => {
  it('adds and subtracts days across month/year boundaries and leap days', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
    expect(addDays('2026-10-16', -7)).toBe('2026-10-09');
  });

  it.each(['2026-10-12', '2026-10-13', '2026-10-14', '2026-10-15', '2026-10-16', '2026-10-17', '2026-10-18'])(
    'finds Monday for %s', date => expect(weekStart(date)).toBe('2026-10-12'),
  );
});
