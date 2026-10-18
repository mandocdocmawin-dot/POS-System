import { useNoteStore } from '../store/useNoteStore';
import { noteSchema, type Note } from '../types/phase8';
import { currentUser, canUse, requireOwn, timestamp } from './phase8Context';
export const noteService = {
  list: (staffId: string) => { const u = currentUser(); requireOwn(staffId, 'staff:view'); return structuredClone(useNoteStore.getState().notes.filter(n => n.profileStaffId === staffId && (n.authorId === u.id || (n.visibility === 'managers' && canUse('staff:manage')))).sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt))); },
  save: (input: Note) => { const u = currentUser(); requireOwn(input.profileStaffId, 'staff:view'); const old = useNoteStore.getState().notes.find(n => n.id === input.id); if (old) requireOwn(old.authorId); if (input.visibility === 'managers' && !canUse('staff:manage')) throw new Error('Manager notes need staff management permission.'); const next = noteSchema.parse({ ...input, authorId: u.id, createdAt: old?.createdAt ?? timestamp(), updatedAt: timestamp() }); useNoteStore.setState(s => ({ notes: old ? s.notes.map(n => n.id === next.id ? next : n) : [...s.notes, next] })); },
  remove: (id: string) => { const n = useNoteStore.getState().notes.find(n => n.id === id); if (!n) throw new Error('Note not found.'); requireOwn(n.authorId); useNoteStore.setState(s => ({ notes: s.notes.filter(n => n.id !== id) })); },
};
