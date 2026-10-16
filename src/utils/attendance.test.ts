import { describe, expect, it } from 'vitest';
import type { AttendanceRecord } from '../types/staff';
import { clockMinutes, lateMinutes, localDate, timeMinutes, validateClock, workedHours } from './attendance';

function record(overrides: Partial<AttendanceRecord> = {}): AttendanceRecord {
  return { id: 'attendance-1', staffId: 'staff-1', date: '2026-10-16',
    clockIn: '2026-10-16T01:00:00.000Z', breakMinutes: 0, status: 'present', source: 'clock', ...overrides };
}

describe('attendance dates and lateness', () => {
  it('uses the Philippine calendar date across the UTC midnight boundary', () => {
    expect(localDate(new Date('2026-10-15T15:59:00Z'))).toBe('2026-10-15');
    expect(localDate(new Date('2026-10-15T16:00:00Z'))).toBe('2026-10-16');
    expect(clockMinutes('2026-10-15T16:00:00Z')).toBe(0);
    expect(clockMinutes('2026-10-16T01:11:00Z')).toBe(551);
    expect(timeMinutes('14:30')).toBe(870);
  });

  it.each([
    ['2026-10-16T00:45:00Z', 0],
    ['2026-10-16T01:00:00Z', 0],
    ['2026-10-16T01:10:00Z', 0],
    ['2026-10-16T01:11:00Z', 11],
    ['2026-10-16T01:30:00Z', 30],
  ])('calculates lateness at %s against the 09:00 fallback', (time, expected) => {
    expect(lateMinutes(time)).toBe(expected);
  });

  it('measures lateness against the scheduled shift and applies the grace period', () => {
    expect(lateMinutes('2026-10-16T06:10:00Z', '14:00')).toBe(0);
    expect(lateMinutes('2026-10-16T06:11:00Z', '14:00')).toBe(11);
    expect(lateMinutes('2026-10-16T00:11:00Z', '08:00')).toBe(11);
  });
});

describe('worked hours', () => {
  it('subtracts breaks and preserves fractional hours', () => {
    expect(workedHours(record({ clockOut: '2026-10-16T10:00:00Z', breakMinutes: 60 }))).toBe(8);
    expect(workedHours(record({ clockOut: '2026-10-16T02:45:00Z', breakMinutes: 15 }))).toBe(1.5);
  });

  it('returns zero for incomplete records', () => {
    expect(workedHours(record())).toBe(0);
    expect(workedHours(record({ clockIn: undefined, clockOut: '2026-10-16T10:00:00Z' }))).toBe(0);
    expect(workedHours(record({ clockIn: undefined }))).toBe(0);
  });

  it('never returns negative hours for reversed times or excessive breaks', () => {
    expect(workedHours(record({ clockOut: '2026-10-16T00:00:00Z' }))).toBe(0);
    expect(workedHours(record({ clockOut: '2026-10-16T02:00:00Z', breakMinutes: 90 }))).toBe(0);
  });
});

describe('clock rules', () => {
  const now = new Date('2026-10-16T02:00:00Z');

  it('allows the first clock in and an existing empty holiday record', () => {
    expect(() => validateClock(undefined, 'in', now)).not.toThrow();
    expect(() => validateClock(record({ clockIn: undefined, status: 'holiday' }), 'in', now)).not.toThrow();
  });

  it('rejects a second clock in, including after clock out', () => {
    expect(() => validateClock(record(), 'in', now)).toThrow('Already clocked in');
    expect(() => validateClock(record({ clockOut: now.toISOString() }), 'in', now)).toThrow('Already clocked in');
  });

  it('requires a clock in before clock out', () => {
    expect(() => validateClock(undefined, 'out', now)).toThrow('earlier clock in');
    expect(() => validateClock(record({ clockIn: undefined }), 'out', now)).toThrow('earlier clock in');
  });

  it('allows a valid clock out and rejects an earlier time', () => {
    expect(() => validateClock(record(), 'out', now)).not.toThrow();
    expect(() => validateClock(record(), 'out', new Date('2026-10-16T00:59:00Z'))).toThrow('earlier clock in');
  });

  it('rejects a second clock out', () => {
    expect(() => validateClock(record({ clockOut: now.toISOString() }), 'out', now)).toThrow();
  });
});
