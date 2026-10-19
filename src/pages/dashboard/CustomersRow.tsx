import { T } from "../../i18n/T";
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Avatar } from '../../components/common/Avatar';
import { dashboardService } from '../../services/dashboardService';
import { DashboardPanel } from './DashboardPanel';
import { DashboardChart } from './DashboardChart';
function ProgressRing({ percent, color }: { percent: number; color: string }) {
  return <svg viewBox="0 0 52 52" role="img" aria-label={`${percent}%`}><circle cx="26" cy="26" r="22" fill="none" className="dashboard-ring-track" strokeWidth="4"/><circle cx="26" cy="26" r="22" fill="none" stroke={color} strokeWidth="4" strokeDasharray={`${percent} 100`} pathLength="100" strokeLinecap="round" transform="rotate(-90 26 26)"/><text x="26" y="30" textAnchor="middle">{percent}%</text></svg>;
}
export function CustomersRow() {
  const customers = dashboardService.getCustomers(), payments = dashboardService.getPayments().slice(0, 2);
  return <div className="dashboard-customers-row"><DashboardPanel title="Total Customers" action={<Link to="/customers/customer-list" aria-label="View customers">⋮</Link>} className="dashboard-customers"><p className="dashboard-muted dashboard-customers-subtitle"><T text={"Customers across your stores"}/></p><div className="dashboard-customer-total"><div><h3>{customers.total}</h3><p><span className="dashboard-positive">{customers.trend}</span> <span className="dashboard-muted"><T text={"vs last week"}/></span></p></div><div className="dashboard-avatar-stack">{customers.names.slice(0, 3).map(name => <Avatar name={name} key={name}/>)}{customers.names.length > 3 && <span>+{customers.names.length - 3}</span>}</div></div><div className="dashboard-customer-segments">{customers.rows.map((row, i) => <Link to="/customers/customer-list" key={row.label}><ProgressRing percent={row.percent} color={i === 0 ? '#ff3c48' : '#35bf65'}/><div><strong><T>{row.label}</T> <span style={{ color: i === 0 ? '#ff3c48' : '#35bf65' }}>{row.percent}%</span></strong><p>{i === 0 ? 'Customers joined in the last 30 days' : 'Repeat buyers with loyalty points'}</p></div><ChevronRight size={17}/></Link>)}</div></DashboardPanel>
  <DashboardPanel title="Payment methods" className="dashboard-payments"><div className="dashboard-payment-values">{payments.map((payment, i) => <div key={payment.label}><strong><span className={i === 0 ? 'payment-purple' : 'payment-pink'}>☆</span> {payment.percent}%</strong><p>{payment.label}</p></div>)}</div><DashboardChart kind="payments"/></DashboardPanel>
  <DashboardPanel title="Inventory management" className="dashboard-inventory"><DashboardChart kind="inventory"/></DashboardPanel></div>;
}
