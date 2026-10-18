import type { FinanceData, ReportFilter } from '../../types/accounts';
import { createPosSeed } from '../../data/seed/pos';
import { products } from '../../data/seed/products';
import { categories } from '../../data/seed/categories';
import { localDay } from './period';
export function financeFixture():FinanceData { const seed=createPosSeed();const order=seed.orders[0];order.createdAt=`${localDay()}T04:00:00.000Z`;order.payments[0].createdAt=order.createdAt;return {orders:[order],customers:seed.customers,products,productCategories:categories,collections:[],refunds:[],wallet:[],supplierPayments:[],purchases:[],purchaseReturns:[],suppliers:[],payroll:[],staff:[],movements:[],accounts:[{id:'account-cash',name:'Cash Drawer',type:'cash',openingBalance:100000,openingDate:'2020-01-01',status:'active',createdAt:order.createdAt}],categories:[],manualEntries:[],transfers:[]}; }
export const fixtureRange=():ReportFilter=>({from:'2020-01-01',to:localDay(),branchId:'all',compare:false});
