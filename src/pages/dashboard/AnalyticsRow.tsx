import { ArrowDownLeft, Shirt, Footprints } from "lucide-react";
import { CardHeading } from "../../components/common/CardHeading";
import { DashboardChart } from "./DashboardChart";
import { dashboardService } from "../../services/dashboardService";
import {formatPHP} from "../../utils/money";
export function AnalyticsRow() {
  const categories = dashboardService.getCategories();
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-12">
      <section className="card md:col-span-2 xl:col-span-5">
        <CardHeading title="Order Analytics">
          
        </CardHeading>
        <DashboardChart kind="orders"/>
      </section>
      <section className="card xl:col-span-4">
        <CardHeading title="Recent Transactions" />
        <ul className="mt-5 space-y-5">
          {dashboardService.getTransactions().map((t) => (
            <li key={t.id} className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10">
                <ArrowDownLeft size={16} />
              </span>
              <div className="flex-1">
                <p className="text-xs font-medium text-slate-800 dark:text-slate-100">
                  {t.id}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {t.method} <span className="px-1">·</span> {t.time}
                </p>
              </div>
              <span className="text-xs font-semibold">
                {formatPHP(t.amount)}
              </span>
            </li>
          ))}
        </ul>
      </section>
      <section className="card xl:col-span-3">
        <CardHeading title="Top Categories" />
        <div className="mt-4">
          <h3 className="text-3xl font-semibold tracking-tight">
            {categories.total}
          </h3>
          <p className="mt-1 text-xs text-slate-400">Total products sold</p>
        </div>
        <div className="mt-4 flex h-2 gap-1 overflow-hidden rounded-full">
          {categories.segments.map((s) => (
            <div
              key={s.name}
              style={{ width: `${s.percent}%` }}
              className={s.color}
            />
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          {categories.segments.map((s) => (
            <span key={s.name} className="text-xs text-slate-400">
              <i
                className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${s.color}`}
              />
              {s.name} {s.percent}%
            </span>
          ))}
        </div>
        <div className="mt-5 space-y-4">
          {categories.rows.map((r, i) => (
            <div className="flex items-center gap-2" key={r.name}>
              <span className="rounded-lg bg-indigo-50 p-2 text-indigo-500 dark:bg-indigo-500/10">
                {i === 0 ? <Shirt size={16} /> : <Footprints size={16} />}
              </span>
              <div className="flex-1">
                <p className="text-xs font-medium">{r.name}</p>
                <p className="mt-0.5 text-xs text-slate-400">{r.subtitle}</p>
              </div>
              <span className="text-xs font-semibold">{r.value}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

