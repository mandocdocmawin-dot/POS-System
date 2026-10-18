import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { idbStorage, safeLocalStorage, beginStorageBatch, commitStorageBatch, abortStorageBatch, flushStorage } from './index';
import { rawDatabase } from './database';
import { storageEvents } from './events';

beforeEach(async () => {
  storageEvents.clear();
  await rawDatabase.removeMany((await rawDatabase.entries()).map(([key]) => key));
  const values = new Map<string, string>();
  vi.stubGlobal('localStorage', { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); }, removeItem: (key: string) => { values.delete(key); } });
});
describe('safe storage adapters', () => {
  it('commits nested multi-store writes together and discards aborted batches', async () => {
    const raw = '{"state":{"value":1},"version":1}';
    beginStorageBatch();
    await idbStorage.setItem('tindapos:orders', raw);
    beginStorageBatch(); await idbStorage.setItem('tindapos:stock', raw); commitStorageBatch();
    expect(await rawDatabase.get('tindapos:orders')).toBeUndefined();
    commitStorageBatch(); await flushStorage();
    expect(await rawDatabase.get('tindapos:orders')).toBe(raw);
    expect(await rawDatabase.get('tindapos:stock')).toBe(raw);
    beginStorageBatch(); await idbStorage.removeItem('tindapos:orders'); abortStorageBatch(); await flushStorage();
    expect(await rawDatabase.get('tindapos:orders')).toBe(raw);
    const write = vi.spyOn(rawDatabase, 'batch').mockRejectedValueOnce(new Error('Full'));
    beginStorageBatch(); await idbStorage.removeItem('tindapos:orders'); await idbStorage.removeItem('tindapos:stock'); commitStorageBatch(); await flushStorage();
    expect(await rawDatabase.get('tindapos:orders')).toBe(raw); expect(await rawDatabase.get('tindapos:stock')).toBe(raw);
    expect(storageEvents.get().some(p => p.kind === 'write')).toBe(true); write.mockRestore();
  });
  it('roundtrips and removes IndexedDB state', async () => {
    const value = JSON.stringify({ state: { orders: [1] }, version: 1 });
    await idbStorage.setItem('tindapos:orders', value);
    expect(await idbStorage.getItem('tindapos:orders')).toBe(value);
    await idbStorage.removeItem('tindapos:orders');
    expect(await idbStorage.getItem('tindapos:orders')).toBeNull();
  });
  it('quarantines corrupted JSON while retaining the original', async () => {
    await rawDatabase.set('tindapos:orders', '{broken');
    expect(await idbStorage.getItem('tindapos:orders')).toBeNull();
    expect(await rawDatabase.get('tindapos:orders')).toBe('{broken');
    expect((await rawDatabase.entries()).some(([key, value]) => key.startsWith('tindapos-quarantine:') && value === '{broken')).toBe(true);
    expect(storageEvents.get()).toContainEqual(expect.objectContaining({ kind: 'corrupt', key: 'tindapos:orders' }));
  });
  it('catches quota failures and emits a persistent problem without rejecting writes', async () => {
    vi.spyOn(rawDatabase, 'set').mockRejectedValueOnce(new DOMException('Full', 'QuotaExceededError'));
    await expect(idbStorage.setItem('tindapos:orders', '{}')).resolves.toBeUndefined();
    expect(storageEvents.get()[0].kind).toBe('write');
    const spy = vi.spyOn(localStorage, 'setItem').mockImplementationOnce(() => { throw new Error('Full'); });
    expect(() => safeLocalStorage.setItem('tindapos:auth', '{}')).not.toThrow();
    spy.mockRestore();
  });
  it('quarantines local JSON and roundtrips small state', () => {
    const value = '{"state":{"currentUserId":"test"},"version":1}';
    safeLocalStorage.setItem('tindapos:auth', value);
    expect(safeLocalStorage.getItem('tindapos:auth')).toBe(value);
    safeLocalStorage.removeItem('tindapos:auth');
    expect(safeLocalStorage.getItem('tindapos:auth')).toBeNull();
    localStorage.setItem('tindapos:auth', 'oops');
    expect(safeLocalStorage.getItem('tindapos:auth')).toBeNull();
    expect(storageEvents.get()[0].kind).toBe('corrupt');
  });
});
