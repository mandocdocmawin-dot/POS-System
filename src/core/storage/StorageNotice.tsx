import { useSyncExternalStore } from 'react';
import { storageEvents } from './events';
export function StorageNotice() {
  const problems = useSyncExternalStore(storageEvents.subscribe, storageEvents.get);
  if (!problems.some(p => p.kind === 'write')) return null;
  return <aside role="alert" className="fixed bottom-4 left-4 z-[150] max-w-sm rounded-lg border border-red-500 bg-white p-4 text-slate-900 shadow-lg dark:bg-slate-900 dark:text-white">
    <p>Storage is full. Export a backup and free space.</p>
    <a className="btn mt-3" href={`${import.meta.env.BASE_URL}settings/general#data`}>Open data settings</a>
    <p className="mt-2 text-xs">Recent changes may only be available in this tab. Keep it open until you export.</p>
  </aside>;
}
