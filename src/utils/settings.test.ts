import { describe, it, expect } from 'vitest';
import { defaultSettings as defaults } from '../config/defaultSettings';
import { migrateSettings } from '../store/useSettingsStore';
import { settingsDiff } from '../services/settingsService';
import { cashRounding } from './cashRounding';
import { formatMoney, formatDate, formatTime } from './formatters';
import { documentNumber, validateNextNumber } from './numbering';
import { calculateTotals } from './pos';
import { taxBreakdown, productTax } from './tax';
import type { CartItem } from '../types/pos';
const line: CartItem = { id:'l',productId:'p',name:'Test',sku:'P',unitPrice:112,costPrice:1,quantity:1,taxRate:12,unitShortName:'pcs' };
describe('phase 7 settings foundation', () => {
 it('migrates partial nested settings, drops unknown keys and is idempotent', () => {
  const settings = migrateSettings({general:{businessName:'Shop',unknown:true},manager:{approvals:{cashierDiscountLimitPercent:5}},unknown:1},1);
  expect(settings.general.businessName).toBe('Shop');expect(settings.general.dateFormat).toBe(defaults.general.dateFormat);
  expect(settings.manager.approvals.refundApprovalAbove).toBe(50000);
  expect(settings).not.toHaveProperty('unknown');expect(settings.general).not.toHaveProperty('unknown');expect(migrateSettings(settings,7)).toEqual(settings);
  expect(() => migrateSettings({pos:{cashRounding:'bogus'}})).toThrow();expect(() => migrateSettings({},8)).toThrow();
 });
 it('generates readable nested diffs', () => { expect(settingsDiff({tax:{mode:'inclusive'}},{tax:{mode:'exclusive'}})).toEqual(['Tax / mode: inclusive → exclusive']); });
 it('injects inclusive, exclusive and non-VAT settings without changing old records', () => {
  const inclusive=calculateTotals([line],undefined,defaults.tax);const saved=structuredClone(inclusive);
  expect(inclusive.taxTotal).toBe(12);expect(inclusive.grandTotal).toBe(112);
  const exclusive=calculateTotals([{...line,unitPrice:100}],undefined,{...defaults.tax,mode:'exclusive'});expect(exclusive.taxTotal).toBe(12);expect(exclusive.grandTotal).toBe(112);
  const nonvat=calculateTotals([line],undefined,{...defaults.tax,vatRegistered:false});expect(nonvat.taxTotal).toBe(0);expect(nonvat.grandTotal).toBe(112);expect(inclusive).toEqual(saved);
 });
 it('breaks down vatable, exempt and zero-rated centavos exactly', () => {
  const totals=calculateTotals([line,{...line,id:'e',taxRate:0,taxClass:'exempt'},{...line,id:'z',taxRate:0,taxClass:'zero_rated'}]);
  expect(taxBreakdown(totals.items)).toEqual({vatableSales:10000,exemptSales:11200,zeroRatedSales:11200,vatAmount:1200,total:33600});
  expect(productTax({taxRate:12,taxRateId:'zero'},defaults.tax)).toEqual({rate:0,taxClass:'zero_rated'});
 });
 it.each([['none',11203,0],['0.05',11203,2],['0.25',11212,-12],['1.00',11251,49]] as const)('rounds %s only for entirely cash payments', (step,total,adjustment) => {
  expect(cashRounding(total,['cash'],step)).toEqual({total:total+adjustment,adjustment});
  expect(cashRounding(total,['cash','card'],step).adjustment).toBe(0);expect(cashRounding(total,[],step).adjustment).toBe(0);
 });
 it('formats money in all decimal precisions and separators', () => {
  expect(formatMoney(123456)).toBe('₱1,234.56');expect(formatMoney(-123)).toBe('-₱1.23');
  expect(formatMoney(123456,{...defaults.currency.base,symbol:'€',decimals:3,position:'after',thousandSeparator:'.',decimalSeparator:','})).toBe('1.234,560 €');
  expect(formatMoney(123456,{...defaults.currency.base,decimals:0})).toBe('₱1,235');expect(formatMoney(123456,{...defaults.currency.base,decimals:1})).toBe('₱1,234.6');
 });
 it('formats dates and times', () => {
  expect(formatDate('2026-10-18','dd/MM/yyyy')).toBe('18/10/2026');expect(formatDate('2026-10-18','yyyy-MM-dd')).toBe('2026-10-18');expect(formatDate('2026-10-18')).toBe('Oct 18, 2026');
  const date=new Date(2026,9,18,13,5);expect(formatTime(date,'24h')).toBe('13:05');expect(formatTime(date,'12h')).toBe('01:05 PM');
 });
 it('numbers with padding, branch codes and monotonic next counters', () => {
  expect(documentNumber(2)).toBe('TP-000002');expect(documentNumber(2,{...defaults.invoice,padding:3,includeBranchCode:true},'MAIN')).toBe('TP-MAIN-002');
  expect(()=>validateNextNumber(2,2,1)).toThrow();expect(()=>validateNextNumber(5,2,6)).toThrow();expect(validateNextNumber(6,2,6)).toBe(6);
 });
});
