import { useSettingsStore } from '../store/useSettingsStore';
import { useOrderStore } from '../store/useOrderStore';
import { settingsSchema, type Settings, type SettingsSection } from '../types/settings';
import { defaultSettings } from '../config/defaultSettings';
import { requirePermission, authService } from './authService';
import { activityService } from './activityService';
import { localTransaction } from './localTransaction';
export function settingsDiff(before: unknown, after: unknown, path = ''): string[] {
 if (JSON.stringify(before) === JSON.stringify(after)) return [];
 if (before && after && typeof before === 'object' && typeof after === 'object' && !Array.isArray(before) && !Array.isArray(after)) {
  const a = before as Record<string, unknown>, b = after as Record<string, unknown>;
  return [...new Set([...Object.keys(a), ...Object.keys(b)])].flatMap(key => settingsDiff(a[key], b[key], path ? `${path}.${key}` : key));
 }
 const label = path.replace(/([A-Z])/g, ' $1').replaceAll('.', ' / ');
 return [`${label.charAt(0).toUpperCase()}${label.slice(1)}: ${typeof before === 'object' ? JSON.stringify(before) : String(before ?? 'none')} → ${typeof after === 'object' ? JSON.stringify(after) : String(after ?? 'none')}`];
}
export const settingsService = {
 get: (): Settings => structuredClone(useSettingsStore.getState().settings),
 metadata: () => { const { updatedAt, updatedBy } = useSettingsStore.getState(); return { updatedAt, updatedBy }; },
 preview: <K extends SettingsSection>(section: K, value: Settings[K]) => settingsDiff(settingsService.get()[section], value),
 save: <K extends SettingsSection>(section: K, value: Settings[K]) => {
  requirePermission('settings:manage');
  const before = settingsService.get();
  const next = settingsSchema.parse({ ...before, [section]: value });
  if (section === 'invoice') {
   const highest = Math.max(0, ...useOrderStore.getState().orders.map(o => Number(o.orderNo.match(/(\d+)$/)?.[1]) || 0));
   if (next.invoice.nextNumber < Math.max(before.invoice.nextNumber, highest + 1)) throw new Error('Next invoice number can only be raised and must exceed existing numbers.');
  }
  if (section === 'tax') {
   for (const rate of before.tax.rates.filter(r => r.isSystem)) {
    const replacement = next.tax.rates.find(r => r.id === rate.id);
    if (!replacement || replacement.rate !== rate.rate || replacement.taxClass !== rate.taxClass || !replacement.isSystem) throw new Error('System tax rates cannot be removed or changed.');
   }
  }
  const diff = settingsDiff(before[section], next[section]);
  if (!diff.length) return next;
  return localTransaction(() => {
   useSettingsStore.setState({ settings: next, updatedAt: new Date().toISOString(), updatedBy: authService.getCurrentUser()?.name ?? 'System' });
   activityService.log('settings', section, 'update', diff.join('\n'));
   return next;
  });
 },
 defaults: <K extends SettingsSection>(section: K): Settings[K] => structuredClone(defaultSettings[section]),
 snapshot: () => { const s = settingsService.get(); return { taxMode:s.tax.mode, taxRegistered:s.tax.vatRegistered, receiptSnapshot:{ general:s.general, invoice:s.invoice, tax:s.tax, currency:s.currency }, staffDefaults: s.staffDefaults }; },
};
