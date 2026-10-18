import { useStaffStore } from '../store/useStaffStore';
import { useCalendarStore } from '../store/useCalendarStore';
import { useChatStore } from '../store/useChatStore';
import { useEmailStore } from '../store/useEmailStore';
import { useTicketStore } from '../store/useTicketStore';
import { useContentStore } from '../store/useContentStore';
import { useNoteStore } from '../store/useNoteStore';
import { createCalendarSeed } from '../data/seed/calendar';
import { createChatSeed } from '../data/seed/chat';
import { createEmailSeed } from '../data/seed/emails';
import { createTemplateSeed } from '../data/seed/templates';
import { createTicketSeed } from '../data/seed/tickets';
import { createFaqSeed } from '../data/seed/faqs';
import { createPlanSeed } from '../data/seed/plans';
import { createNoteSeed } from '../data/seed/notes';
export function initializePhase8Data() {
  const staff = useStaffStore.getState().staff.filter(s => s.status === 'active');
  const owner = staff.find(s => s.role === 'admin')?.id ?? staff[0]?.id;
  if (!owner) return;
  if (!useCalendarStore.getState().events.length) useCalendarStore.setState({ events: createCalendarSeed(owner) });
  if (!useChatStore.getState().conversations.length) useChatStore.setState(createChatSeed(staff));
  if (!useEmailStore.getState().templates.length) useEmailStore.setState({ templates: createTemplateSeed(), emails: createEmailSeed(staff.map(s => s.id)) });
  if (!useTicketStore.getState().tickets.length && !Object.keys(useTicketStore.getState().ticketCounters).length) useTicketStore.setState({ tickets: createTicketSeed(owner), ticketCounters: { [String(new Date().getFullYear())]: 6 } });
  if (!useContentStore.getState().plans.length) useContentStore.setState({ ...createPlanSeed(), faqs: createFaqSeed() });
  if (!useNoteStore.getState().notes.length) useNoteStore.setState({ notes: createNoteSeed(owner) });
}
