import { T } from "../../i18n/T";
import { Link } from 'react-router-dom';
import { Avatar } from '../../components/common/Avatar';
import { ProductImage } from '../../components/common/ProductImage';
import { dashboardService } from '../../services/dashboardService';
import { formatPHP } from '../../utils/money';
import { DashboardPanel } from './DashboardPanel';
import { DashboardChart } from './DashboardChart';
export function AnalyticsRow() {
  const categories = dashboardService.getCategories(), transactions = dashboardService.getTransactions();
  return <div className="dashboard-analytics-row"><DashboardPanel title="Order Analytics" className="dashboard-order-analytics"><DashboardChart kind="orders"/></DashboardPanel>
    <DashboardPanel title="Recent Transactions" action={<Link to="/reports/sales" aria-label="View sales transactions">⋮</Link>} className="dashboard-transactions"><ul>{transactions.map(t => <li key={t.id}><Avatar name={t.customerName}/><div><strong>{t.id.split(' · ')[0]}</strong><p>{t.method} · {t.time}</p></div><strong>{formatPHP(t.amount)}</strong></li>)}</ul>{!transactions.length && <p className="dashboard-empty"><T text={"No transactions recorded."}/></p>}</DashboardPanel>
    <DashboardPanel title="Top Categories" action={<Link to="/products/categories"><T text={"View Details"}/></Link>} className="dashboard-categories"><div className="dashboard-category-total"><h3>{categories.total}</h3><span><T text={"Total Categories"}/></span></div><div className="dashboard-category-segments">{categories.segments.map((s, i) => <div key={s.name} style={{ flex: Math.max(s.percent, 15) }}><div style={{ background: ['#ff762b', '#06396a', '#35bf65', '#f3bd3c'][i % 4] }}/><p>{s.name}</p><strong><i style={{ background: ['#ff762b', '#06396a', '#35bf65', '#f3bd3c'][i % 4] }}/>{s.percent}%</strong></div>)}</div><div className="dashboard-category-list">{categories.rows.slice(0, 2).map(row => <div key={row.name}><ProductImage name={row.productName} imageId={row.imageId}/><div><div className="dashboard-category-value"><strong>{row.name}</strong><span>{row.value}<T text={" Revenue"}/></span></div><p>{row.subtitle}</p></div></div>)}</div><Link className="dashboard-panel-footer" to="/products/categories"><T text={"View all categories ›"}/></Link></DashboardPanel>
  </div>;
}
