import { useState, type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useLocalData } from '../../services/useLocalData';
import { toast, errorMessage } from '../../services/toastService';
export function FeaturePage({ title, description, children, tabs = [] }: { title: string; description?: string; children: ReactNode; tabs?: [string, string][] }) {
  useLocalData();
  return <div className="mx-auto max-w-7xl space-y-6"><header><h1 className="text-2xl font-semibold">{title}</h1>{description && <p className="mt-2 text-slate-600 dark:text-slate-300">{description}</p>}</header>{tabs.length > 0 && <nav aria-label={`${title} sections`} className="flex flex-wrap gap-2 border-b pb-4 dark:border-slate-700">{tabs.map(([label, path]) => <NavLink className={({ isActive }) => `btn ${isActive ? 'menu-active' : ''}`} key={path} to={path}>{label}</NavLink>)}</nav>}{children}</div>;
}
export function useAction() {
  const [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const run = async (action: () => unknown | Promise<unknown>, success?: string) => {
    setError(''); setBusy(true);
    try { await action(); if (success) toast.success(success); } catch (error) { setError(errorMessage(error)); } finally { setBusy(false); }
  };
  return { run, busy, error, feedback: error ? <p className="rounded-lg border border-red-400 p-3 text-red-700 dark:text-red-300" role="alert">{error}</p> : null };
}
export const accountTabs: [string, string][] = [['Account', '/account/account'], ['Security', '/account/security'], ['Notifications', '/account/notification'], ['Statements', '/account/statements'], ['Logs', '/account/logs']];
