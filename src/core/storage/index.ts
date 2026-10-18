import type { StateStorage } from 'zustand/middleware';
import { rawDatabase } from './database';
import { reportStorageError } from './events';
import { storageChanges } from './changes';

export const localKeys = new Set(['tindapos:auth', 'tindapos:active-branch', 'tindapos:pos', 'tindapos:ui', 'tindapos-theme', 'tindapos:guide', 'tindapos:meta']);
export function validEnvelope(raw: string): boolean {
  try {
    const value: unknown = JSON.parse(raw);
    return typeof value === 'object' && value !== null && 'state' in value && typeof value.state === 'object' && value.state !== null;
  } catch { return false; }
}
export function checkRaw(key: string, raw: string | null, quarantine: (key: string, raw: string) => void): string | null {
  if (raw === null || validEnvelope(raw)) return raw;
  quarantine(`tindapos-quarantine:${key}:${Date.now()}`, raw);
  reportStorageError(key, 'corrupt', 'Saved data is not a valid JSON state. The original value has been preserved.');
  return null;
}
export const safeLocalStorage: StateStorage = {
  getItem(key) {
    try { return checkRaw(key, localStorage.getItem(key), (name, raw) => localStorage.setItem(name, raw)); }
    catch (error) { reportStorageError(key, 'read', error); return null; }
  },
  setItem(key, value) { try { localStorage.setItem(key, value); } catch (error) { reportStorageError(key, 'write', error); } },
  removeItem(key) { try { localStorage.removeItem(key); } catch (error) { reportStorageError(key, 'write', error); } },
};
const pending = new Set<Promise<unknown>>();
function track<T>(promise: Promise<T>): Promise<T> {
  pending.add(promise);
  void promise.finally(() => pending.delete(promise)).catch(() => undefined);
  return promise;
}
export async function flushStorage() { while (pending.size) await Promise.all([...pending]); }
// Preserve write order, including a remove following a pending write.
let queue = Promise.resolve();
function enqueue(key: string, write: () => Promise<void>) {
  queue = queue.then(write).catch(error => { reportStorageError(key, 'write', error); });
  return track(queue);
}
const batches: Map<string, string | null>[] = [];
export function beginStorageBatch() { batches.push(new Map()); }
export function abortStorageBatch() { batches.pop(); }
export function commitStorageBatch() {
  const batch = batches.pop(); if (!batch?.size) return;
  const parent = batches.at(-1);
  if (parent) { batch.forEach((value, key) => parent.set(key, value)); return; }
  void enqueue([...batch.keys()].join(', '), async () => { await rawDatabase.batch([...batch]); batch.forEach((_value, key) => storageChanges.publish(key)); });
}
function persistValue(key: string, value: string | null) {
  const batch = batches.at(-1);
  if (batch) { batch.set(key, value); return Promise.resolve(); }
  return enqueue(key, async () => { if (value === null) await rawDatabase.remove(key); else await rawDatabase.set(key, value); storageChanges.publish(key); });
}
export const idbStorage: StateStorage = {
  async getItem(key) {
    try {
      await queue;
      const raw = await rawDatabase.get(key);
      if (raw === undefined) return null;
      if (typeof raw !== 'string' || !validEnvelope(raw)) {
        await rawDatabase.set(`tindapos-quarantine:${key}:${Date.now()}`, raw);
        reportStorageError(key, 'corrupt', 'Saved data is corrupted. A recovery copy has been preserved.');
        return null;
      }
      return raw;
    } catch (error) { reportStorageError(key, 'read', error); return null; }
  },
  setItem: (key, value) => persistValue(key, value),
  removeItem: key => persistValue(key, null),
};
