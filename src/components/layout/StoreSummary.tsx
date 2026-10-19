import { T } from "../../i18n/T";
import { Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Popover } from '../common/Popover';
import { useLocalData } from '../../services/useLocalData';
import { storeSummary } from '../../services/storeSummaryService';
import { formatMoney } from '../../utils/money';
export function StoreSummary() {
  useLocalData(); const summary = storeSummary();
  return <Popover label="Store quick summary" trigger={<Store size={17} />}><section className="w-64 space-y-4 p-3"><h2 className="font-semibold">Today at {summary.branchId}</h2><dl className="grid grid-cols-2 gap-3"><dt>Received sales</dt><dd>{formatMoney(summary.sales)}</dd><dt><T text={"Orders"}/></dt><dd>{summary.orders}</dd><dt><T text={"Held orders"}/></dt><dd>{summary.held}</dd><dt><T text={"Low stock"}/></dt><dd>{summary.lowStock}</dd></dl><Link className="btn-primary" to="/pos"><T text={"Open POS"}/></Link></section></Popover>;
}
