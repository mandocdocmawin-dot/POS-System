import { ShoppingBag, ShoppingCart, Wallet, RotateCcw } from 'lucide-react'
export const dashboardData = {
 stats: [
 { title: 'Today Sales', value: '₱12,450', trend: '8.4%', up: true, icon: ShoppingBag, color: 'bg-indigo-50 text-indigo-500 dark:bg-indigo-500/15' },
 { title: 'Total Orders', value: '1,865', trend: '5.2%', up: true, icon: ShoppingCart, color: 'bg-teal-50 text-teal-600 dark:bg-teal-500/15' },
 { title: 'Net Profit', value: '₱4,320', trend: '6.8%', up: true, icon: Wallet, color: 'bg-amber-50 text-amber-500 dark:bg-amber-500/15' },
 { title: 'Sales Return', value: '₱540', trend: '2.1%', up: false, icon: RotateCcw, color: 'bg-rose-50 text-rose-500 dark:bg-rose-500/15' }
 ],
 summary: { total: '12,458', trend: '+8.2%', mini: [{ label: 'Repeat Rate', value: '67%' }, { label: 'New Today', value: '128' }, { label: 'Avg Spend', value: '₱42' }] },
 staff: { names: ['Ana Santos', 'Jose Cruz', 'Maria Reyes', 'Carlo Garcia', 'Bea Dela Cruz'], best: 'Maria Reyes', stats: [{ label: 'Best', value: '82%' }, { label: 'Orders', value: '1,248' }, { label: 'Sales', value: '₱4.8L' }] },
 gross: { value: '₱486k', bars: [{ label: 'Products', value: '₱125k', percent: 80 }, { label: 'Services', value: '₱86k', percent: 64 }, { label: 'Discounts', value: '₱24k', percent: 28 }, { label: 'Expenses', value: '₱62k', percent: 48 }, { label: 'Profits', value: '₱94k', percent: 70 }, { label: 'Sales', value: '₱195k', percent: 94 }] },
 lowStock: [{ name: 'Everyday Cotton Tee', sku: 'TP-001', percent: 24, stock: 8 }, { name: 'Classic Canvas Shoes', sku: 'TP-002', percent: 18, stock: 5 }, { name: 'Everyday Tote Bag', sku: 'TP-003', percent: 12, stock: 3 }, { name: 'Wireless Earbuds', sku: 'TP-004', percent: 30, stock: 10 }],
 topProducts: [{ name: 'Everyday Cotton Tee', sku: 'TP-001', trend: '+12.8%', sales: '1,248', up: true }, { name: 'Classic Canvas Shoes', sku: 'TP-002', trend: '+8.2%', sales: '986', up: true }, { name: 'Minimalist Watch', sku: 'TP-005', trend: '-2.4%', sales: '754', up: false }, { name: 'Everyday Tote Bag', sku: 'TP-003', trend: '+6.5%', sales: '628', up: true }],
 customers: { total: '8,426', trend: '+12.4%', names: ['Ana Santos', 'Miguel Reyes', 'Jose Cruz', 'Bea Dela Cruz'], rows: [{ label: 'New Customers', percent: 38.1, count: '3,210', color: '#6366f1' }, { label: 'Loyalty Customers', percent: 78.6, count: '6,623', color: '#14b8a6' }] },
 payments: [{ label: 'GCash', percent: 75, color: 'bg-indigo-500' }, { label: 'Cash', percent: 58, color: 'bg-teal-400' }],
 transactions: [{ id: '#INV-2026-042', method: 'GCash', time: '2 min ago', amount: 1499 }, { id: '#INV-2026-041', method: 'Cash', time: '8 min ago', amount: 850 }, { id: '#INV-2026-040', method: 'GCash', time: '12 min ago', amount: 2290 }, { id: '#INV-2026-039', method: 'Cash', time: '18 min ago', amount: 650 }],
 categories: { total: '24,680', segments: [{ name: 'Clothing', percent: 48, color: 'bg-indigo-500' }, { name: 'Footwear', percent: 32, color: 'bg-teal-400' }, { name: 'Others', percent: 20, color: 'bg-amber-400' }], rows: [{ name: 'Clothing', subtitle: '1,248 products sold', value: '₱128,450' }, { name: 'Footwear', subtitle: '986 products sold', value: '₱96,800' }] }
}
