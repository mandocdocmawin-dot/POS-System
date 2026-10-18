import { authService } from './authService';
import { planService } from './planService';
import { faqService } from './faqService';
export const demoReceiptProducts = [{ id: 'rice', name: 'Jasmine Rice', price: 6800 }, { id: 'coffee', name: 'Coffee sachet', price: 1200 }];
export function demoReceipt(quantities: Record<string, number>) {
  const lines = demoReceiptProducts.map(item => ({ ...item, quantity: quantities[item.id] ?? 0, total: item.price * (quantities[item.id] ?? 0) }));
  return { lines, total: lines.reduce((sum, line) => sum + line.total, 0) };
}
export const landingService = {
  plans: () => planService.list(true),
  faqs: () => faqService.list(true).slice(0, 5),
  tryRole: (role: string) => { authService.loginDemo(role); return authService.firstPath(); },
};
