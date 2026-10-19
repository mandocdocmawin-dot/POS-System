import { T } from "../../i18n/T";
import { BranchFilter } from '../../components/reports/BranchFilter';
import { usePermission } from '../../hooks/usePermission';
import { useLocalData } from '../../services/useLocalData';
import { reportService } from '../../services/reportService';
import { RecentOrders } from './RecentOrders';
import { AnalyticsRow } from './AnalyticsRow';
import { CustomersRow } from './CustomersRow';
import { ProductsRow, TopProducts } from './ProductsRow';
import { PerformanceRow, GrossProfit } from './PerformanceRow';
import { SummaryRow, SummaryCarousel } from './SummaryRow';
import './dashboard.css';

export function Component() {
  useLocalData();
  const { can } = usePermission();
  return <div className="dashboard">
    <header className="dashboard-page-heading"><h1><T text={"Main"}/></h1><div className="dashboard-page-tools"><BranchFilter value={reportService.activeBranch()} onChange={reportService.setDashboardBranch}/><nav aria-label="Breadcrumb"><T text={"Dashboards "}/><span>›</span> <strong aria-current="page"><T text={"Main"}/></strong></nav></div></header>
    <div className="dashboard-overview">
      <div className="dashboard-primary"><SummaryRow/><PerformanceRow/>{(can('reports:view') || can('inventory:view')) && <ProductsRow/>}</div>
      <aside className="dashboard-aside" aria-label="Business overview"><SummaryCarousel/>{can('reports:finance') && <GrossProfit/>}{can('reports:view') && <TopProducts/>}</aside>
    </div>
    {can('reports:view') && <><CustomersRow/><AnalyticsRow/></>}
    <RecentOrders/>
  </div>;
}
