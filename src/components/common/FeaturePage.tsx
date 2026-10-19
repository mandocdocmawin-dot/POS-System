import { T } from "../../i18n/T";
import { type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ProfileHeader } from '../profile/ProfileHeader';
import { usePermission } from '../../hooks/usePermission';
import { useLocalData } from '../../services/useLocalData';
export function FeaturePage({ title, description, children, tabs = [], banner, localizeTitle = true }: { title: string; description?: string; children: ReactNode; tabs?: [string, string][]; banner?: ReactNode; localizeTitle?: boolean }) {
  useLocalData();
  const account = useLocation().pathname.startsWith('/account/'), { can } = usePermission();
  const navigation = account && can('billing:view') && !tabs.some(([,path]) => path === '/account/billing-plans') ? [...tabs.slice(0,2), ['Billing & plans', '/account/billing-plans'] as [string,string], ...tabs.slice(2)] : tabs;
  return <div className="mx-auto max-w-7xl space-y-6"><header><h1 className="text-2xl font-semibold">{localizeTitle ? <T>{title}</T> : title}</h1>{description && <p className="mt-2 text-slate-600 dark:text-slate-300"><T>{description}</T></p>}</header>{banner ?? (account ? <ProfileHeader /> : null)}{navigation.length > 0 && <nav aria-label={`${title} sections`} className="flex flex-wrap gap-2 border-b pb-4 dark:border-slate-700">{navigation.map(([label, path]) => <NavLink className={({ isActive }) => `btn ${isActive ? 'menu-active' : ''}`} key={path} to={path}><T>{label}</T></NavLink>)}</nav>}{children}</div>;
}
