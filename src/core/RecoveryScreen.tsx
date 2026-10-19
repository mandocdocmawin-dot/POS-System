import { T } from "../i18n/T";
import { useEffect, useState } from 'react';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { storageEvents } from './storage/events';
import { recoveryService } from './recoveryService';
import type { Snapshot } from './snapshots';
export function RecoveryScreen() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState<{ title: string; message: string; action: () => Promise<void> }>();
  useEffect(() => { void recoveryService.listSnapshots().then(setSnapshots).catch(e => setError(String(e))); }, []);
  return <main id="main-content" tabIndex={-1} className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-5 p-6 text-slate-800 dark:text-slate-100">
    <h1 className="text-3xl font-bold">TindaPOS data recovery</h1>
    <p>Your saved data could not be loaded safely. Download your raw data before changing anything.</p>
    {error && <p role="alert" className="text-red-600">{error}</p>}
    <button className="btn self-start" onClick={() => { void recoveryService.download().catch(e => setError(String(e))); }}><T text={"Download raw data"}/></button>
    <h2 className="text-xl font-semibold">Restore a snapshot</h2>
    <p>Restoring replaces all saved app records with the selected snapshot. Document and image files are stored separately.</p>
    {snapshots.length === 0 && <p><T text={"No snapshots available."}/></p>}
    {snapshots.map(snapshot => <button className="btn justify-between" key={snapshot.id} onClick={() => setConfirm({ title: 'Restore snapshot?', message: `Replace saved records with the snapshot from ${new Date(snapshot.createdAt).toLocaleString()}? Export your raw data first.`, action: () => recoveryService.restore(snapshot) })}>{new Date(snapshot.createdAt).toLocaleString()} · {Math.ceil(snapshot.bytes / 1024)} KB · {snapshot.reason}</button>)}
    <h2 className="text-xl font-semibold"><T text={"Affected stores"}/></h2>
    {storageEvents.get().map(problem => <section className="rounded-lg border p-4" key={`${problem.key}:${problem.kind}`}><h3 className="font-semibold">{problem.key}</h3><p>{problem.message}</p>
      <button className="btn mt-3" onClick={() => setConfirm({ title: 'Reset only this store?', message: `All records in ${problem.key} will be removed. Related records in other stores may reference them. Export your raw data first.`, action: () => recoveryService.resetStore(problem.key) })}><T text={"Reset only this store"}/></button>
    </section>)}
    <button className="btn self-start text-red-600" onClick={() => setConfirm({ title: 'Reset everything?', message: 'All app records, sessions, preferences and legacy copies will be removed. Quarantine copies and snapshots remain available for recovery. Export your raw data first.', action: recoveryService.resetAll })}><T text={"Reset everything"}/></button>
    <ConfirmDialog open={!!confirm} title={confirm?.title ?? ''} message={confirm?.message ?? ''} onClose={() => setConfirm(undefined)} onConfirm={async () => { await confirm?.action(); }} />
  </main>;
}
