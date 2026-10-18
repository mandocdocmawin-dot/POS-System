import { describe, expect, it } from 'vitest';
import { expandEvents, isoWeek, localDay, startOfWeek, deriveCalendarItems } from './calendar';
import { deriveNotifications, type NotificationData } from './notifications';
import { rankSearch, searchRank } from './search';
import { renderTemplate } from './template';
import { buildMailto } from './mailto';
import { evaluateGuide } from './guide';
import { notificationTypes, type CalendarEvent, type NotificationPrefs } from '../types/phase8';
const event: CalendarEvent = { id: 'one', title: 'Daily', type: 'meeting', start: '2026-01-01T09:00:00', end: '2026-01-01T10:00:00', allDay: false, attendeeStaffIds: [], createdBy: 'admin', createdAt: '2026-01-01T09:00:00', updatedAt: '2026-01-01T09:00:00' };
describe('calendar expansion', () => {
  it.each([['daily', 10], ['weekly', 2], ['monthly', 1]] as const)('expands %s', (freq, count) => {
    const expanded = expandEvents([{ ...event, recurrence: { freq, interval: 1 } }], { start: '2026-01-01T00:00:00', end: '2026-01-10T23:59:00' });
    expect(expanded).toHaveLength(count);
    expect(new Set(expanded.map(e => e.id)).size).toBe(count);
  });
  it('respects interval, until, range, series ids and the occurrence cap', () => {
    expect(expandEvents([{ ...event, recurrence: { freq: 'daily', interval: 2, until: '2026-01-05' } }], { start: '2026-01-01', end: '2026-12-31' })).toHaveLength(3);
    const expanded = expandEvents([{ ...event, recurrence: { freq: 'daily', interval: 1 } }], { start: '2026-01-01', end: '2030-01-01' });
    expect(expanded).toHaveLength(366);
    expect(expanded.every(e => e.seriesId === 'one')).toBe(true);
    expect(expandEvents([event], { start: '2026-02-01', end: '2026-02-28' })).toEqual([]);
  });
  it('does not drift monthly recurrences on month boundaries', () => {
    const rows = expandEvents([{ ...event, start: '2026-01-31T09:00:00', end: '2026-01-31T10:00:00', recurrence: { freq: 'monthly', interval: 1 } }], { start: '2026-01-01', end: '2026-04-01' });
    expect(rows.map(row => localDay(new Date(row.start)))).toEqual(['2026-01-31', '2026-03-31']);
  });
  it('handles all-day dates, week starts and ISO year boundaries', () => {
    expect(localDay(startOfWeek(new Date(2026, 9, 18), 'monday'))).toBe('2026-10-12');
    expect(localDay(startOfWeek(new Date(2026, 9, 18), 'sunday'))).toBe('2026-10-18');
    expect(isoWeek(new Date(2027, 0, 1))).toBe(53);
    expect(expandEvents([{ ...event, allDay: true, start: '2026-01-01T00:00:00', end: '2026-01-01T23:59:59' }], { start: '2026-01-01', end: '2026-01-02' })[0].allDay).toBe(true);
  });
  it('derives source links without mutating fixtures', () => {
    const sources = { holidays: [{ id: 'h', name: 'Holiday', date: '2026-01-01', type: 'regular' as const, paid: true }], shifts: [], payroll: [], attendance: [], orders: [{ id: 'o', orderNo: 'TP-1', balanceDue: 100, dueDate: '2026-01-02' }], coupons: [], transfers: [] };
    const before = structuredClone(sources), rows = deriveCalendarItems(sources);
    expect(rows.map(row => row.layer)).toEqual(['holidays', 'due_dates']);
    expect(rows[1].link).toBe('/orders/o'); expect(sources).toEqual(before);
  });
});
const prefs: NotificationPrefs = { userId: 'u', types: Object.fromEntries(notificationTypes.map(type => [type, true])) as NotificationPrefs['types'], autoReply: true };
const data: NotificationData = { branchId: 'main', stock: [{ quantity: 1, reorder: 2 }, { quantity: 0, reorder: 1 }], orders: [{ branchId: 'main', balanceDue: 100, dueDate: '2026-10-18' }, { branchId: 'main', balanceDue: 100, dueDate: '2026-10-17' }], held: [{ branchId: 'main', createdAt: '2026-10-15T00:00:00Z' }], transfers: [{ toBranchId: 'main', status: 'sent' }], coupons: [{ endsAt: '2026-10-20T12:00:00Z', status: 'active' }], draftPayroll: 1, lateStaff: 1, ownShiftStarted: true, clockedIn: false, documents: [{ staffId: 'u', expiresAt: '2026-10-30' }], reminders: [{ start: '2026-10-18T12:05:00Z', reminderMinutes: 10 }], unreadChat: 1, unreadEmail: 1, storageRatio: .9, localBytes: 0 };
const permissions = ['products:view', 'orders:view', 'pos:hold', 'inventory:transfer', 'coupons:manage', 'payroll:view', 'staff:view', 'attendance:view', 'calendar:view', 'chat:use', 'email:use', 'settings:manage'];
describe('derived notifications', () => {
  const now = new Date('2026-10-18T12:00:00Z');
  it.each(notificationTypes)('derives %s with a deterministic key', type => {
    const a = deriveNotifications(data, { id: 'u', permissions }, prefs, now), b = deriveNotifications(data, { id: 'u', permissions }, prefs, now);
    expect(a.some(n => n.type === type)).toBe(true); expect(a.map(n => n.key)).toEqual(b.map(n => n.key));
  });
  it('filters by permission, branch and preference', () => {
    expect(deriveNotifications(data, { id: 'other', permissions: [] }, prefs, now)).toEqual([]);
    const disabled = { ...prefs, types: { ...prefs.types, low_stock: false } };
    expect(deriveNotifications({ ...data, branchId: 'other' }, { id: 'u', permissions }, disabled, now).some(n => ['low_stock', 'due_balance', 'overdue_balance', 'held_orders', 'transfer_incoming'].includes(n.type))).toBe(false);
  });
});
describe('search, templates and guide', () => {
  it('ranks exact, prefix, word prefix and substring while normalizing accents', () => {
    expect(['CAFÉ', 'café latte', 'iced café', 'decafé'].map(value => searchRank(value, 'cafe'))).toEqual([4, 3, 2, 1]);
    const rows = Array.from({ length: 10 }, (_, i) => ({ id: String(i), label: 'Cafe ' + i, link: '/', group: 'Products', terms: ['Cafe ' + i] }));
    expect(rankSearch(rows, 'cafe')).toHaveLength(5);
    expect(rankSearch(rows, '')).toEqual([]);
  });
  it('replaces known variables and visibly preserves unknown variables', () => {
    expect(renderTemplate('Hi {{customer.name}} {{secret}} {{order.no}}', { 'customer.name': 'Ana' })).toEqual({ text: 'Hi Ana {{secret}} {{order.no}}', unknown: ['secret', 'order.no'] });
  });
  it('safely encodes and truncates a mailto without splitting unicode', () => {
    const result = buildMailto(['demo@example.test'], 'A & B', '🙂'.repeat(2000));
    expect(result.url.length).toBeLessThanOrEqual(1800); expect(result.truncated).toBe(true);
    expect(decodeURIComponent(result.url)).toContain('A & B');
  });
  it('evaluates guide progress from activity and can scope the actor', () => {
    const logs = [{ entityType: 'order', action: 'create', createdAt: '2026-10-18T12:00:00Z' }];
    expect(evaluateGuide(logs, '2026-10-18T00:00:00Z')[0].complete).toBe(true);
    expect(evaluateGuide(logs, '2026-10-19T00:00:00Z')[0].complete).toBe(false);
  });
});
