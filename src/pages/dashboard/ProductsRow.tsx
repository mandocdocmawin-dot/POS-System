import { T } from "../../i18n/T";
import { Link } from 'react-router-dom';
import { usePermission } from '../../hooks/usePermission';
import { ProductImage } from '../../components/common/ProductImage';
import { dashboardService } from '../../services/dashboardService';
import { DashboardPanel } from './DashboardPanel';
import { DashboardChart } from './DashboardChart';
export function ProductsRow() {
  const { can } = usePermission(), stock = dashboardService.getLowStock();
  return <div className="dashboard-products">
    {can('inventory:view') && <DashboardPanel title="Low Stock Items" action={<Link to="/inventory/stock-list"><T text={"View All →"}/></Link>} className="dashboard-low-stock"><div className="dashboard-table-scroll"><table><thead><tr><th><T text={"Product"}/></th><th>SKU</th><th><T text={"Stock"}/></th></tr></thead><tbody>{stock.map((p, i) => <tr key={p.id}><td><div className="dashboard-product"><ProductImage imageId={p.imageId} name={p.name}/><div><strong>{p.name}</strong><small><T text={"Reorder: "}/>{p.reorderLevel}</small></div></div></td><td className="dashboard-muted">{p.sku}</td><td><div className="dashboard-stock-value"><progress className={`stock-color-${i % 5}`} value={p.percent} max={100} aria-label={`${p.name} stock versus reorder level`}/><span>{p.stock}</span></div></td></tr>)}</tbody></table></div>{!stock.length && <p className="dashboard-empty"><T text={"No low stock items."}/></p>}</DashboardPanel>}
    {can('reports:finance') && <DashboardPanel title="Profit vs Sales" className="dashboard-profit"><DashboardChart kind="profit"/></DashboardPanel>}
  </div>;
}
export function TopProducts() {
  const products = dashboardService.getTopProducts();
  return <DashboardPanel title="Top Selling Products" action={<Link to="/reports/product"><T text={"Monthly Update"}/></Link>} className="dashboard-top-products"><ul className="dashboard-product-list">{products.map(p => <li key={p.id}><ProductImage imageId={p.imageId} name={p.name}/><div className="dashboard-product-info"><strong>{p.name}</strong><small>SKU: {p.sku} · <span className={p.up ? 'dashboard-positive' : 'dashboard-negative'}>{p.trend}</span></small></div><div className="dashboard-product-sales"><small><T text={"Sales"}/></small><strong>{p.sales}</strong></div></li>)}</ul>{!products.length && <p className="dashboard-empty"><T text={"No products sold in this period."}/></p>}</DashboardPanel>;
}
