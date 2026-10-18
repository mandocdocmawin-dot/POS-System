import {formatDate,formatTime} from '../../utils/date';
import {Popover} from '../../components/common/Popover';
import {useCurrentUser} from '../../hooks/useCurrentUser';
import {Can} from '../../components/auth/Can';
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Clock3,
  Power,
  LayoutDashboard,
  Settings,
  Store,
} from "lucide-react";
import { NotificationMenu } from "../../components/layout/NotificationMenu";
import { UserMenu } from "../../components/layout/UserMenu";
import { FullscreenButton } from "../../components/layout/FullscreenButton";
import { Brand } from "../../components/layout/Brand";
export function PosTopbar() {
 const user=useCurrentUser();
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <header className="flex shrink-0 min-h-20 flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center gap-3">
        <Brand />
        <span className="ml-3 flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs dark:border-slate-700">
          <CalendarDays size={15} />
          {formatDate(time)}
        </span>
        <span className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs dark:border-slate-700">
          <Clock3 size={15} />
          {formatTime(time)}
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-600 dark:bg-emerald-500/10">
          <Power size={12} />
          {user?.name}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Popover label="Open workspace" className="btn" trigger={<>Workspace</>}><nav aria-label="POS workspace links" className="w-48 p-2">{[['Orders','/orders','orders:view'],['Customers','/customers','customers:view'],['Products','/products','products:view'],['My attendance','/staff/attendance','attendance:view'],['My schedule','/staff/schedule','schedule:view']].map(([label,path,permission])=><Can key={path} permission={permission}><Link className="block rounded-lg p-3 text-sm hover:bg-slate-100 dark:hover:bg-slate-800" to={path}>{label}</Link></Can>)}</nav></Popover>
        <Can permission="dashboard:view"><Link
          to="/"
          className="btn border-slate-900 bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-800"
        >
          <LayoutDashboard size={15} />
          Dashboard
        </Link></Can>
        <Can permission="settings:manage"><Link className="icon-btn" aria-label="POS settings" to="/settings/pos">
          <Settings size={17} />
        </Link></Can>
        <FullscreenButton />
        <Can permission="pages:view"><Link
          className="icon-btn relative"
          aria-label="Switch store"
          to="/multi-store/store-list"
        >
          <Store size={17} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
        </Link>
        </Can><Can permission="pages:view"><NotificationMenu /></Can>
        <UserMenu />
      </div>
    </header>
  );
}
