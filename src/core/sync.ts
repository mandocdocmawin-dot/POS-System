import { localKeys } from './storage';
import { storageChanges } from './storage/changes';
import { reportStorageError } from './storage/events';
import { toast } from '../services/toastService';
export interface SyncStore { key: string; persist: { rehydrate: () => void | Promise<void> } }
export interface SyncMessage { key: string; version: number }
export function validSyncMessage(value: unknown): value is SyncMessage {
  if (!value || typeof value !== 'object' || !('key' in value) || !('version' in value)) return false;
  return typeof value.key === 'string' && value.key.startsWith('tindapos:') && !localKeys.has(value.key) && typeof value.version === 'number' && Number.isFinite(value.version) && value.version > 0;
}
export async function receiveSync(value: unknown, stores: SyncStore[], onOpenEdit: (key: string) => boolean = () => false, notify = (message: string) => toast.info(message)) {
  if (!validSyncMessage(value)) return false;
  const store = stores.find(store => store.key === value.key);
  if (!store) return false;
  try {
    await store.persist.rehydrate();
    if (onOpenEdit(store.key)) notify('This record changed in another tab');
    return true;
  } catch (error) { reportStorageError(store.key, 'read', error); return false; }
}
export function startCrossTabSync(stores: SyncStore[]) {
  if (typeof BroadcastChannel === 'undefined') return () => undefined;
  const channel = new BroadcastChannel('tindapos');
  let revision = Date.now();
  const unsubscribe = storageChanges.subscribe(key => {
    if (!localKeys.has(key)) {
      try { channel.postMessage({ key, version: ++revision }); } catch { /* A closed channel must not fail a successful save. */ }
    }
  });
  let receiving = Promise.resolve();
  channel.onmessage = (event: MessageEvent<unknown>) => {
    receiving = receiving.then(async () => {
      await receiveSync(event.data, stores, key => {
        // Editors may mark their store explicitly. A focused form is a conservative fallback.
        const form = document.activeElement?.closest('form');
        return !!form && (!form.dataset.storeKey || form.dataset.storeKey === key);
      });
    }).catch(error => reportStorageError('sync', 'read', error));
  };
  return () => { unsubscribe(); channel.close(); };
}
