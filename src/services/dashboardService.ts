import { dashboardData } from '../data/dashboard'
// Synchronous, local-only service boundary; persistence can be introduced here later.
export const dashboardService = { getStats: () => dashboardData.stats, getSummary: () => dashboardData.summary, getStaff: () => dashboardData.staff, getGrossProfit: () => dashboardData.gross, getLowStock: () => dashboardData.lowStock, getTopProducts: () => dashboardData.topProducts }
