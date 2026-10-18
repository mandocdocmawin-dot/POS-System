import { z } from 'zod';
import type { Order, Customer, PaymentMethod } from './pos';
import type { Refund, CustomerPayment, WalletTransaction, SupplierPayment, Purchase, PurchaseReturn, Supplier } from './phase4';
import type { PayrollRun, Staff } from './staff';
import type { Product, Category, StockMovement } from './models';
const id = z.string().min(1);
const cents = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
export const bankAccountSchema = z.object({ id, name: id, type: z.enum(['cash','bank','ewallet']), accountNo: z.string().optional(), bankName: z.string().optional(), openingBalance: cents, openingDate: z.iso.date(), status: z.enum(['active','inactive']), createdAt: z.iso.datetime() });
export const financeCategorySchema = z.object({ id, name: id, type: z.enum(['income','expense']), isSystem: z.boolean(), status: z.enum(['active','inactive']) });
export const manualEntrySchema = z.object({ id, type: z.enum(['income','expense']), date: z.iso.date(), categoryId: id, amount: cents.positive(), accountId: id, branchId: id, payee: z.string().optional(), reference: z.string().optional(), note: z.string().optional(), attachmentId: z.string().optional(), createdBy: id, createdAt: z.iso.datetime(), updatedAt: z.iso.datetime() });
export const transferSchema = z.object({ id, transferNo: z.string().regex(/^TF-\d{6,}$/), date: z.iso.date(), fromAccountId: id, toAccountId: id, amount: cents.positive(), reference: z.string().optional(), note: z.string().optional(), createdBy: id, createdAt: z.iso.datetime() });
export const accountStateSchema = z.object({ accounts: z.array(bankAccountSchema), categories: z.array(financeCategorySchema), manualEntries: z.array(manualEntrySchema), transfers: z.array(transferSchema), counter: z.number().int().nonnegative(), demoHistoryGenerated: z.boolean().default(false) });
export type BankAccount = z.infer<typeof bankAccountSchema>;
export type FinanceCategory = z.infer<typeof financeCategorySchema>;
export type ManualEntry = z.infer<typeof manualEntrySchema>;
export type Transfer = z.infer<typeof transferSchema>;
export type AccountState = z.infer<typeof accountStateSchema>;
export interface LedgerEntry { method?:PaymentMethod; id: string; date: string; type: 'income'|'expense'|'transfer_in'|'transfer_out'; category: string; amount: number; accountId: string; branchId?: string; sourceType: 'order'|'collection'|'refund'|'wallet'|'supplier_payment'|'payroll'|'manual'|'transfer'; sourceId?: string; reference?: string; note?: string; payee?: string; createdBy?: string; attachmentId?: string; isLiability?: boolean; isAuto: boolean }
export interface ReportFilter { from: string; to: string; branchId: string; compare: boolean }
export interface LedgerFilter { from?: string; to?: string; branchId?: string; accountId?: string; category?: string; type?: LedgerEntry['type']; source?: 'auto'|'manual'; search?: string }
export interface FinanceData { orders: Order[]; collections: CustomerPayment[]; refunds: Refund[]; wallet: WalletTransaction[]; supplierPayments: SupplierPayment[]; purchases: Purchase[]; purchaseReturns: PurchaseReturn[]; suppliers: Supplier[]; payroll: PayrollRun[]; staff: Staff[]; products: Product[]; productCategories: Category[]; movements: StockMovement[]; customers: Customer[]; accounts: BankAccount[]; categories: FinanceCategory[]; manualEntries: ManualEntry[]; transfers: Transfer[] }

