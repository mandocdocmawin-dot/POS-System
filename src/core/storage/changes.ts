const listeners = new Set<(key: string) => void>();
export const storageChanges = {
  subscribe: (listener: (key: string) => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
  publish: (key: string) => listeners.forEach(listener => listener(key)),
};
