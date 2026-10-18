import { createStore, get, set, del } from 'idb-keyval';
import { useDocumentStore } from '../store/useDocumentStore';
import { staffDocumentSchema, type StaffDocument } from '../types/phase8';
import { currentUser, requireOwn, timestamp } from './phase8Context';
import { DOCUMENT_MAX_BYTES, DOCUMENT_STAFF_MAX_BYTES, documentTypes } from '../config/documents';
import { flushStorage } from '../core/storage';
import { rawDatabase } from '../core/storage/database';
const files = createStore('tindapos:documents', 'files');
export function validateDocument(file: { name: string; type: string; size: number }, existingSize: number) {
  const ext = file.name.toLowerCase().split('.').at(-1) ?? '';
  if (!documentTypes[ext]?.includes(file.type.toLowerCase())) throw new Error('Allowed files: PDF, PNG, JPG, DOCX, XLSX and TXT. The file extension and MIME type must match.');
  if (file.size <= 0 || file.size > DOCUMENT_MAX_BYTES) throw new Error('Each document must contain data and be at most 5 MB.');
  if (existingSize + file.size > DOCUMENT_STAFF_MAX_BYTES) throw new Error('Document limit is 50 MB per staff member.');
}
async function verifyMetadata(id: string, present: boolean) {
  await flushStorage();
  if (import.meta.env.MODE === 'test' && typeof indexedDB === 'undefined') return;
  const raw = await rawDatabase.get('tindapos:document');
  const docs: StaffDocument[] = typeof raw === 'string' ? JSON.parse(raw).state.documents : [];
  if (docs.some(d => d.id === id) !== present) throw new Error('Document metadata could not be saved. Export a backup and free browser storage.');
}
export const documentService = {
  list: (staffId: string) => { requireOwn(staffId, 'staff:manage'); return structuredClone(useDocumentStore.getState().documents.filter(d => d.staffId === staffId)); },
  upload: async (staffId: string, file: File, category: StaffDocument['category'], expiresAt?: string, replaceId?: string) => {
    const u = requireOwn(staffId, 'documents:manage');
    const state = useDocumentStore.getState(), existing = state.documents.find(d => d.id === replaceId);
    if (replaceId && (!existing || existing.staffId !== staffId)) throw new Error('Document not found.');
    validateDocument(file, state.documents.filter(d => d.staffId === staffId && d.id !== replaceId).reduce((sum, d) => sum + d.size, 0));
    const key = crypto.randomUUID(), metadata = staffDocumentSchema.parse({ id: existing?.id ?? crypto.randomUUID(), staffId, name: file.name, category, mime: file.type, size: file.size, fileKey: key, expiresAt: expiresAt || undefined, uploadedBy: u.id, createdAt: timestamp(), fileMissing: false });
    await set(key, file, files);
    try {
      useDocumentStore.setState({ documents: existing ? state.documents.map(d => d.id === existing.id ? metadata : d) : [...state.documents, metadata] });
      await verifyMetadata(metadata.id, true);
      if (existing) await del(existing.fileKey, files);
      return metadata;
    } catch (error) { useDocumentStore.setState(state); await del(key, files); throw error; }
  },
  blob: async (id: string) => { currentUser(); const d = useDocumentStore.getState().documents.find(d => d.id === id); if (!d) throw new Error('Document not found.'); requireOwn(d.staffId, 'staff:manage'); const blob = await get<Blob>(d.fileKey, files); if (!(blob instanceof Blob)) throw new Error('File missing. Re-upload this document.'); return blob; },
  remove: async (id: string) => { const state = useDocumentStore.getState(), d = state.documents.find(d => d.id === id); if (!d) throw new Error('Document not found.'); requireOwn(d.staffId, 'documents:manage'); useDocumentStore.setState({ documents: state.documents.filter(d => d.id !== id) }); try { await verifyMetadata(id, false); await del(d.fileKey, files); } catch (error) { useDocumentStore.setState(state); throw error; } },
};
