import {useState} from 'react';
import {Link} from 'react-router-dom';
import {Eye,Plus} from 'lucide-react';
import type {ReportFilter} from '../../types/accounts';
import {reportService} from '../../services/reportService';
import {productService} from '../../services/productService';
import {categoryService} from '../../services/catalogService';
import {orderService} from '../../services/orderService';
import {DataTable} from '../common/DataTable';
import {ProductImage} from '../common/ProductImage';
import {Can} from '../auth/Can';
import {ProductDetails} from '../../pages/products/ProductDetails';
import {payrollMoney} from '../../utils/money';
import {toCentavos} from '../../utils/pos';
import {inRange} from '../../utils/reports/period';
export function ProductProfitTable({filter}:{filter:ReportFilter}){
 const [category,setCategory]=useState(''),[status,setStatus]=useState(''),[view,setView]=useState('');
 const rows=reportService.product(filter).filter(p=>(!category||productService.get(p.id)?.categoryId===category)&&(!status||(status==='profit'?p.profit>0:status==='loss'?p.profit<0:p.profit===0))),orders=orderService.list({branchId:filter.branchId}).filter(o=>o.orderStatus!=='cancelled'&&inRange(o.createdAt,filter));
 return <><section className="panel"><div className="commerce-panel-heading"><h2>Finance</h2><div className="commerce-toolbar"><select aria-label="Finance category" value={category} onChange={e=>setCategory(e.target.value)}><option value="">Select Category</option>{categoryService.list().map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select><select aria-label="Profit status" value={status} onChange={e=>setStatus(e.target.value)}><option value="">Select Status</option><option value="profit">Profitable</option><option value="loss">Loss</option><option value="even">Break Even</option></select><Can permission="accounts:manage"><Link className="btn-primary" to="/accounts/income"><Plus size={16}/>Finance Entries</Link></Can></div></div><DataTable caption="Product finance" rows={rows} rowKey={p=>p.id} searchText={p=>`${p.name} ${p.sku} ${p.category}`} columns={[
  {id:'name',header:'Product',cell:p=><button className="commerce-product" onClick={()=>setView(p.id)}><ProductImage name={p.name} imageId={p.imageId}/><span>{p.name}<small className="commerce-subline">{p.category}</small></span></button>,sortValue:p=>p.name},
  {id:'sku',header:'SKU',cell:p=>p.sku},
  {id:'category',header:'Category',cell:p=>p.category},
  {id:'units',header:'Units Sold',cell:p=>p.quantity,sortValue:p=>p.quantity},
  {id:'profit',header:'Gross Profit',cell:p=><span className={p.profit<0?'text-red-600':p.profit>0?'text-emerald-600':'commerce-muted'}>{p.profit>0?'↑ ':p.profit<0?'↓ ':'— '}{payrollMoney(p.profit)}</span>,sortValue:p=>p.profit},
  {id:'tax',header:'Tax Invoiced',cell:p=>payrollMoney(orders.flatMap(o=>o.items).filter(l=>l.productId===p.id).reduce((n,l)=>n+toCentavos(l.lineTax),0))},
  {id:'status',header:'Status',cell:p=><span className={`inline-flex rounded border px-2 py-1 text-xs ${p.profit>0?'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300':p.profit<0?'border-red-200 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-300':'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>{p.profit>0?'Profitable':p.profit<0?'Loss':'Break Even'}</span>},
  {id:'cost',header:'Total Cost',cell:p=>payrollMoney(p.cogs),sortValue:p=>p.cogs}
 ]} actions={p=><div className="commerce-actions"><button onClick={()=>setView(p.id)} aria-label={`View ${p.name} finance`}><Eye size={15}/></button></div>}/></section>{view&&<ProductDetails id={view} onClose={()=>setView('')}/>}</>;
}
