import { z } from 'zod';
import { rawDatabase } from './storage/database';
import { localKeys, validEnvelope } from './storage';
import { reportStorageError } from './storage/events';
import { takeSnapshot } from './snapshots';
import { persistedStores } from './hydration/registry';
import { version } from '../../package.json';

export interface Migration { storeKey: string; fromVersion: number; toVersion: number; migrate: (state: unknown) => unknown | Promise<unknown> }
const envelopeSchema = z.object({ state: z.unknown(), version: z.number().int().nonnegative().default(0) });
export async function runMigrations(registry: Migration[], snapshot = takeSnapshot): Promise<void> {
  const changes: [string, string][] = [];
  for (const storeKey of [...new Set(registry.map(item => item.storeKey))]) {
    const raw = await rawDatabase.get(storeKey);
    if (raw === undefined) continue;
    if (typeof raw !== 'string' || !validEnvelope(raw)) {
      await rawDatabase.set(`tindapos-quarantine:${storeKey}:${Date.now()}`, raw);
      reportStorageError(storeKey, 'corrupt', 'Migration stopped because saved state is corrupted.');
      throw new Error(`Corrupted state: ${storeKey}`);
    }
    let value = envelopeSchema.parse(JSON.parse(raw));
    const steps = registry.filter(item => item.storeKey === storeKey).sort((a, b) => a.fromVersion - b.fromVersion);
    if (steps.some(step => step.toVersion <= step.fromVersion)) throw new Error('Migration versions must increase.');
    for (const step of steps) {
      if (value.version !== step.fromVersion) continue;
      value = { version: step.toVersion, state: await step.migrate(value.state) };
    }
    const next = JSON.stringify(value);
    if (next !== raw && JSON.parse(raw).version !== value.version) changes.push([storeKey, next]);
  }
  if (!changes.length) return;
  // Pure migration functions above only compute; snapshot precedes every write.
  await snapshot('Before schema migration');
  await rawDatabase.setMany(changes);
}
export async function runCentralMigrations() {
  try {
    const registry: Migration[] = [];
    for (const store of persistedStores) {
      if (localKeys.has(store.key)) continue;
      const options = store.persist.getOptions(), raw = await rawDatabase.get(store.key);
      if (typeof raw !== 'string' || !validEnvelope(raw)) continue;
      const stored = envelopeSchema.parse(JSON.parse(raw));
      const version = options.version ?? 0;
      if (stored.version > version) throw new Error(`${store.key} was saved by a newer app version.`);
      if (stored.version < version && options.migrate) {
        const migrate = options.migrate;
        registry.push({ storeKey: store.key, fromVersion: stored.version, toVersion: version, migrate: state => migrate(state, stored.version) });
      }
    }
    await runMigrations(registry);
    const old = localStorage.getItem('tindapos:meta');
    const meta = old ? z.object({ state: z.object({ installedAt: z.string(), lastBackupAt: z.string().optional() }).passthrough() }).parse(JSON.parse(old)).state : { installedAt: new Date().toISOString() };
    localStorage.setItem('tindapos:meta', JSON.stringify({ state: { ...meta, schemaVersion: 8, appVersion: version, lastMigrationAt: registry.length ? new Date().toISOString() : meta.lastMigrationAt }, version: 1 }));
  } catch (error) { reportStorageError('tindapos:meta', 'migration', error); throw error; }
}
