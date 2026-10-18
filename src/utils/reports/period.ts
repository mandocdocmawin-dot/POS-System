import type { ReportFilter } from '../../types/accounts';
export function localDay(value: string | Date = new Date()): string {
  const d = typeof value === 'string' ? new Date(value.length === 10 ? `${value}T12:00:00` : value) : value;
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
export function shiftDay(day: string, amount: number) { const d = new Date(`${day}T12:00:00`); d.setDate(d.getDate()+amount); return localDay(d); }
export function dayNumber(day: string) { const d=new Date(`${day}T12:00:00`); return Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/86400000; }
export function inRange(date: string, range: {from?:string;to?:string}) { const d=localDay(date); return (!range.from||d>=range.from)&&(!range.to||d<=range.to); }
export const period = { previous<T extends {from:string;to:string}>(range:T):T { const length=dayNumber(range.to)-dayNumber(range.from)+1; return {...range,from:shiftDay(range.from,-length),to:shiftDay(range.from,-1)}; } };
export function defaultReportFilter():ReportFilter { const to=localDay();return {from:shiftDay(to,-29),to,branchId:'all',compare:false}; }
export function presetRange(preset:string, now=new Date()) { const to=localDay(now),month=to.slice(0,7); if(preset==='today')return {from:to,to};if(preset==='month')return {from:`${month}-01`,to};if(preset==='lastMonth'){const end=shiftDay(`${month}-01`,-1);return {from:`${end.slice(0,7)}-01`,to:end};}if(preset==='year')return {from:`${to.slice(0,4)}-01-01`,to};return {from:shiftDay(to,preset==='7d'?-6:-29),to}; }
