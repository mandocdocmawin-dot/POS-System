import { createJSONStorage } from 'zustand/middleware';
import { idbStorage, safeLocalStorage, localKeys } from './index';
import { reportStorageError } from './events';
// Old synchronous unit fixtures intentionally exercise the former local backend.
// Browser builds always use IndexedDB for heavy state, including when it fails.
export function storageOptions<T>(name: string) {
  const fixture = import.meta.env.MODE === 'test' && typeof indexedDB === 'undefined';
  return {
    storage: createJSONStorage<T>(() => fixture ? localStorage : localKeys.has(name) ? safeLocalStorage : idbStorage),
    skipHydration: typeof document !== 'undefined',
    onRehydrateStorage: () => (_state: T | undefined, error: unknown) => { if (error) reportStorageError(name, 'migration', error); },
  };
}
