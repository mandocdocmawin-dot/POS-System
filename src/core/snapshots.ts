import { z } from 'zod';
import { rawDatabase, stateDatabase } from './storage/database';
import { flushStorage, localKeys, validEnvelope } from './storage';
const snapshotSchema = z.object({ id: z.string(), createdAt: z.iso.datetime(), reason: z.string(), bytes: z.number().nonnegative(), data: z.record(z.string(), z.string()) });
export type Snapshot = z.infer<typeof snapshotSchema>;
const prefix = 'snapshots:';
export async function readAllData(): Promise<Record<string, string>> {
  await flushStorage();
  const data: Record<string, string> = {};
  for (const [key, value] of await rawDatabase.entries()) if (key.startsWith('tindapos:') && typeof value === 'string') data[key] = value;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('tindapos:') || key === 'tindapos-theme')) data[key] = localStorage.getItem(key)!;
  }
  return data;
}
export async function listSnapshots(): Promise<Snapshot[]> {
  return (await rawDatabase.entries()).filter(([key]) => key.startsWith(prefix)).flatMap(([, value]) => { const result = snapshotSchema.safeParse(value); return result.success ? [result.data] : []; }).sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id));
}
export async function takeSnapshot(reason: string): Promise<Snapshot> {
  const data = await readAllData(), id = crypto.randomUUID();
  const snapshot = { id, createdAt: new Date().toISOString(), reason, bytes: new Blob([JSON.stringify(data)]).size, data };
  await rawDatabase.set(prefix + id, snapshot);
  const older = (await listSnapshots()).filter(item => item.id !== id).slice(2);
  await rawDatabase.removeMany(older.map(item => prefix + item.id));
  return snapshot;
}

// A single read/write transaction verifies all replacement values before commit.
// Local state is staged first; a journal allows restart recovery if the tab closes.
async function replaceIndexedState(data: Record<string, string>) {
  await stateDatabase('readwrite', store => {
    const request = store.getAllKeys();
    request.onsuccess = () => {
      for (const key of request.result) if (typeof key === 'string' && key.startsWith('tindapos:') && !localKeys.has(key) && !(key in data)) store.delete(key);
      for (const [key, value] of Object.entries(data)) {
        if (localKeys.has(key)) continue;
        store.put(value, key);
        const check = store.get(key);
        check.onsuccess = () => { if (check.result !== value) store.transaction.abort(); };
      }
    };
  });
}
function replaceLocalState(data: Record<string, string>) {
  for (const key of localKeys) {
    if (data[key] === undefined) localStorage.removeItem(key);
    else {
      localStorage.setItem(key, data[key]);
      if (localStorage.getItem(key) !== data[key]) throw new Error(`Could not verify ${key}`);
    }
  }
}
export async function finishInterruptedRestore() {
  const value = await rawDatabase.get('recovery:journal');
  if (value === undefined) return;
  const data = z.record(z.string(), z.string()).parse(value);
  replaceLocalState(data);
  await replaceIndexedState(data);
  await rawDatabase.remove('recovery:journal');
}
export async function restoreSnapshot(value: unknown) {
  const snapshot = snapshotSchema.parse(value);
  for (const [key, raw] of Object.entries(snapshot.data)) {
    if ((!key.startsWith('tindapos:') && key !== 'tindapos-theme') || !validEnvelope(raw)) throw new Error(`Snapshot contains invalid state for ${key}.`);
  }
  const before = await readAllData();
  await rawDatabase.set('recovery:journal', before);
  try {
    replaceLocalState(snapshot.data);
    await replaceIndexedState(snapshot.data);
    await rawDatabase.remove('recovery:journal');
  } catch (error) {
    replaceLocalState(before);
    await replaceIndexedState(before);
    await rawDatabase.remove('recovery:journal');
    throw error;
  }
}
