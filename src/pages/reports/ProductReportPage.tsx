import {useState} from 'react';
import {Link} from 'react-router-dom';
import {Eye,Pencil} from 'lucide-react';
import {useReportFilters} from '../../hooks/useReportFilters';
import {reportService} from '../../services/reportService';
import {productService} from '../../services/productService';
import {categoryService} from '../../services/catalogService';
import {ReportFrame} from '../../components/reports/ReportFrame';
import {ReportTable} from '../../components/reports/ReportSection';
import {ReferenceMetrics} from '../../components/reports/ReferencePanel';
import {ReportChart} from '../../components/reports/ReportChart';
import {DataTable} from '../../components/common/DataTable';
import {ProductImage} from '../../components/common/ProductImage';
import {StatusBadge} from '../../components/common/StatusBadge';
import {Can} from '../../components/auth/Can';
import {ProductDetails} from '../products/ProductDetails';
import {formatPHP,payrollMoney} from '../../utils/money';
import {fromCentavos,toCentavos,multiplyCentavos} from '../../utils/pos';
export function Component(){
 const f=useReportFilters(),[slowDays,setSlowDays]=useState(30),[category,setCategory]=useState(''),[stock,setStock]=useState(''),[status,setStatus]=useState(''),[price,setPrice]=useState(''),[view,setView]=useState(''),[selected,setSelected]=useState<string[]>([]),all=reportService.product(f,slowDays),summary=reportService.productSummary(f,slowDays);
 const catalog=productService.list(),active=catalog.filter(p=>p.status==='active').length,inactive=catalog.filter(p=>p.status!=='active').length,out=all.filter(p=>p.stock<=0).length,value=all.reduce((n,p)=>n+multiplyCentavos(toCentavos(productService.get(p.id)?.costPrice??0),Math.max(0,p.stock)),0),total=catalog.length;
 const rows=all.filter(p=>{const item=productService.get(p.id);return (!category||item?.categoryId===category)&&(!status||item?.status===status)&&(!stock||(stock==='in'?p.stock>0:p.stock<=0))&&(!price||(price==='under'?(item?.sellingPrice??0)<100:(item?.sellingPrice??0)>=100));});
 return <ReportFrame title="Products" filter={f} csv={[["Product","SKU","Category","Quantity","Revenue PHP","COGS PHP","Profit PHP","Margin %","Stock","Last sale"],...rows.map(p=>[p.name,p.sku,p.category,p.quantity,fromCentavos(p.revenue),fromCentavos(p.cogs),fromCentavos(p.profit),p.margin,p.stock,p.lastSale??''])]} summary={<ReferenceMetrics bars items={[
  {label:'Total Products',value:total,count:true,progress:100},
  {label:'Active Products',value:active,count:true,progress:total?active/total*100:0},
  {label:'Inactive Products',value:inactive,count:true,progress:total?inactive/total*100:0},
  {label:'Out of Stock',value:out,count:true,progress:total?out/total*100:0},
  {label:'Inventory Value',value,progress:100}
 ]}/> }><section className="panel"><div className="commerce-panel-heading"><h2>Product List</h2><div className="commerce-toolbar"><select aria-label="Product category" value={category} onChange={e=>setCategory(e.target.value)}><option value="">All Categories</option>{categoryService.list().map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select><select aria-label="Stock availability" value={stock} onChange={e=>setStock(e.target.value)}><option value="">All Stock</option><option value="in">In stock</option><option value="out">Out of stock</option></select><select aria-label="Product status" value={status} onChange={e=>setStatus(e.target.value)}><option value="">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option></select><select aria-label="Product price" value={price} onChange={e=>setPrice(e.target.value)}><option value="">All Prices</option><option value="under">Under ₱100</option><option value="above">₱100 and above</option></select></div></div>
 <DataTable caption="Products" rows={rows} rowKey={p=>p.id} selection={selected} onSelectionChange={setSelected} searchText={p=>`${p.name} ${p.sku} ${p.category}`} columns={[
  {id:'id',header:'Product ID',cell:p=>p.sku,sortValue:p=>p.sku},
  {id:'product',header:'Product',cell:p=><button className="commerce-product" onClick={()=>setView(p.id)}><ProductImage name={p.name} imageId={p.imageId}/>{p.name}</button>,sortValue:p=>p.name},
  {id:'category',header:'Category',cell:p=>p.category},
  {id:'stock',header:'Stock',cell:p=><span className="flex items-center gap-2"><span className="purchase-receipt-indicator" data-received={p.stock>0} aria-hidden="true"><i/></span>{p.stock}</span>,sortValue:p=>p.stock},
  {id:'price',header:'Price',cell:p=>formatPHP(productService.get(p.id)?.sellingPrice??0)},
  {id:'status',header:'Status',cell:p=><StatusBadge>{productService.get(p.id)?.status??'inactive'}</StatusBadge>}
 ]} actions={p=><div className="commerce-actions"><button onClick={()=>setView(p.id)} aria-label={`View ${p.name}`}><Eye size={15}/></button><Can permission="products:edit"><Link className="edit" to={`/products/${p.id}/edit`} aria-label={`Edit ${p.name}`}><Pencil size={15}/></Link></Can></div>}/></section>
 <details className="panel reference-analytics"><summary>Product performance and analytics</summary><div className="space-y-4"><label>Slow movers: no sales in <input aria-label="Slow mover days" type="number" className="w-20" min="1" max="3650" value={slowDays} onChange={e=>setSlowDays(Math.min(3650,Math.max(1,Number(e.target.value)||30)))}/> days</label><div className="grid gap-4 lg:grid-cols-2"><ReportChart title="Top products by quantity" horizontal count labels={all.slice(0,10).map(p=>p.name)} series={[{name:'Units',data:all.slice(0,10).map(p=>p.quantity)}]} summary="Products ranked by net units sold"/><ReportChart title="Top products by revenue" horizontal labels={summary.topRevenue.map(p=>p.name)} series={[{name:'Revenue',data:summary.topRevenue.map(p=>p.revenue)}]} summary="Products ranked by received revenue"/><ReportChart title="Sales by category" kind="donut" labels={summary.categories.map(p=>p.label)} series={[{name:'Revenue',data:summary.categories.map(p=>p.amount)}]} summary="Product revenue by category"/></div><ReportTable title="Product performance" rows={all} rowKey={p=>p.id} columns={[{id:'name',header:'Product',cell:p=>p.name},{id:'units',header:'Units sold',cell:p=>p.quantity},{id:'revenue',header:'Revenue',cell:p=>payrollMoney(p.revenue)},{id:'profit',header:'Profit',cell:p=>payrollMoney(p.profit)},{id:'margin',header:'Margin',cell:p=>`${p.margin}%`},{id:'last',header:'Last Sale',cell:p=>p.lastSale??'Never'},{id:'slow',header:'Slow Mover',cell:p=>p.slow?'Yes':'—'}]}/></div></details>{view&&<ProductDetails id={view} onClose={()=>setView('')}/>}
 </ReportFrame>;
}
