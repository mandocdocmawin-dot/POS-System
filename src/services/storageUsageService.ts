import { rawDatabase } from '../core/storage/database';
import { localKeys } from '../core/storage';
import { persistedStores } from '../core/hydration/registry';
import { currentUser } from './phase8Context';
import { notificationService } from './notificationService';
import { useOrderStore } from '../store/useOrderStore';
import { useMetaStore } from '../store/useMetaStore';
let requested = false;
export const storageUsageService = {
  inspect: async () => {
    currentUser('settings:manage');
    const estimate = await navigator.storage?.estimate?.() ?? {}, persisted = await navigator.storage?.persisted?.() ?? false, indexed = new Map(await rawDatabase.entries());
    const rows = persistedStores.map(store => { const backend = localKeys.has(store.key) ? 'localStorage' : 'IndexedDB', value = backend === 'localStorage' ? localStorage.getItem(store.key) : indexed.get(store.key); return { key: store.key, backend, bytes: typeof value === 'string' ? new Blob([value]).size : 0 }; });
    let localBytes = 0; const legacy: string[] = [];
    for (let i = 0; i < localStorage.length; i++) { const key = localStorage.key(i)!; localBytes += (key.length + (localStorage.getItem(key)?.length ?? 0)) * 2; if (key.startsWith('tindapos-legacy:')) legacy.push(key); }
    const ratio = estimate.quota ? (estimate.usage ?? 0) / estimate.quota : 0; notificationService.setUsage(ratio, localBytes);
    return { rows, localBytes, legacy, persisted, usage: estimate.usage ?? 0, quota: estimate.quota ?? 0, ratio };
  },
  requestPersistence: async () => {
    if (requested || typeof navigator === 'undefined' || !navigator.storage?.persist) return false;
    requested = true;
    try { return await navigator.storage.persist(); } catch { return false; }
  },
  removeLegacy: () => { currentUser('settings:manage'); const keys: string[] = []; for (let i = 0; i < localStorage.length; i++) { const key = localStorage.key(i)!; if (key.startsWith('tindapos-legacy:')) keys.push(key); } keys.forEach(key => localStorage.removeItem(key)); },
  markBackup: async () => { useMetaStore.setState({ lastBackupAt: new Date().toISOString() }); await storageUsageService.requestPersistence(); },
};
export function startStorageMonitoring() {
  return useOrderStore.subscribe((state, previous) => { if (state.orders.length > previous.orders.length) void storageUsageService.requestPersistence(); });
}
