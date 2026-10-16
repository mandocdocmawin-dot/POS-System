import {salesMetrics,paymentShares,recordedPayments} from './salesMetrics';
import {fromCentavos} from '../utils/pos';
import {formatPHP} from '../utils/money';
import {PAYMENT_METHODS} from '../config/pos';
import { productService } from "./productService";
import { stockService } from "./stockService";
import { orderService } from "./orderService";
import { dashboardData } from "../data/dashboard";
// Real sales and payments are branch-filtered. Other analytics retain demo data.
export const dashboardService = {
  getOverview: () => ({ ...dashboardData.overview }),
  getStats: () => {const m=salesMetrics();const values=[formatPHP(m.todaySales),String(m.totalOrders),formatPHP(m.netProfit),formatPHP(m.salesReturn)];return dashboardData.stats.map((s,i)=>({...s,value:values[i],trend:'',caption:i===1?'All orders · current branch':'Today · current branch'}));},
  getSummary: () => dashboardData.summary,
  getStaff: () => dashboardData.staff,
  getGrossProfit: () => dashboardData.gross,
  getLowStock: () =>
    productService
      .list()
      .filter((p) => p.status === "active")
      .map((p) => ({
        ...p,
        stock: stockService.getStock(p.id),
        percent:
          p.reorderLevel > 0
            ? Math.min(
                100,
                Math.round(
                  (stockService.getStock(p.id) / p.reorderLevel) * 100,
                ),
              )
            : 0,
      }))
      .filter((p) => p.stock <= p.reorderLevel)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 5),
  getTopProducts: () => {
    const products = productService.list().filter((p) => p.status === "active");
    return dashboardData.topProducts.flatMap((mock, i) => {
      const p = products.find((p) => p.sku === mock.sku) ?? products[i];
      return p
        ? [{ ...mock, id: p.id, name: p.name, sku: p.sku, imageId: p.imageId }]
        : [];
    });
  },
  getCustomers: () => dashboardData.customers,
  getPayments: () => paymentShares(),
  getTransactions: () => recordedPayments().slice(0,5).map(p=>({...p,id:p.orderNo+' · '+p.id.slice(0,6),method:PAYMENT_METHODS.find(m=>m.id===p.method)?.label??p.method,amount:fromCentavos(p.cents)})),
  getCategories: () => dashboardData.categories,
  getRecentOrders: () => orderService.list(),
};
