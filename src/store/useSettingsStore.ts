import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { defaultSettings, SETTINGS_VERSION } from '../config/defaultSettings';
import { settingsSchema, type Settings } from '../types/settings';
function record(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value); }
export function mergeSettings(defaults: unknown, overrides: unknown): unknown {
 if (!record(defaults) || !record(overrides)) return overrides === undefined ? structuredClone(defaults) : overrides;
 return Object.fromEntries(Object.entries(defaults).map(([key, value]) => [key, mergeSettings(value, overrides[key])]));
}
export function migrateSettings(value: unknown, fromVersion = 0): Settings {
 if (fromVersion > SETTINGS_VERSION) throw new Error('Settings were saved by a newer version.');
 const merged = mergeSettings(defaultSettings, value);
 const parsed = settingsSchema.parse({ ...(record(merged) ? merged : {}), version: SETTINGS_VERSION });
 return parsed;
}
export interface SettingsState { settings: Settings; updatedAt?: string; updatedBy?: string }
export const useSettingsStore = create<SettingsState>()(persist(() => ({ settings: structuredClone(defaultSettings) }), {
 name: 'tindapos:settings', version: SETTINGS_VERSION,
 migrate: (value: unknown, version) => {
  const stored = record(value) ? value : {};
  return { settings: migrateSettings(stored.settings, version), updatedAt: typeof stored.updatedAt === 'string' ? stored.updatedAt : undefined, updatedBy: typeof stored.updatedBy === 'string' ? stored.updatedBy : undefined };
 },
 merge: (persisted: unknown, current) => {
  const stored = record(persisted) ? persisted : {};
  try { return { ...current, settings: migrateSettings(stored.settings), updatedAt: typeof stored.updatedAt === 'string' ? stored.updatedAt : undefined, updatedBy: typeof stored.updatedBy === 'string' ? stored.updatedBy : undefined }; }
  catch { return current; }
 },
}));
