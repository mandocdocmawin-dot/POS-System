import {useBranchesStore} from '../store/useBranchesStore';
import {useBranchStore} from '../store/useBranchStore';
import {useThemeStore} from '../store/useThemeStore';
import {useAccountStore} from '../store/useAccountStore';
import {useProductStore} from '../store/useProductStore';
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
 batch:(save:()=>void)=>localTransaction(save),
 accounts: () => {requirePermission('settings:view');return structuredClone(useAccountStore.getState().accounts);},
 get: (): Settings => structuredClone(useSettingsStore.getState().settings),
 metadata: () => { const { updatedAt, updatedBy } = useSettingsStore.getState(); return { updatedAt, updatedBy }; },
 preview: <K extends SettingsSection>(section: K, value: Settings[K]) => settingsDiff(settingsService.get()[section], value),
 save: <K extends SettingsSection>(section: K, value: Settings[K]) => {
  requirePermission('settings:manage');
  const before = settingsService.get();
  const next = settingsSchema.parse({ ...before, [section]: value });
  if(section==='pos'){const tiers=next.pos.loyalty.tiers;if(new Set(tiers.map(t=>t.name)).size!==tiers.length||!tiers.some(t=>t.name==='Regular'&&t.minPoints===0))throw new Error('Loyalty tiers must be unique and include Regular at zero points.');}
  if(section==='payment'){for(const m of next.payment.methods.filter(m=>m.enabled&&m.id!=='wallet'))if(!useAccountStore.getState().accounts.some(a=>a.id===m.accountId&&a.status==='active'))throw new Error('Enabled methods must use an active account.');}
  if(section==='tax'&&(new Set(next.tax.rates.map(r=>r.id)).size!==next.tax.rates.length||next.tax.rates.some(r=>r.taxClass!=='vatable'&&r.rate!==0)))throw new Error('Tax rate IDs must be unique; exempt and zero-rated rates must be zero.');
  if(section==='currency'&&new Set([next.currency.base.code,...next.currency.others.map(c=>c.code)]).size!==next.currency.others.length+1)throw new Error('Currency codes must be unique.');
  if (section === 'invoice') {
   const highest = Math.max(0, ...useOrderStore.getState().orders.map(o => Number(o.orderNo.match(/(\d+)$/)?.[1]) || 0));
   if (next.invoice.nextNumber < Math.max(before.invoice.nextNumber, highest + 1)) throw new Error('Next invoice number can only be raised and must exceed existing numbers.');
  }
  if (section === 'tax') {
   if (useProductStore.getState().products.some(p=>p.taxRateId && !next.tax.rates.some(r=>r.id===p.taxRateId))) throw new Error('Tax rates in use must be deactivated instead of deleted.');
   for (const rate of before.tax.rates.filter(r => r.isSystem)) {
    const replacement = next.tax.rates.find(r => r.id === rate.id);
    if (!replacement || replacement.rate !== rate.rate || replacement.taxClass !== rate.taxClass || !replacement.isSystem) throw new Error('System tax rates cannot be removed or changed.');
   }
  }
  const diff = settingsDiff(before[section], next[section]);
  if (!diff.length) return next;
  return localTransaction(() => {
   useSettingsStore.setState({ settings: next, updatedAt: new Date().toISOString(), updatedBy: authService.getCurrentUser()?.name ?? 'System' });
   if(section==='general'){const choice=next.general.defaultTheme;useThemeStore.setState({theme:choice==='system'?(window.matchMedia?.('(prefers-color-scheme: dark)').matches?'dark':'light'):choice});}
   activityService.log('settings', section, 'update', diff.join('\n'));
   return next;
  });
 },
 defaults: <K extends SettingsSection>(section: K): Settings[K] => structuredClone(defaultSettings[section]),
 snapshot: () => { const s = settingsService.get(),branch=useBranchesStore.getState().branches.find(b=>b.id===useBranchStore.getState().activeBranchId);s.invoice={...s.invoice,receiptHeader:branch?.receiptHeader||s.invoice.receiptHeader,receiptFooter:branch?.receiptFooter||s.invoice.receiptFooter};return { taxMode:s.tax.mode, taxRegistered:s.tax.vatRegistered, receiptSnapshot:{ general:s.general, invoice:s.invoice, tax:s.tax, currency:s.currency }, staffDefaults: s.staffDefaults }; },
};
