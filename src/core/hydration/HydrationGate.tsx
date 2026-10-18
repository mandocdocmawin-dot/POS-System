import { useEffect, useState, type ReactNode } from 'react';
import { hydrateApplication } from './bootstrap';
import { StorageNotice } from '../storage/StorageNotice';
import { storageEvents } from '../storage/events';
import { RecoveryScreen } from '../RecoveryScreen';

export function HydrationGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');
  useEffect(() => {
    let alive = true;
    void hydrateApplication().then(() => {
      if (alive) setStatus(storageEvents.get().some(p => p.kind !== 'write') ? 'failed' : 'ready');
    }).catch(() => { if (alive) setStatus('failed'); });
    return () => { alive = false; };
  }, []);
  return <><StorageNotice />{status === 'ready' ? children : status === 'failed' ? <RecoveryScreen /> : <main id="main-content" tabIndex={-1} className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-slate-50 p-6 text-slate-900 dark:bg-slate-950 dark:text-white">
    <div className="rounded-xl bg-orange-500 px-5 py-3 text-3xl font-bold text-white">TindaPOS</div>
    <p role="status">Loading your data…</p>
  </main>}</>;
}
