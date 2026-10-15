import { Users, ArrowUpRight } from "lucide-react";
import { StatCard } from "../../components/common/StatCard";
import { dashboardService } from "../../services/dashboardService";
export function SummaryRow() {
  const summary = dashboardService.getSummary();
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4 xl:col-span-9">
        {dashboardService.getStats().map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>
      <section className="card relative overflow-hidden xl:col-span-3">
        <div className="absolute -right-5 -top-6 h-28 w-28 rounded-full bg-indigo-50 dark:bg-indigo-500/10" />
        <div className="relative flex justify-between">
          <p className="text-xs text-slate-500">Total Active Customers</p>
          <Users size={18} className="text-indigo-500" />
        </div>
        <div className="relative mt-2 flex items-center gap-3">
          <h2 className="text-3xl font-semibold tracking-tight">
            {summary.total}
          </h2>
          <span className="flex items-center text-xs font-medium text-emerald-500">
            <ArrowUpRight size={12} />
            {summary.trend}
          </span>
        </div>
        <div className="mt-5 grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800">
          {summary.mini.map((item) => (
            <div key={item.label} className="text-center first:text-left">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {item.value}
              </p>
              <p className="mt-1 text-xs text-slate-400">{item.label}</p>
            </div>
          ))}
        </div>
        <div
          aria-label="Summary slide 1 of 3"
          className="mt-4 flex justify-center gap-1"
        >
          <span className="h-1 w-3 rounded-full bg-indigo-500" />
          <span className="h-1 w-1 rounded-full bg-slate-200" />
          <span className="h-1 w-1 rounded-full bg-slate-200" />
        </div>
      </section>
    </div>
  );
}
