import { createStore, get, set, del, entries, setMany, delMany } from 'idb-keyval';
export const stateDatabase = createStore('tindapos:state', 'state');
export const rawDatabase = {
  get: (key: string) => get<unknown>(key, stateDatabase),
  set: (key: string, value: unknown) => set(key, value, stateDatabase),
  remove: (key: string) => del(key, stateDatabase),
  entries: () => entries<string, unknown>(stateDatabase),
  setMany: (values: [string, unknown][]) => setMany(values, stateDatabase),
  removeMany: (keys: string[]) => delMany(keys, stateDatabase),
};
