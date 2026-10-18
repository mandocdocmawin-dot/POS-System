import { type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useLocalData } from '../../services/useLocalData';
export function FeaturePage({ title, description, children, tabs = [] }: { title: string; description?: string; children: ReactNode; tabs?: [string, string][] }) {
  useLocalData();
  return <div className="mx-auto max-w-7xl space-y-6"><header><h1 className="text-2xl font-semibold">{title}</h1>{description && <p className="mt-2 text-slate-600 dark:text-slate-300">{description}</p>}</header>{tabs.length > 0 && <nav aria-label={`${title} sections`} className="flex flex-wrap gap-2 border-b pb-4 dark:border-slate-700">{tabs.map(([label, path]) => <NavLink className={({ isActive }) => `btn ${isActive ? 'menu-active' : ''}`} key={path} to={path}>{label}</NavLink>)}</nav>}{children}</div>;
}
