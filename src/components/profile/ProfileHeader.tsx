import { T } from "../../i18n/T";
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, CalendarDays, Monitor, Users } from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { profileService } from '../../services/profileService';
import { branchService } from '../../services/branchService';
import { usePermission } from '../../hooks/usePermission';
import { useStaffStore } from '../../store/useStaffStore';

export function ProfileHeader({ staffId }: { staffId?: string }) {
  const user = profileService.get(staffId), { can } = usePermission();
  const staff = useStaffStore(s => s.staff);
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => { const update = () => setOnline(navigator.onLine); window.addEventListener('online', update); window.addEventListener('offline', update); return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update); }; }, []);
  const branches = user.branchIds.map(id => branchService.get(id)?.name ?? id);
  return <section className="panel overflow-hidden">
    <div className="flex min-h-28 items-center justify-between gap-6 bg-indigo-50 px-6 py-7 dark:bg-indigo-500/10"><div><p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">TindaPOS workspace</p><p className="mt-2 text-lg font-medium text-slate-900 dark:text-slate-100">Your people, stores, and daily operations.</p></div><Building2 className="hidden text-indigo-300 sm:block" size={44} aria-hidden="true" /></div>
    <div className="px-6 pb-6"><div className="flex flex-wrap items-end justify-between gap-4"><div className="-mt-7 rounded-full bg-white p-1 dark:bg-slate-900"><Avatar name={user.name} imageId={user.avatarId} size="h-24 w-24" /></div><div className="flex flex-wrap items-center gap-3 pb-1"><span className="flex items-center gap-2 text-xs"><span className={`h-2 w-2 rounded-full ${online ? 'bg-emerald-500' : 'bg-slate-400'}`} />{online ? 'Browser online' : 'Offline · local workspace'}</span>{can('pos:use') && <Link className="btn-primary" to="/pos"><Monitor size={16} /><T text={"Open POS"}/></Link>}</div></div>
    <h2 className="mt-3 text-xl font-semibold">{user.name}</h2><p className="mt-1 text-sm capitalize">{user.position || user.role} · {user.staffNo}</p><div className="mt-4 flex flex-wrap gap-x-6 gap-y-3 text-sm"><span className="flex items-center gap-2"><Building2 size={15} />{branches.join(', ')}</span><span className="flex items-center gap-2"><CalendarDays size={15} />Joined {user.hireDate}</span><span className="flex items-center gap-2"><Users size={15} />{staff.filter(s => s.status === 'active' && s.branchIds.some(id => user.branchIds.includes(id))).length} active staff</span></div></div>
  </section>;
}
