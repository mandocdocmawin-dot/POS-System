import { rawDatabase } from './database';
import { validEnvelope } from './index';
import { reportStorageError } from './events';

export function equalJSON(a: string, b: string): boolean {
  const canonical = (value: unknown): string => {
    if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
    if (value !== null && typeof value === 'object') return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, entry]) => `${JSON.stringify(key)}:${canonical(entry)}`).join(',')}}`;
    return JSON.stringify(value);
  };
  try { return canonical(JSON.parse(a)) === canonical(JSON.parse(b)); } catch { return false; }
}
export async function migrateLegacyKey(key: string): Promise<boolean> {
  const value = localStorage.getItem(key);
  if (value === null) return false;
  try {
    if (!validEnvelope(value)) {
      await rawDatabase.set(`tindapos-quarantine:${key}:${Date.now()}`, value);
      reportStorageError(key, 'corrupt', 'The legacy localStorage value is corrupted.');
      return false;
    }
    const existing = await rawDatabase.get(key);
    if (existing !== undefined && (typeof existing !== 'string' || !equalJSON(value, existing))) throw new Error('Local and IndexedDB copies differ. Export both copies before choosing which data to keep.');
    if (existing === undefined) await rawDatabase.set(key, value);
    const saved = await rawDatabase.get(key);
    if (typeof saved !== 'string' || !equalJSON(value, saved)) throw new Error('Legacy data verification failed. Original data has been retained.');
    const archive = `tindapos-legacy:${key}`;
    const old = localStorage.getItem(archive);
    if (old !== null && !equalJSON(old, value)) throw new Error('A different legacy archive already exists. Original data has been retained.');
    localStorage.setItem(archive, value);
    if (localStorage.getItem(archive) !== value) throw new Error('Legacy archive verification failed.');
    localStorage.removeItem(key);
    return true;
  } catch (error) { reportStorageError(key, 'migration', error); throw error; }
}
