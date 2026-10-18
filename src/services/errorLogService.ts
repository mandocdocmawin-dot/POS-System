import { useErrorLogStore } from '../store/useErrorLogStore';
import { currentUser } from './phase8Context';
export const errorLogService = {
  record: (error: unknown, route = typeof location === 'undefined' ? '' : location.pathname) => {
    const entry = { id: crypto.randomUUID(), message: error instanceof Error ? error.message : String(error), stack: error instanceof Error ? error.stack : undefined, route, createdAt: new Date().toISOString() };
    useErrorLogStore.setState(s => ({ errors: [entry, ...s.errors].slice(0, 50) })); return entry;
  },
  list: () => { currentUser('settings:manage'); return structuredClone(useErrorLogStore.getState().errors); },
  clear: () => { currentUser('settings:manage'); useErrorLogStore.setState({ errors: [] }); },
};
