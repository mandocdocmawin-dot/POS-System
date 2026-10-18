import {usePermission} from '../../hooks/usePermission';
import { StaffPerformanceCard } from "../../components/staff/StaffPerformanceCard";
import { CardHeading } from "../../components/common/CardHeading";
import { DashboardChart } from "./DashboardChart";
import { dashboardService } from "../../services/dashboardService";
export function PerformanceRow() {
  const {can}=usePermission();const overview = dashboardService.getOverview();
  const gross = dashboardService.getGrossProfit();
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-12">
      <section className="card md:col-span-2 xl:col-span-6">
        <CardHeading
          title="Sales Trend"
          subtitle="Track your store's sales performance"
        >
          
        </CardHeading>
        <div className="mt-5 flex items-center justify-between">
          <p className="text-xs font-semibold text-emerald-500">
            ↗ {overview.salesGrowth}{" "}
            <span className="font-normal text-slate-400">sales growth</span>
          </p>
          <div className="flex gap-4 text-xs text-slate-400">
            <span>
              <i className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-indigo-500" />
              Total Sales
            </span>
            <span>
              <i className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-teal-400" />
              Total Orders
            </span>
          </div>
        </div>
        <DashboardChart kind="sales"/>
      </section>
      {can("staff:view")&&<StaffPerformanceCard />}
      {can("reports:finance")&&<section className="card xl:col-span-3">
        <CardHeading title="Gross Profit" />
        <div className="mb-5 mt-3 flex items-center gap-2">
          <h3 className="text-2xl font-semibold tracking-tight">
            {gross.value}
          </h3>
          <span className="text-xs text-emerald-500">↗ {overview.grossProfitTrend}</span>
        </div>
        <div className="space-y-2.5">
          {gross.bars.map((bar, i) => (
            <div key={bar.label} className="relative overflow-hidden rounded">
              <div
                style={{ width: `${bar.percent}%` }}
                className={`absolute inset-y-0 left-0 rounded ${i % 2 === 0 ? "bg-indigo-50 dark:bg-indigo-500/10" : "bg-teal-50 dark:bg-teal-500/10"}`}
              />
              <div className="relative flex justify-between px-2 py-1 text-xs">
                <span>{bar.label}</span>
                <span className="font-medium">{bar.value}</span>
              </div>
            </div>
          ))}
        </div>
      </section>}
    </div>
  );
}



