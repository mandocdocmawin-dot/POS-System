import { defaultSettings } from '../config/defaultSettings';
import type { Settings } from '../types/settings';
import { cartItemSchema, discountSchema, paymentSchema, type CartItem, type Discount, type Payment, type Totals } from '../types/pos';

function fraction(value: number): [bigint, bigint] {
  if (!Number.isFinite(value) || value < 0) throw new Error('Enter a finite, non-negative amount.');
  const [coefficient, exponent = '0'] = String(value).toLowerCase().split('e');
  const [whole, decimals = ''] = coefficient.split('.');
  const scale = decimals.length - Number(exponent);
  return scale >= 0 ? [BigInt(whole + decimals), 10n ** BigInt(scale)] : [BigInt(whole + decimals) * 10n ** BigInt(-scale), 1n];
}
function rounded(n: bigint, d: bigint): number {
  if (d <= 0n || n < 0n) throw new Error('Invalid money ratio.');
  const result = (n * 2n + d) / (d * 2n);
  if (result > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error('Amount exceeds the supported money range.');
  return Number(result);
}
export function toCentavos(value: number): number { const [n,d] = fraction(value); return rounded(n * 100n,d); }
export function fromCentavos(value: number): number { if (!Number.isSafeInteger(value)) throw new Error('Centavos must be safe integers.'); return value / 100; }
export function multiplyCentavos(cents: number, quantity: number): number { const [n,d] = fraction(quantity); return rounded(BigInt(cents) * n,d); }
export function ratioCentavos(cents: number, numerator: number, denominator: number): number { return rounded(BigInt(cents) * BigInt(numerator),BigInt(denominator)); }
export function sumCentavos(values: number[]): number { const sum=values.reduce((a,b)=>a+BigInt(b),0n);return rounded(sum,1n); }
function discountCents(base: number, discount?: Discount): number {
  if (!discount) return 0;
  discountSchema.parse(discount);
  if (discount.type === 'fixed') return Math.min(base,toCentavos(discount.value));
  const [n,d]=fraction(Math.min(100,discount.value));
  return Math.min(base,rounded(BigInt(base)*n,d*100n));
}
export function calculateTotals(cart: CartItem[], discount?: Discount, options: Settings['tax'] | 'inclusive' | 'exclusive' = defaultSettings.tax): Totals {
  const taxMode = typeof options === 'string' ? options : options.mode;
  const registered = typeof options === 'string' || options.vatRegistered;
  const raw = cart.map(input => {
    const item = cartItemSchema.parse(input);
    const subtotal = multiplyCentavos(toCentavos(item.unitPrice),item.quantity);
    const itemDiscount = discountCents(subtotal,item.discountType ? {type:item.discountType,value:item.discountValue ?? 0} : undefined);
    return {item,subtotal,itemDiscount,base:subtotal-itemDiscount};
  });
  const base = sumCentavos(raw.map(x=>x.base));
  const orderDiscount = discountCents(base,discount);
  // Largest remainders allocate every cent exactly, with stable line-index ties.
  const allocation = raw.map((x,index) => {
    const numerator=BigInt(orderDiscount)*BigInt(x.base);
    return {index,cents:base ? Number(numerator/BigInt(base)) : 0,remainder:base ? numerator%BigInt(base) : 0n};
  });
  const ranked=[...allocation].sort((a,b)=>a.remainder===b.remainder ? a.index-b.index : a.remainder>b.remainder ? -1:1);
  const leftover=orderDiscount-sumCentavos(allocation.map(x=>x.cents));
  for(let i=0;i<leftover;i++) ranked[i].cents++;
  const items=raw.map((x,i)=>{
    const distributed=allocation[i].cents;
    const discounted=x.base-distributed;
    const [rate,scale]=fraction(registered?x.item.taxRate:0);
    const tax=rounded(BigInt(discounted)*rate,taxMode==='inclusive'?100n*scale+rate:100n*scale);
    return {...x.item,lineSubtotal:fromCentavos(x.subtotal),lineDiscount:fromCentavos(x.itemDiscount),orderDiscountAmount:fromCentavos(distributed),lineTax:fromCentavos(tax),lineTotal:fromCentavos(discounted+(taxMode==='exclusive' ? tax : 0))};
  });
  return {items,subtotal:fromCentavos(sumCentavos(raw.map(x=>x.subtotal))),itemDiscountTotal:fromCentavos(sumCentavos(raw.map(x=>x.itemDiscount))),orderDiscount:{...(discount ?? {type:'fixed',value:0}),amount:fromCentavos(orderDiscount)},taxTotal:fromCentavos(sumCentavos(items.map(x=>toCentavos(x.lineTax)))),grandTotal:fromCentavos(sumCentavos(items.map(x=>toCentavos(x.lineTotal))))};
}
export function calculatePayments(grandTotal: number, payments: Payment[]) {
  const total=toCentavos(grandTotal);let tendered=0;
  for (const input of payments) {
    const payment=paymentSchema.parse(input); const amount=toCentavos(payment.amount);
    if (payment.method!=='cash' && amount>Math.max(0,total-tendered)) throw new Error('Non-cash payment cannot exceed the remaining balance.');
    tendered=sumCentavos([tendered,amount]);
  }
  const paid=Math.min(total,tendered),balance=total-paid;
  return {amountPaid:fromCentavos(paid),balanceDue:fromCentavos(balance),change:fromCentavos(Math.max(0,tendered-total)),paymentStatus:balance===0 ? 'paid' as const : paid>0 ? 'partial' as const : 'unpaid' as const};
}
