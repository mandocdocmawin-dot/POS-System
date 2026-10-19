import { useLocation, useParams } from 'react-router-dom';
import { useLocalData } from '../../services/useLocalData';
import { profileService } from '../../services/profileService';
import { ProfileShell } from '../../components/profile/ProfileShell';
import { ActivityList } from '../../components/account/ActivityList';
import { formatMoney } from '../../utils/money';
export function Component() {
  useLocalData(); const { staffId } = useParams(), user = profileService.get(staffId), stats = profileService.statement(user.id), activity = useLocation().pathname.endsWith('/activity');
  return <ProfileShell>{activity ? <ActivityList defaultTimeline logs={profileService.logs(user.id)} /> : <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[['Orders handled', String(stats.orders.length)], ['Received sales', formatMoney(stats.sales)], ['Attendance rate', `${stats.attendanceRate.toFixed(1)}%`], ['Hours this month', stats.hours.toFixed(1)]].map(([title, value]) => <section className="card" key={title}><h2 className="text-sm">{title}</h2><p className="mt-3 text-3xl font-semibold">{value}</p></section>)}</div><section className="card space-y-3"><h2 className="text-lg font-semibold">Profile overview</h2><p>Email: {user.email}</p><p>Phone: {user.phone || 'Not provided'}</p><p>Position: {user.position || 'Team member'}</p><p>Status: {user.status}</p></section></>}</ProfileShell>;
}
