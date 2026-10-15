import { productService } from "./productService";
import { stockService } from "./stockService";
import { orderService } from "./orderService";
import { dashboardData } from "../data/dashboard";
// Synchronous, local-only service boundary; persistence can be introduced here later.
export const dashboardService = {
  getOverview: () => ({ ...dashboardData.overview }),
  getStats: () => dashboardData.stats,
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
  getPayments: () => dashboardData.payments,
  getTransactions: () => dashboardData.transactions,
  getCategories: () => dashboardData.categories,
  getRecentOrders: () => orderService.getOrders(),
};
