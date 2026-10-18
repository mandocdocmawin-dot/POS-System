import type { OrderLine } from '../types/pos';
import type { Product } from '../types/models';
import type { Settings } from '../types/settings';
import { toCentavos, sumCentavos } from './pos';
export function productTax(product: Pick<Product,'taxRate'|'taxRateId'>, tax: Settings['tax']) {
 const rate = tax.rates.find(r => r.id === product.taxRateId);
 return { rate:tax.vatRegistered ? rate?.rate ?? product.taxRate : 0, taxClass:rate?.taxClass ?? (product.taxRate ? 'vatable' : 'exempt') as 'vatable'|'exempt'|'zero_rated' };
}
export function taxBreakdown(items: OrderLine[], registered = true) {
 let vatableSales=0, exemptSales=0, zeroRatedSales=0, vatAmount=0;
 for (const line of items) {
  const tax = registered ? toCentavos(line.lineTax) : 0;
  const net = toCentavos(line.lineTotal)-tax;
  if (!registered || line.taxClass === 'exempt' || (!line.taxClass && !line.taxRate)) exemptSales += net;
  else if (line.taxClass === 'zero_rated') zeroRatedSales += net;
  else vatableSales += net;
  vatAmount += tax;
 }
 return { vatableSales, exemptSales, zeroRatedSales, vatAmount, total:sumCentavos([vatableSales,exemptSales,zeroRatedSales,vatAmount]) };
}
