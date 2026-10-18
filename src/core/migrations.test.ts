import 'fake-indexeddb/auto';
import { beforeEach, expect, it, vi } from 'vitest';
import { rawDatabase } from './storage/database';
import { storageEvents } from './storage/events';
import { runMigrations } from './migrations';
import { listSnapshots, takeSnapshot, restoreSnapshot, finishInterruptedRestore } from './snapshots';

const raw = (n: number, version = 1) => JSON.stringify({ state: { count: n }, version });
beforeEach(async () => {
  storageEvents.clear();
  await rawDatabase.removeMany((await rawDatabase.entries()).map(([key]) => key));
  const values = new Map<string, string>();
  vi.stubGlobal('localStorage', { get length() { return values.size; }, key: (index: number) => [...values.keys()][index] ?? null, getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); }, removeItem: (key: string) => { values.delete(key); } });
});
it('orders migration steps, snapshots before writes and is idempotent', async () => {
  await rawDatabase.set('tindapos:example', raw(1));
  const apply = vi.fn((value: unknown) => ({ count: (value as { count: number }).count + 1 }));
  const registry = [{ storeKey: 'tindapos:example', fromVersion: 2, toVersion: 3, migrate: apply }, { storeKey: 'tindapos:example', fromVersion: 1, toVersion: 2, migrate: apply }];
  await runMigrations(registry);
  expect(JSON.parse(String(await rawDatabase.get('tindapos:example')))).toEqual(JSON.parse(raw(3, 3)));
  expect((await listSnapshots())[0].data['tindapos:example']).toBe(raw(1));
  await runMigrations(registry);
  expect(apply).toHaveBeenCalledTimes(2);
  expect(await listSnapshots()).toHaveLength(1);
});
it('rotates snapshots to the last three', async () => {
  for (let i = 0; i < 5; i++) { await rawDatabase.set('tindapos:example', raw(i)); await takeSnapshot(String(i)); }
  const snapshots = await listSnapshots();
  expect(snapshots).toHaveLength(3);
  expect(snapshots.some(snapshot => snapshot.reason === '4')).toBe(true);
  expect(snapshots.some(snapshot => snapshot.reason === '0')).toBe(false);
});
it('refuses invalid restores before touching any records', async () => {
  await rawDatabase.set('tindapos:example', raw(1));
  const snapshot = await takeSnapshot('good');
  await expect(restoreSnapshot({ ...snapshot, data: { 'tindapos:example': 'broken' } })).rejects.toThrow('invalid');
  expect(await rawDatabase.get('tindapos:example')).toBe(raw(1));
});
it('restores all records and removes records absent in the snapshot', async () => {
  await rawDatabase.set('tindapos:example', raw(1));
  localStorage.setItem('tindapos:auth', raw(1));
  const snapshot = await takeSnapshot('good');
  await rawDatabase.setMany([['tindapos:example', raw(2)], ['tindapos:extra', raw(3)]]);
  localStorage.setItem('tindapos:auth', raw(2));
  await restoreSnapshot(snapshot);
  expect(await rawDatabase.get('tindapos:example')).toBe(raw(1));
  expect(await rawDatabase.get('tindapos:extra')).toBeUndefined();
  expect(localStorage.getItem('tindapos:auth')).toBe(raw(1));
  expect(await rawDatabase.get('recovery:journal')).toBeUndefined();
});
it('rolls back on failed local writes and recovers an interrupted restore', async () => {
  await rawDatabase.set('tindapos:example', raw(1));
  localStorage.setItem('tindapos:auth', raw(1));
  const snapshot = await takeSnapshot('good');
  await rawDatabase.set('tindapos:example', raw(2));
  localStorage.setItem('tindapos:auth', raw(2));
  const write = vi.spyOn(localStorage, 'setItem').mockImplementationOnce(() => { throw new Error('Full'); });
  await expect(restoreSnapshot(snapshot)).rejects.toThrow('Full');
  expect(await rawDatabase.get('tindapos:example')).toBe(raw(2));
  expect(localStorage.getItem('tindapos:auth')).toBe(raw(2));
  write.mockRestore();
  await rawDatabase.set('recovery:journal', snapshot.data);
  await finishInterruptedRestore();
  expect(await rawDatabase.get('tindapos:example')).toBe(raw(1));
});
it('never writes partially when a migration or snapshot fails', async () => {
  await rawDatabase.set('tindapos:example', raw(1));
  const registry = [{ storeKey: 'tindapos:example', fromVersion: 1, toVersion: 2, migrate: () => { throw new Error('Bad migration'); } }];
  await expect(runMigrations(registry)).rejects.toThrow('Bad migration');
  expect(await rawDatabase.get('tindapos:example')).toBe(raw(1));
  await expect(runMigrations([{ ...registry[0], migrate: () => ({ count: 2 }) }], () => Promise.reject(new Error('Snapshot failed')))).rejects.toThrow('Snapshot failed');
  expect(await rawDatabase.get('tindapos:example')).toBe(raw(1));
});
