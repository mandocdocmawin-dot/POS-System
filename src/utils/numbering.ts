import type { Settings } from '../types/settings';
import { defaultSettings } from '../config/defaultSettings';
export function documentNumber(counter: number, config = defaultSettings.invoice, branchCode?: string, prefix = config.prefix): string {
 if (!Number.isSafeInteger(counter) || counter < 1) throw new Error('Invalid document counter.');
 return [prefix, ...(config.includeBranchCode && branchCode ? [branchCode] : []), String(counter).padStart(config.padding,'0')].join('-');
}
export function nextDocumentNumber(highest: number, settings: Settings['invoice']) { return Math.max(highest+1, settings.nextNumber); }
export function validateNextNumber(next: number, highest: number, previous: number) {
 if (!Number.isSafeInteger(next) || next < Math.max(highest+1,previous)) throw new Error('Next number must exceed used numbers and cannot be lowered.');
 return next;
}
