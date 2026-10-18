import { createStore, get, set, del, entries, setMany, delMany } from 'idb-keyval';
export const stateDatabase = createStore('tindapos:state', 'state');
export const rawDatabase = {
  get: (key: string) => get<unknown>(key, stateDatabase),
  set: (key: string, value: unknown) => set(key, value, stateDatabase),
  remove: (key: string) => del(key, stateDatabase),
  entries: () => entries<string, unknown>(stateDatabase),
  setMany: (values: [string, unknown][]) => setMany(values, stateDatabase),
  removeMany: (keys: string[]) => delMany(keys, stateDatabase),
  batch: (values: [string, string | null][]) => stateDatabase('readwrite', store => new Promise<void>((resolve, reject) => {
    store.transaction.oncomplete = () => resolve();
    store.transaction.onabort = store.transaction.onerror = () => reject(store.transaction.error ?? new Error('State transaction aborted.'));
    try { for (const [key, value] of values) { if (value === null) store.delete(key); else store.put(value, key); } }
    catch (error) { store.transaction.abort(); reject(error); }
  })),
};
