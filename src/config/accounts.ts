import type { PaymentMethod } from '../types/pos';
export const paymentAccounts: Partial<Record<PaymentMethod, string>> = { cash:'account-cash', gcash:'account-gcash', maya:'account-maya', card:'account-bank', bank:'account-bank' };
export const financeConfig = { maxFutureDays: 1, slowMoverDays: 30, defaultBranch: 'Main Branch', payrollAccountId: 'account-bank' } as const;
