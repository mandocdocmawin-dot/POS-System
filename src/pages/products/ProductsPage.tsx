import { ProductDetails } from './ProductDetails';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DataTable } from '../../components/common/DataTable';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { PageActions } from '../../components/common/PageActions';
import { ProductImage } from '../../components/common/ProductImage';
import { StockBadge, stockStatus } from '../../components/common/StockBadge';
import { Select } from '../../components/forms/Fields';
import { productService } from '../../services/productService';
import { categoryService, brandService, unitService } from '../../services/catalogService';
import { stockService } from '../../services/stockService';
import { useLocalData } from '../../services/useLocalData';
import { toast } from '../../services/toastService';
import { formatPHP } from '../../utils/money';
import { exportCSV } from '../../utils/csv';
export function Component() {
  useLocalData(); const [view, setView] = useState<string>(); const [category, setCategory] = useState(''); const [brand, setBrand] = useState(''); const [status, setStatus] = useState(''); const [stock, setStock] = useState(''); const [selected, setSelected] = useState<string[]>([]); const [deleting, setDeleting] = useState<string[]>([]);
  const categories = categoryService.list(), brands = brandService.list(), units = unitService.list();
  const rows = productService.list().filter(p => (!category || p.categoryId === category) && (!brand || p.brandId === brand) && (!status || p.status === status) && (!stock || stockStatus(stockService.getStock(p.id),p.reorderLevel) === stock));
  return <><PageActions title="All Products"><button className="btn" onClick={() => exportCSV('products.csv', [['Name','SKU','Cost','Price','Stock'],...rows.map(p => [p.name,p.sku,p.costPrice,p.sellingPrice,stockService.getStock(p.id)])])}>Export CSV</button><Link className="btn-primary" to="/products/add">Add Product</Link></PageActions>
  <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Select label="Category" value={category} onChange={e => setCategory(e.target.value)}><option value="">All categories</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</Select><Select label="Brand" value={brand} onChange={e => setBrand(e.target.value)}><option value="">All brands</option>{brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</Select><Select label="Status" value={status} onChange={e => setStatus(e.target.value)}><option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></Select><Select label="Stock status" value={stock} onChange={e => setStock(e.target.value)}><option value="">All stock</option>{['In stock','Low stock','Out of stock'].map(s => <option key={s}>{s}</option>)}</Select></div>
  {selected.length > 0 && <button className="btn mb-3 text-red-500" onClick={() => setDeleting(selected)}>Delete selected ({selected.length})</button>}
  <section className="card p-0"><DataTable caption="Products" rows={rows} rowKey={p => p.id} searchText={p => `${p.name} ${p.sku} ${p.barcode ?? ''}`} selection={selected} onSelectionChange={setSelected} columns={[
  { id:'product', header:'Product', sortValue:p=>p.name, cell:p=><div className="flex items-center gap-3"><ProductImage imageId={p.imageId} name={p.name}/><div className="font-medium">{p.name}<p className="mt-1 text-xs font-normal text-slate-500">{p.sku}</p></div></div> },
  { id:'category', header:'Category', cell:p=>categories.find(c=>c.id===p.categoryId)?.name, sortValue:p=>categories.find(c=>c.id===p.categoryId)?.name??'' },
  { id:'brand', header:'Brand', cell:p=>brands.find(b=>b.id===p.brandId)?.name??'—' }, { id:'unit',header:'Unit',cell:p=>units.find(u=>u.id===p.unitId)?.shortName },
  { id:'cost',header:'Cost',cell:p=>formatPHP(p.costPrice),sortValue:p=>p.costPrice }, { id:'price',header:'Price',cell:p=>formatPHP(p.sellingPrice),sortValue:p=>p.sellingPrice },
  { id:'stock',header:'Stock',cell:p=><div className="flex items-center gap-2">{stockService.getStock(p.id)}<StockBadge stock={stockService.getStock(p.id)} reorderLevel={p.reorderLevel}/></div>,sortValue:p=>stockService.getStock(p.id) }, { id:'status',header:'Status',cell:p=>p.status,sortValue:p=>p.status }
  ]} actions={p=><div className="flex gap-3"><button className="text-indigo-500" onClick={()=>setView(p.id)} aria-label={`View ${p.name}`}>View</button><Link className="text-indigo-500" to={`/products/${p.id}/edit`} aria-label={`Edit ${p.name}`}>Edit</Link><button className="text-red-500" onClick={()=>setDeleting([p.id])} aria-label={`Delete ${p.name}`}>Delete</button></div>}/></section>
  {view && <ProductDetails id={view} onClose={()=>setView(undefined)}/>}
  {deleting.length > 0 && <ConfirmDialog open title="Delete products?" message={`Delete ${deleting.length} product(s), their variants and stock history? This cannot be undone.`} onClose={()=>setDeleting([])} onConfirm={()=>{productService.removeMany(deleting);setSelected([]);toast.success('Products deleted');}}/>}</>;
}

