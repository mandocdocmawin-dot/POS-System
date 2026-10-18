import { useTicketStore } from '../store/useTicketStore';
import { ticketSchema, type Ticket } from '../types/phase8';
import { currentUser, canUse, activePeople, timestamp } from './phase8Context';
import { PermissionError } from '../utils/permissions';
import { activityService } from './activityService';
function ticket(id: string) { const u = currentUser('help:use'), t = useTicketStore.getState().tickets.find(t => t.id === id); if (!t || (t.authorId !== u.id && !canUse('help:manage'))) throw new PermissionError('help:ownership'); return t; }
export const ticketService = {
  people: () => { currentUser('help:manage'); return activePeople(); },
  list: () => { const u = currentUser('help:use'); return structuredClone(useTicketStore.getState().tickets.filter(t => t.authorId === u.id || canUse('help:manage')).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))); },
  create: (input: Pick<Ticket, 'subject' | 'message' | 'category' | 'priority' | 'source'>) => {
    const u = currentUser('help:use'), year = String(new Date().getFullYear()), s = useTicketStore.getState();
    const counter = Math.max(s.ticketCounters[year] ?? 0, ...s.tickets.filter(t => t.ticketNo.startsWith(`TKT-${year}-`)).map(t => Number(t.ticketNo.split('-').at(-1)) || 0)) + 1;
    const t = ticketSchema.parse({ ...input, subject: input.subject.trim(), message: input.message.trim(), id: crypto.randomUUID(), ticketNo: `TKT-${year}-${String(counter).padStart(3, '0')}`, status: 'active', tags: [], authorId: u.id, replies: [], createdAt: timestamp(), updatedAt: timestamp() });
    useTicketStore.setState({ tickets: [...s.tickets, t], ticketCounters: { ...s.ticketCounters, [year]: counter } }); activityService.log('ticket', t.id, 'create', `Created ${t.ticketNo}`); return t;
  },
  reply: (id: string, body: string) => { const t = ticket(id), u = currentUser('help:use'); if (!body.trim() || t.status !== 'active') throw new Error('Enter a reply on an active ticket.'); const next = ticketSchema.parse({ ...t, replies: [...t.replies, { id: crypto.randomUUID(), authorId: u.id, body: body.trim(), createdAt: timestamp() }], updatedAt: timestamp() }); useTicketStore.setState(s => ({ tickets: s.tickets.map(t => t.id === id ? next : t) })); },
  status: (id: string, status: Ticket['status']) => { currentUser('help:manage'); const t = ticket(id), next = ticketSchema.parse({ ...t, status, updatedAt: timestamp(), closedAt: status === 'closed' ? timestamp() : undefined }); useTicketStore.setState(s => ({ tickets: s.tickets.map(t => t.id === id ? next : t) })); activityService.log('ticket', id, status, `${t.ticketNo}: ${status}`); },
  assign: (id: string, staffId?: string) => { currentUser('help:manage'); ticket(id); if (staffId && !activePeople().some(s => s.id === staffId)) throw new Error('Choose active staff.'); useTicketStore.setState(s => ({ tickets: s.tickets.map(t => t.id === id ? { ...t, assigneeId: staffId, updatedAt: timestamp() } : t) })); },
};
