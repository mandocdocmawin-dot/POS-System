import { beforeEach, expect, it, vi } from 'vitest';
vi.hoisted(() => { const values = new Map<string, string>(); const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); }, removeItem: (key: string) => { values.delete(key); } }; Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true }); Object.defineProperty(globalThis, 'window', { value: { localStorage: storage }, configurable: true }); });
import { dataService } from './dataService';
import { authService } from './authService';
import { useStaffStore } from '../store/useStaffStore';
import { useRoleStore } from '../store/useRoleStore';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import { useTicketStore } from '../store/useTicketStore';
import { useEmailStore } from '../store/useEmailStore';
import { useNoteStore } from '../store/useNoteStore';
import { useContentStore } from '../store/useContentStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { createPhase5Seed } from '../data/seed/phase5';
import { initializePhase8Data } from './initializePhase8Data';
import { chatService } from './chatService';
import { emailService } from './emailService';
import { ticketService } from './ticketService';
import { templateService } from './templateService';
import { noteService } from './noteService';
import { planService } from './planService';
import { validateDocument, documentService } from './documentService';
import { searchService } from './searchService';
import { notificationService } from './notificationService';
import { calendarService } from './calendarService';
import { yearlySaving } from './planService';
beforeEach(() => {
  const seed = createPhase5Seed(); useStaffStore.setState({ staff: seed.staff }); useRoleStore.setState({ roles: seed.roles }); useAuthStore.setState({ currentUserId: 'staff-admin' }); dataService.reset(); authService.loginDemo('admin');
  useChatStore.setState({ conversations: [], messages: [] }); useTicketStore.setState({ tickets: [], ticketCounters: {} }); useEmailStore.setState({ emails: [], templates: [] }); useContentStore.setState({ faqs: [], plans: [], subscription: null, invoices: [], votes: {}, recentSearches: {} }); useNoteStore.setState({ notes: [] }); useNotificationStore.setState({ prefs: [], notificationStates: [] }); initializePhase8Data();
  const prefs = notificationService.prefs(); notificationService.savePrefs({ ...prefs, autoReply: false });
});
it('enforces conversation membership, ownership, limits and unique group names', () => {
  const c = chatService.create('direct', ['staff-manager']), m = chatService.send(c.id, 'Hello');
  chatService.edit(m.id, 'Edited'); expect(chatService.messages(c.id).at(-1)?.editedAt).toBeTruthy();
  expect(() => chatService.send(c.id, 'x'.repeat(2001))).toThrow('2,000');
  expect(() => chatService.create('group', ['staff-manager'], '#general')).toThrow('unique');
  authService.loginDemo('manager'); expect(() => chatService.edit(m.id, 'No')).toThrow();
  authService.loginDemo('cashier'); expect(() => chatService.messages(c.id)).toThrow();
});
it('protects system groups, soft-deletes own messages and records read receipts', () => {
  const general = chatService.list().find(c => c.name === '#general')!;
  expect(() => chatService.removeGroup(general.id)).toThrow('system');
  expect(() => chatService.updateGroup(general.id, '#renamed', general.memberIds)).toThrow('system');
  const c = chatService.create('direct', ['staff-manager']), m = chatService.send(c.id, 'Hello'); chatService.remove(m.id);
  expect(chatService.messages(c.id).find(row => row.id === m.id)).toMatchObject({ text: '', deletedAt: expect.any(String) });
  authService.loginDemo('manager'); chatService.markRead(c.id); expect(chatService.messages(c.id).at(-1)?.readBy['staff-manager']).toBeTruthy();
});
it('isolates mailboxes and saves simulated email to Sent', () => {
  const draft = emailService.saveDraft({ to: ['demo@example.test'], subject: 'Test', body: 'Demo' }); emailService.send(draft.id);
  expect(emailService.list().find(e => e.id === draft.id)).toMatchObject({ folder: 'sent', deliveryStatus: 'demo_saved' });
  authService.loginDemo('manager'); expect(() => emailService.update(draft.id, { read: true })).toThrow();
  authService.loginDemo('admin'); emailService.trash(draft.id); emailService.restore(draft.id); expect(emailService.list().find(e => e.id === draft.id)?.folder).toBe('sent');
  expect(() => templateService.remove('receipt')).toThrow('System');
});
it('numbers tickets monotonically and restricts management actions', () => {
  const make = () => ticketService.create({ subject: 'Question', message: 'Please help', category: 'Settings', priority: 'normal', source: 'contact' });
  const a = make(); ticketService.status(a.id, 'deleted'); const b = make(); expect(Number(b.ticketNo.split('-').at(-1))).toBe(Number(a.ticketNo.split('-').at(-1)) + 1); ticketService.status(a.id, 'active'); ticketService.reply(a.id, 'Thanks'); expect(ticketService.list().find(t => t.id === a.id)?.replies).toHaveLength(1);
  authService.loginDemo('cashier'); expect(ticketService.list().some(t => t.id === a.id)).toBe(false); expect(() => ticketService.status(a.id, 'closed')).toThrow();
});
it('validates document extensions, MIME, per-file and per-staff limits', () => {
  expect(() => validateDocument({ name: 'x.exe', type: 'application/pdf', size: 100 }, 0)).toThrow('Allowed');
  expect(() => validateDocument({ name: 'x.pdf', type: 'text/plain', size: 100 }, 0)).toThrow('MIME');
  expect(() => validateDocument({ name: 'x.pdf', type: 'application/pdf', size: 10 * 1024 * 1024 }, 0)).toThrow('5 MB');
  expect(() => validateDocument({ name: 'x.pdf', type: 'application/pdf', size: 1024 * 1024 }, 50 * 1024 * 1024)).toThrow('50 MB');
  authService.loginDemo('cashier'); expect(() => documentService.list('staff-admin')).toThrow();
});
it('keeps private notes author-only and manager notes scoped to staff management', () => {
  const user = authService.getCurrentUser()!, now = new Date().toISOString();
  noteService.save({ id: 'private', profileStaffId: 'staff-cashier', authorId: user.id, title: 'Private', body: '', color: 'amber', pinned: false, tags: [], visibility: 'private', createdAt: now, updatedAt: now });
  noteService.save({ id: 'managers', profileStaffId: 'staff-cashier', authorId: user.id, title: 'Manager', body: '', color: 'blue', pinned: false, tags: [], visibility: 'managers', createdAt: now, updatedAt: now });
  expect(noteService.list('staff-cashier')).toHaveLength(2);
  authService.loginDemo('cashier'); expect(noteService.list('staff-cashier')).toEqual([]); expect(() => noteService.remove('private')).toThrow();
});
it('protects the subscribed plan and records demo billing without card capture', () => {
  expect(() => planService.remove('growth')).toThrow('subscribed');
  const growth = planService.list().find(p => p.id === 'growth')!; expect(yearlySaving(growth)).toBe(198000);
  const before = planService.billing().invoices.length; planService.choose('starter', 'yearly'); expect(planService.billing().invoices).toHaveLength(before + 1);
  expect(() => planService.paymentMethod('4111111111111111')).toThrow('preset');
});
it('filters search and derived notifications inside services', () => {
  authService.loginDemo('cashier'); const user = authService.getCurrentUser()!;
  expect(searchService.search('staff', user).some(r => r.group === 'Staff')).toBe(false);
  expect(searchService.search('email', user).some(r => r.group === 'Pages' && r.link.startsWith('/email'))).toBe(false);
  const n = notificationService.list()[0]; if (n) { notificationService.mark(n.key); expect(notificationService.list().find(row => row.key === n.key)?.readAt).toBeTruthy(); notificationService.mark(n.key, true); expect(notificationService.list().some(row => row.key === n.key)).toBe(false); }
  expect(calendarService.derived().some(item => item.layer === 'payroll')).toBe(false);
});
