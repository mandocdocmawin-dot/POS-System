import { useEmailStore } from '../store/useEmailStore';
import { emailSchema, type Email } from '../types/phase8';
import { currentUser, timestamp } from './phase8Context';
import { PermissionError } from '../utils/permissions';
import { toast } from './toastService';
import { buildMailto } from '../utils/mailto';
function owned(id: string) { const u = currentUser('email:use'), email = useEmailStore.getState().emails.find(m => m.id === id && m.ownerStaffId === u.id); if (!email) throw new PermissionError('email:ownership'); return email; }
export const emailService = {
  list: () => { const u = currentUser('email:use'); return structuredClone(useEmailStore.getState().emails.filter(e => e.ownerStaffId === u.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))); },
  saveDraft: (input: Partial<Email>) => {
    const u = currentUser('email:use'), current = input.id ? owned(input.id) : undefined;
    if (current && current.folder !== 'drafts') throw new Error('Only drafts can be edited.');
    const next = emailSchema.parse({ subject: '', body: '', to: [], starred: false, read: true, ...input, id: current?.id ?? crypto.randomUUID(), ownerStaffId: u.id, folder: 'drafts', from: u.email, createdAt: current?.createdAt ?? timestamp() });
    useEmailStore.setState(s => ({ emails: current ? s.emails.map(e => e.id === next.id ? next : e) : [...s.emails, next] })); return next;
  },
  send: (id: string) => {
    const e = owned(id); if (e.folder !== 'drafts') throw new Error('Only drafts can be sent.');
    if (!e.subject.trim() || !e.to.length || e.to.some(to => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to))) throw new Error('Enter a subject and valid recipient emails.');
    useEmailStore.setState(s => ({ emails: s.emails.map(e => e.id === id ? { ...e, folder: 'sent', deliveryStatus: 'demo_saved', createdAt: timestamp() } : e) }));
    toast.info('Saved to Sent. Nothing was actually sent.');
  },
  update: (id: string, input: Pick<Partial<Email>, 'starred' | 'read'>) => { owned(id); useEmailStore.setState(s => ({ emails: s.emails.map(e => e.id === id ? { ...e, ...input } : e) })); },
  trash: (id: string) => { const e = owned(id); if (e.folder === 'trash') return; useEmailStore.setState(s => ({ emails: s.emails.map(m => m.id === id ? { ...m, previousFolder: e.folder as 'inbox' | 'sent' | 'drafts', folder: 'trash' } : m) })); },
  restore: (id: string) => { const e = owned(id); if (e.folder !== 'trash') throw new Error('This email is not in Trash.'); useEmailStore.setState(s => ({ emails: s.emails.map(m => m.id === id ? { ...m, folder: m.previousFolder ?? 'inbox' } : m) })); },
  remove: (id: string) => { const e = owned(id); if (e.folder !== 'trash') throw new Error('Move this email to Trash first.'); useEmailStore.setState(s => ({ emails: s.emails.filter(m => m.id !== id) })); },
  mailto: (id: string) => { const e = owned(id); return buildMailto(e.to, e.subject, e.body, e.cc); },
};
