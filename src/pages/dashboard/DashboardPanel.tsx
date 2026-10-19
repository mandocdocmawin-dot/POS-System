import { T } from "../../i18n/T";
import type { ReactNode } from 'react';
export function DashboardPanel({ title, action, children, className = '', subtitle }: { title: string; action?: ReactNode; children: ReactNode; className?: string; subtitle?: ReactNode }) {
  return <section className={`dashboard-panel ${className}`}><header className="dashboard-panel-heading"><div><h2><T>{title}</T>{subtitle && <span className="dashboard-heading-note"><T>{subtitle}</T></span>}</h2></div>{action}</header>{children}</section>;
}
