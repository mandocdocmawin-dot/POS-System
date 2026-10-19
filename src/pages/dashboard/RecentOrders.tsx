import { T } from "../../i18n/T";
import { formatDateTime as displayDateTime } from '../../utils/date';
import { Link } from 'react-router-dom';
import { usePermission } from '../../hooks/usePermission';
import { useState } from 'react';
import { Eye, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { DataTable } from '../../components/common/DataTable';
import { ProductImage } from '../../components/common/ProductImage';
import { Avatar } from '../../components/common/Avatar';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ReceiptDialog } from '../../components/pos/ReceiptDialog';
import { receiptService, type ReceiptDocument } from '../../services/receiptService';
import { dashboardService } from '../../services/dashboardService';
import { formatPHP } from '../../utils/money';
export function RecentOrders() {
  const { can } = usePermission(), orders = dashboardService.getRecentOrders();
  const [page, setPage] = useState(1), [receipt, setReceipt] = useState<ReceiptDocument | null>(null), [selected, setSelected] = useState<string[]>([]);
  const pages = Math.max(1, Math.ceil(orders.length / 7)), current = Math.min(page, pages);
  const pageNumbers = Array.from({length: Math.min(5, pages)}, (_, i) => Math.min(Math.max(1, current - 2), Math.max(1, pages - 4)) + i);
  return <section className="dashboard-panel dashboard-recent-orders"><header className="dashboard-panel-heading"><h2><T text={"Recent Orders"}/></h2><Link to="/orders/all-orders"><T text={"View All →"}/></Link></header>
    <DataTable caption="Recent store orders" hideFooter rows={orders.slice((current - 1) * 7, current * 7)} rowKey={o => o.id} selection={selected} onSelectionChange={setSelected} columns={[
      { id: 'no', header: 'Order ID', cell: o => <Link className="dashboard-muted" to={`/orders/${o.id}`}>{o.orderNo}</Link> },
      { id: 'date', header: 'Date', cell: o => displayDateTime(new Date(o.createdAt)) },
      { id: 'product', header: 'Product', cell: o => <div className="dashboard-order-product"><ProductImage imageId={o.items[0]?.imageId} name={o.items[0]?.name ?? 'Product'}/><span title={o.items.map(l => l.name).join(', ')}>{o.items[0]?.name}{o.items.length > 1 && <small className="dashboard-muted"> +{o.items.length - 1}</small>}</span></div> },
      { id: 'customer', header: 'Customer', cell: o => <div className="dashboard-order-customer"><Avatar name={o.customerName}/>{o.customerName}</div> },
      { id: 'items', header: 'Items', cell: o => o.items.length },
      { id: 'total', header: 'Total Price', cell: o => <strong className="font-medium">{formatPHP(o.grandTotal)}</strong> },
      { id: 'payment', header: 'Payment Status', cell: o => <StatusBadge>{o.paymentStatus}</StatusBadge> },
      { id: 'quantity', header: 'Quantity', cell: o => o.items.reduce((n, l) => n + l.quantity, 0) },
      { id: 'status', header: 'Order Status', cell: o => <StatusBadge>{o.orderStatus}</StatusBadge> },
      { id: 'actions', header: 'Actions', cell: o => <div className="dashboard-order-actions"><Link className="btn" aria-label={`View order ${o.orderNo}`} to={`/orders/${o.id}`}><Eye size={14}/></Link><Link className="btn" aria-label={`Manage order ${o.orderNo}`} to={`/orders/${o.id}`}><Pencil size={14}/></Link>{can('orders:cancel') && o.orderStatus === 'pending' && !o.refundedTotal && <Link className="btn" aria-label={`Cancel order ${o.orderNo}`} to={`/orders/${o.id}?action=cancel`}><Trash2 size={14}/></Link>}</div> },
      { id: 'receipt', header: 'Receipt', cell: o => <button className="btn" aria-label={`Receipt for ${o.orderNo}`} onClick={() => setReceipt(receiptService.get(o.id))}><Eye size={14}/></button> },
    ]}/>
    <nav aria-label="Recent orders pages" className="dashboard-pagination"><p><T text={"Showing "}/><strong>{orders.length ? (current - 1) * 7 + 1 : 0}–{Math.min(current * 7, orders.length)}</strong><T text={" of "}/><strong>{orders.length}</strong><T text={" Results"}/>{selected.length > 0 && ` · ${selected.length} selected`}</p><div><button className="btn disabled:opacity-40" disabled={current === 1} onClick={() => setPage(current - 1)}><ChevronLeft size={13}/><T text={"Previous"}/></button>{pageNumbers.map(p => <button key={p} className={`btn ${current === p ? 'is-active' : ''}`} aria-label={`Go to orders page ${p}`} aria-current={current === p ? 'page' : undefined} onClick={() => setPage(p)}>{p}</button>)}<button className="btn disabled:opacity-40" disabled={current === pages} onClick={() => setPage(current + 1)}><T text={"Next"}/><ChevronRight size={13}/></button></div></nav><ReceiptDialog receipt={receipt} reprint onClose={() => setReceipt(null)}/>
  </section>;
}
