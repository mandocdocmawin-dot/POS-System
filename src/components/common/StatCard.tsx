import { T } from "../../i18n/T";
import type { LucideIcon } from "lucide-react";
export interface Stat {
  title: string;
  value: string;
  trend: string;
  caption?: string;
  up: boolean;
  icon: LucideIcon;
  color: string;
}
export function StatCard({ title, value, trend, up, icon: Icon, color, caption }: Stat) {
  return (
    <section className="card">
      <div className="mb-5 flex items-start justify-between gap-2">
        <div>
          <p className="mb-2 text-xs text-slate-500"><T>{title}</T></p>
          <h2 className="text-2xl font-semibold tracking-tight">{value}</h2>
        </div>
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}
        >
          <Icon size={19} />
        </span>
      </div>
      <p className="text-xs text-slate-400">
        {trend&&<span
          className={`mr-1 font-semibold ${up ? "text-emerald-500" : "text-red-500"}`}
        >
          {up ? "▲" : "▼"} {trend}
        </span>}{' '}
        <T>{caption??'From Last Week'}</T>
      </p>
    </section>
  );
}
