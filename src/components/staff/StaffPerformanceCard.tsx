import { T } from "../../i18n/T";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Crown } from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';
import { useLocalData } from '../../services/useLocalData';
import { formatPHP } from '../../utils/money';
import { Avatar } from '../common/Avatar';
import { DashboardPanel } from '../../pages/dashboard/DashboardPanel';
import { staffService } from '../../services/staffService';
import { reportService } from '../../services/reportService';
export function StaffPerformanceCard() {
  useLocalData();
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('month'), data = dashboardService.getStaff(period), top = data.ranked[0];
  const branch = reportService.activeBranch();
  const team = staffService.list().filter(person => person.status === 'active' && person.name !== top?.name && (branch === 'all' || person.branchIds.includes(branch))).slice(0, 3);
  return <DashboardPanel title="Staff Performance" action={<Link to="/staff/staff-list"><T text={"View Report"}/></Link>} className="dashboard-staff">
    <div className="dashboard-staff-portraits">{top ? <div className="dashboard-staff-winner"><Avatar name={top.name} size="h-20 w-20"/><Crown size={20}/></div> : <div className="dashboard-staff-placeholder"><Crown size={34}/></div>}{team.map((person, i) => <div className={`dashboard-staff-satellite satellite-${i}`} key={person.id}><Avatar name={person.name} imageId={person.avatarId} size="h-11 w-11"/></div>)}</div>
    <div className="dashboard-staff-caption"><h3>{top ? 'Top Performing Staff' : 'Staff Performance'}</h3><p>{top ? `${top.name} · Based on sales & order completion` : 'No sales recorded in this period.'}</p><select aria-label="Staff performance period" value={period} onChange={e => setPeriod(e.target.value === 'month' ? 'month' : e.target.value === 'week' ? 'week' : 'today')}><option value="today"><T text={"Today"}/></option><option value="week"><T text={"This week"}/></option><option value="month"><T text={"Last 30 days"}/></option></select></div>
    <div className="dashboard-staff-stats">{[['Best', `${data.totalSales && top ? Math.round(top.sales / data.totalSales * 100) : 0}%`], ['Orders', String(data.totalOrders)], ['Sales', formatPHP(data.totalSales)]].map(([title, value]) => <div key={title}><strong>{value}</strong><span>{title}</span></div>)}</div>
  </DashboardPanel>;
}
