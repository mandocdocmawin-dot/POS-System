import { useTranslation } from '../../i18n/useTranslation';
import { T } from "../../i18n/T";
import { Link } from 'react-router-dom';
import { usePermission } from '../../hooks/usePermission';
import { StaffPerformanceCard } from '../../components/staff/StaffPerformanceCard';
import { dashboardService } from '../../services/dashboardService';
import { DashboardChart } from './DashboardChart';
import { DashboardPanel } from './DashboardPanel';
export function PerformanceRow() {
  const { can } = usePermission();
  const { t } = useTranslation();
  return <div className="dashboard-performance"><DashboardPanel title="Sales Trend" subtitle={'('+t('{growth} sales growth',{growth:dashboardService.getOverview().salesGrowth})+')'} className="dashboard-sales"><DashboardChart kind="sales"/></DashboardPanel>{can('staff:view') && <StaffPerformanceCard/>}</div>;
}
export function GrossProfit() {
  const gross = dashboardService.getGrossProfit();
  return <DashboardPanel title="Gross Profit" action={<Link to="/reports/finance" className="dashboard-period-tag"><T text={"Last 30 days"}/></Link>} className="dashboard-gross"><h3>{gross.value}</h3><div className="dashboard-gross-bars">{gross.bars.map(bar => <div className="dashboard-gross-row" key={bar.label}><span><T>{bar.label}</T></span><div className="dashboard-gross-track"><div style={{ width: `${bar.percent}%` }}/></div><strong>{bar.value}</strong></div>)}</div></DashboardPanel>;
}
