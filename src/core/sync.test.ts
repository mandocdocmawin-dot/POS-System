import { expect, it, vi } from 'vitest';
import { receiveSync, validSyncMessage } from './sync';
it('ignores excluded tab-local state, invalid messages and unknown stores', async () => {
  const rehydrate = vi.fn(), stores = [{ key: 'tindapos:orders', persist: { rehydrate } }];
  for (const key of ['tindapos:auth', 'tindapos:active-branch', 'tindapos:pos', 'tindapos:guide', 'tindapos:meta', 'tindapos:ui']) expect(await receiveSync({ key, version: 1 }, stores)).toBe(false);
  expect(validSyncMessage({ key: 'tindapos:orders', version: NaN })).toBe(false);
  expect(await receiveSync({ key: 'tindapos:unknown', version: 1 }, stores)).toBe(false);
  expect(rehydrate).not.toHaveBeenCalled();
});
it('rehydrates changed stores and warns only about open edits', async () => {
  const rehydrate = vi.fn(), notify = vi.fn(), stores = [{ key: 'tindapos:orders', persist: { rehydrate } }];
  expect(await receiveSync({ key: 'tindapos:orders', version: 2 }, stores, () => false, notify)).toBe(true);
  expect(rehydrate).toHaveBeenCalledOnce();
  expect(notify).not.toHaveBeenCalled();
  await receiveSync({ key: 'tindapos:orders', version: 3 }, stores, () => true, notify);
  expect(notify).toHaveBeenCalledWith('This record changed in another tab');
});
