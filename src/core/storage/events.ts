export interface StorageProblem { key: string; kind: 'write' | 'read' | 'corrupt' | 'migration'; message: string }
let problems: StorageProblem[] = [];
const listeners = new Set<() => void>();
export const storageEvents = {
  get: () => problems,
  subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
  report: (problem: StorageProblem) => {
    problems = [...problems.filter(p => p.key !== problem.key || p.kind !== problem.kind), problem];
    listeners.forEach(listener => listener());
  },
  clear: () => { problems = []; listeners.forEach(listener => listener()); },
};
export function reportStorageError(key: string, kind: StorageProblem['kind'], error: unknown) {
  storageEvents.report({ key, kind, message: error instanceof Error ? error.message : String(error) });
}
