import { orderService } from "./orderService";
import { dashboardData } from "../data/dashboard";
// Synchronous, local-only service boundary; persistence can be introduced here later.
export const dashboardService = {
  getOverview: () => ({ ...dashboardData.overview }),
  getStats: () => dashboardData.stats,
  getSummary: () => dashboardData.summary,
  getStaff: () => dashboardData.staff,
  getGrossProfit: () => dashboardData.gross,
  getLowStock: () => dashboardData.lowStock,
  getTopProducts: () => dashboardData.topProducts,
  getCustomers: () => dashboardData.customers,
  getPayments: () => dashboardData.payments,
  getTransactions: () => dashboardData.transactions,
  getCategories: () => dashboardData.categories,
  getRecentOrders: () => orderService.getOrders(),
};
