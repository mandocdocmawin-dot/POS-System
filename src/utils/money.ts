import { settingsService } from '../services/settingsService';
import { formatMoney as pureFormatMoney } from './formatters';
import { toCentavos } from './pos';
export const formatMoney = (centavos: number) => pureFormatMoney(centavos, settingsService.get().currency.base);
export const formatPHP = (amount: number) => formatMoney(amount < 0 ? -toCentavos(-amount) : toCentavos(amount));
export const payrollMoney = formatMoney;
