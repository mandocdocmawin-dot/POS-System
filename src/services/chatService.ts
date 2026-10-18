import { useChatStore } from '../store/useChatStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { chatMessageSchema, conversationSchema, type Conversation } from '../types/phase8';
import { currentUser, canUse, activePeople, timestamp } from './phase8Context';
import { PermissionError } from '../utils/permissions';
const pending = new Map<string, ReturnType<typeof setTimeout>>();
function conversation(id: string) {
  const user = currentUser('chat:use'), c = useChatStore.getState().conversations.find(c => c.id === id);
  if (!c || !c.memberIds.includes(user.id)) throw new PermissionError('chat:membership');
  return c;
}
export const chatService = {
  people: () => { currentUser('chat:use'); return activePeople(); },
  list: () => { const u = currentUser('chat:use'); return structuredClone(useChatStore.getState().conversations.filter(c => c.memberIds.includes(u.id)).sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt))); },
  messages: (id: string) => { conversation(id); return structuredClone(useChatStore.getState().messages.filter(m => m.conversationId === id)); },
  typing: (id: string) => pending.has(id),
  create: (type: Conversation['type'], memberIds: string[], name?: string) => {
    const u = currentUser('chat:use'), members = [...new Set([u.id, ...memberIds])], state = useChatStore.getState();
    if (members.length < 2 || members.some(id => !activePeople().some(s => s.id === id))) throw new Error('Select at least two active staff members.');
    if (type === 'direct' && members.length !== 2) throw new Error('Direct messages need exactly two members.');
    if (type === 'direct') { const found = state.conversations.find(c => c.type === 'direct' && c.memberIds.length === 2 && members.every(id => c.memberIds.includes(id))); if (found) return found; }
    if (type === 'group' && (!name?.trim() || state.conversations.some(c => c.name?.toLowerCase() === name.trim().toLowerCase()))) throw new Error('Choose a unique group name.');
    const c = conversationSchema.parse({ id: crypto.randomUUID(), type, memberIds: members, name: name?.trim(), createdBy: u.id, createdAt: timestamp(), lastMessageAt: timestamp() });
    useChatStore.setState({ conversations: [...state.conversations, c] }); return c;
  },
  updateGroup: (id: string, name: string, memberIds: string[]) => {
    const c = conversation(id), u = currentUser('chat:use'), members = [...new Set(memberIds)], state = useChatStore.getState();
    if (c.type !== 'group' || (c.createdBy !== u.id && !canUse('help:manage'))) throw new PermissionError('chat:manage');
    if (c.name === '#general') throw new Error('The system #general channel cannot be renamed or have members removed.');
    if (!name.trim() || state.conversations.some(other => other.id !== id && other.name?.toLowerCase() === name.trim().toLowerCase())) throw new Error('Choose a unique group name.');
    if (members.length < 2 || members.some(id => !activePeople().some(s => s.id === id))) throw new Error('Select at least two active members.');
    useChatStore.setState({ conversations: state.conversations.map(item => item.id === id ? { ...item, name: name.trim(), memberIds: members } : item) });
  },
  removeGroup: (id: string) => {
    const c = conversation(id), u = currentUser('chat:use');
    if (c.name === '#general') throw new Error('The system channel cannot be deleted.');
    if (c.createdBy !== u.id && u.role !== 'admin') throw new PermissionError('chat:manage');
    useChatStore.setState(s => ({ conversations: s.conversations.filter(c => c.id !== id), messages: s.messages.filter(m => m.conversationId !== id) }));
  },
  send: (id: string, text: string, replyToId?: string) => {
    const c = conversation(id), user = currentUser('chat:use'), content = text.trim();
    if (!content || content.length > 2000) throw new Error('Messages must contain 1–2,000 characters.');
    if (replyToId && !chatService.messages(id).some(m => m.id === replyToId)) throw new Error('Reply target is not in this conversation.');
    const message = chatMessageSchema.parse({ id: crypto.randomUUID(), conversationId: id, senderId: user.id, text: content, replyToId, createdAt: timestamp(), readBy: { [user.id]: timestamp() } });
    useChatStore.setState(s => ({ messages: [...s.messages, message], conversations: s.conversations.map(c => c.id === id ? { ...c, lastMessageAt: message.createdAt } : c) }));
    const autoReply = useNotificationStore.getState().prefs.find(p => p.userId === user.id)?.autoReply ?? true;
    if (c.type === 'direct' && autoReply) {
      const other = c.memberIds.find(member => member !== user.id)!;
      const existing = pending.get(id); if (existing) clearTimeout(existing);
      pending.set(id, setTimeout(() => {
        pending.delete(id);
        const latest = useChatStore.getState().conversations.find(c => c.id === id);
        if (!latest?.memberIds.includes(other) || !latest.memberIds.includes(user.id)) return;
        const reply = chatMessageSchema.parse({ id: crypto.randomUUID(), conversationId: id, senderId: other, text: 'Thanks! This is an automatic demo reply. I will take a look.', createdAt: timestamp(), readBy: { [other]: timestamp() }, isAutoReply: true });
        useChatStore.setState(s => ({ messages: [...s.messages, reply], conversations: s.conversations.map(c => c.id === id ? { ...c, lastMessageAt: reply.createdAt } : c) }));
      }, 1000 + Math.random() * 2000));
    }
    return message;
  },
  edit: (id: string, text: string) => {
    const user = currentUser('chat:use'), m = useChatStore.getState().messages.find(m => m.id === id);
    if (!m || m.senderId !== user.id || m.deletedAt) throw new PermissionError('chat:ownership');
    conversation(m.conversationId);
    const next = chatMessageSchema.parse({ ...m, text: text.trim(), editedAt: timestamp() });
    if (!next.text) throw new Error('Message is required.');
    useChatStore.setState(s => ({ messages: s.messages.map(m => m.id === id ? next : m) }));
  },
  remove: (id: string) => { const u = currentUser('chat:use'), m = useChatStore.getState().messages.find(m => m.id === id); if (!m || m.senderId !== u.id) throw new PermissionError('chat:ownership'); conversation(m.conversationId); useChatStore.setState(s => ({ messages: s.messages.map(m => m.id === id ? { ...m, text: '', deletedAt: timestamp() } : m) })); },
  markRead: (id: string) => { conversation(id); const u = currentUser('chat:use'); useChatStore.setState(s => ({ messages: s.messages.map(m => m.conversationId === id && !m.readBy[u.id] ? { ...m, readBy: { ...m.readBy, [u.id]: timestamp() } } : m) })); },
  unread: () => { const u = currentUser('chat:use'), ids = chatService.list().map(c => c.id); return useChatStore.getState().messages.filter(m => ids.includes(m.conversationId) && m.senderId !== u.id && !m.readBy[u.id] && !m.deletedAt).length; },
};
