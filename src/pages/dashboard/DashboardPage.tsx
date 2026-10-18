import {BranchFilter} from '../../components/reports/BranchFilter';
import {SalesByBranch} from '../../components/reports/SalesByBranch';
import {usePermission} from '../../hooks/usePermission';
import {useLocalData} from '../../services/useLocalData';
import { findRoute } from "../../config/menu";
import { dashboardService } from "../../services/dashboardService";
import { RecentOrders } from "./RecentOrders";
import { AnalyticsRow } from "./AnalyticsRow";
import { CustomersRow } from "./CustomersRow";
import { ProductsRow } from "./ProductsRow";
import { PerformanceRow } from "./PerformanceRow";
import { Store } from "lucide-react";
import { PageHeader } from "../../components/layout/PageHeader";
import {reportService} from "../../services/reportService";
import { SummaryRow } from "./SummaryRow";
export function Component() {
  useLocalData();const {can}=usePermission();
  const branch = reportService.activeBranch();
  const route = findRoute("/");
  const overview = dashboardService.getOverview();
  return (
    <>
      <PageHeader title={route?.title ?? "Dashboard"} breadcrumb={route?.breadcrumb ?? []} />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Good morning, {overview.ownerName} <span className="ml-1">☀️</span>
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Here's what's happening with your store today.
          </p>
        </div>
        <span className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-900">
          <Store size={14} className="text-indigo-500" />
          <BranchFilter value={branch} onChange={reportService.setDashboardBranch}/>
          <span className="ml-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Store open
        </span>
      </div>
      <div className="space-y-5">
        <SummaryRow />
        {branch==='all'&&<SalesByBranch filter={{...reportService.range('30d'),branchId:'all',compare:false}}/>}
        <PerformanceRow />
        {(can("reports:view")||can("inventory:view"))&&<ProductsRow />}
        {can("reports:view")&&<CustomersRow />}
        {can("reports:view")&&<AnalyticsRow />}
        <RecentOrders />
      </div>
    </>
  );
}



