import type { Settings } from '../types/settings';
import { defaultSettings } from '../config/defaultSettings';
export function formatMoney(centavos: number, format: Settings['currency']['base'] = defaultSettings.currency.base): string {
 if (!Number.isSafeInteger(centavos)) throw new Error('Money must be safe integer centavos.');
 const negative = centavos < 0;
 const scale = 10n ** BigInt(format.decimals);
 const minor = (BigInt(Math.abs(centavos)) * scale + 50n) / 100n;
 const whole = String(minor / scale).replace(/\B(?=(\d{3})+(?!\d))/g, format.thousandSeparator);
 const value = whole + (format.decimals ? format.decimalSeparator + String(minor % scale).padStart(format.decimals, '0') : '');
 return `${negative ? '-' : ''}${format.position === 'before' ? format.symbol : ''}${value}${format.position === 'after' ? ` ${format.symbol}` : ''}`;
}
export function formatDate(value: string | Date, format: Settings['general']['dateFormat'] = defaultSettings.general.dateFormat): string {
 const date = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00`) : new Date(value);
 if (!Number.isFinite(date.getTime())) return '—';
 const y = String(date.getFullYear()), m = String(date.getMonth()+1).padStart(2,'0'), d = String(date.getDate()).padStart(2,'0');
 return format === 'yyyy-MM-dd' ? `${y}-${m}-${d}` : format === 'dd/MM/yyyy' ? `${d}/${m}/${y}` : new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric'}).format(date);
}
export function formatTime(value: string | Date, format: Settings['general']['timeFormat'] = defaultSettings.general.timeFormat): string {
 return new Intl.DateTimeFormat('en-US', { hour:'2-digit', minute:'2-digit', hour12:format === '12h' }).format(new Date(value));
}
