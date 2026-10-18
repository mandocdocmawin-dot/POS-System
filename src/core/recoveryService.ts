import { rawDatabase } from './storage/database';
import { listSnapshots, restoreSnapshot, type Snapshot } from './snapshots';
import { persistedStores } from './hydration/registry';
import { localKeys } from './storage';
export const recoveryService = {
  listSnapshots,
  restore: async (snapshot: Snapshot) => { await restoreSnapshot(snapshot); location.reload(); },
  download: async () => {
    const indexed = await rawDatabase.entries().catch(()=>[] as [string,unknown][]);
    const raw = { indexedDB: Object.fromEntries(indexed), localStorage: Object.fromEntries(Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i)).filter((key): key is string => !!key && key.startsWith('tindapos')).map(key => [key, localStorage.getItem(key)])) };
    const url = URL.createObjectURL(new Blob([JSON.stringify(raw, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = `tindapos-raw-${Date.now()}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  },
  resetStore: async (key: string) => {
    if (!persistedStores.some(store => store.key === key) && key !== 'tindapos:meta') throw new Error('Unknown store.');
    const raw = localKeys.has(key) ? localStorage.getItem(key) : await rawDatabase.get(key);
    if (raw !== null && raw !== undefined) await rawDatabase.set(`tindapos-quarantine:${key}:${Date.now()}`, raw);
    await rawDatabase.remove(key);
    localStorage.removeItem(key);
    location.reload();
  },
  resetAll: async () => {
    await rawDatabase.removeMany((await rawDatabase.entries()).filter(([key]) => key.startsWith('tindapos:')).map(([key]) => key));
    const keys = Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i)).filter((key): key is string => !!key && key.startsWith('tindapos'));
    keys.forEach(key => localStorage.removeItem(key));
    location.reload();
  },
};
