import { T } from "../../i18n/T";
import type {ReportFilter} from '../../types/accounts';
import {reportService} from '../../services/reportService';
import {BarChart} from '../charts';
export function SalesByBranch({filter}:{filter:ReportFilter}){const rows=reportService.salesByBranch(filter);return <section className="card"><h2 className="mb-4 text-lg font-semibold"><T text={"Sales by branch"}/></h2><BarChart labels={rows.map(r=>r.name)} series={[{name:'Net sales',data:rows.map(r=>r.revenue)}]} summary="Net received sales by branch, including refunds and cash rounding"/></section>;}
