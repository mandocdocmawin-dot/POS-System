import type { Settings } from '../types/settings';
export function cashRounding(total: number, methods: string[], step: Settings['pos']['cashRounding']): { total: number; adjustment: number } {
 if (!Number.isSafeInteger(total) || total < 0) throw new Error('Total must be integer centavos.');
 const increment = {none:1,'0.05':5,'0.25':25,'1.00':100}[step];
 const rounded = methods.length && methods.every(m => m === 'cash') ? Math.floor((total+Math.floor(increment/2))/increment)*increment : total;
 return { total:rounded, adjustment:rounded-total };
}
