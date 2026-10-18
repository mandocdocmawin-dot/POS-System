import 'fake-indexeddb/auto';
import { beforeEach, expect, it, vi } from 'vitest';
import { rawDatabase } from './database';
import { equalJSON, migrateLegacyKey } from './legacy';
import { storageEvents } from './events';
beforeEach(async () => {
  storageEvents.clear();
  await rawDatabase.removeMany((await rawDatabase.entries()).map(([key]) => key));
  const values = new Map<string, string>();
  vi.stubGlobal('localStorage', { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); }, removeItem: (key: string) => { values.delete(key); } });
});
const key = 'tindapos:orders', raw = '{"state":{"orders":[],"counter":42},"version":1}';
it('copies, verifies, archives and is idempotent', async () => {
  localStorage.setItem(key, raw);
  expect(await migrateLegacyKey(key)).toBe(true);
  expect(await rawDatabase.get(key)).toBe(raw);
  expect(localStorage.getItem(key)).toBeNull();
  expect(localStorage.getItem(`tindapos-legacy:${key}`)).toBe(raw);
  expect(await migrateLegacyKey(key)).toBe(false);
});
it('leaves the source untouched if verification fails', async () => {
  localStorage.setItem(key, raw);
  const read = vi.spyOn(rawDatabase, 'get').mockResolvedValueOnce(undefined).mockResolvedValueOnce('wrong');
  await expect(migrateLegacyKey(key)).rejects.toThrow('verification');
  expect(localStorage.getItem(key)).toBe(raw);
  expect(storageEvents.get()[0].kind).toBe('migration');
  read.mockRestore();
});
it('protects differing IDB state and quarantines corrupt legacy JSON', async () => {
  localStorage.setItem(key, raw);
  await rawDatabase.set(key, '{"state":{"orders":[]},"version":1}');
  await expect(migrateLegacyKey(key)).rejects.toThrow('differ');
  expect(localStorage.getItem(key)).toBe(raw);
  localStorage.setItem(key, 'oops');
  expect(await migrateLegacyKey(key)).toBe(false);
  expect((await rawDatabase.entries()).some(([name, value]) => name.startsWith('tindapos-quarantine:') && value === 'oops')).toBe(true);
});
it('compares parsed values independent of object key order', () => {
  expect(equalJSON('{"a":1,"b":[2]}', '{"b":[2],"a":1}')).toBe(true);
});
