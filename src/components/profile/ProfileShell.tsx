import type { ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { FeaturePage } from '../common/FeaturePage';
import { profileService } from '../../services/profileService';
export function ProfileShell({ children }: { children: ReactNode }) {
  const { staffId } = useParams(), user = profileService.get(staffId), prefix = staffId ? `/profile/${staffId}` : '/profile';
  return <FeaturePage title={user.name} description={`${user.staffNo} · ${user.role} · Hired ${user.hireDate} · ${user.branchIds.join(', ')}`} tabs={(['overview', 'activity', 'documents', 'notes'] as const).map(tab => [tab[0].toUpperCase() + tab.slice(1), `${prefix}/${tab}`])}><div className="flex items-center gap-3"><span className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-900">{user.name.split(' ').map(n => n[0]).slice(0, 2).join('')}</span><div><p className="font-semibold">{user.name}</p><span className="rounded bg-amber-100 px-2 py-1 text-xs text-amber-900">Demo · {user.role}</span></div></div>{children}</FeaturePage>;
}
