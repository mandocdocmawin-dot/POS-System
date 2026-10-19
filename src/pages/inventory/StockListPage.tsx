import { T } from "../../i18n/T";
import {InventoryWorkspace} from '../../components/inventory/InventoryWorkspace';
import {ProductImage} from '../../components/common/ProductImage';
import {Can} from '../../components/auth/Can';
import {Link} from 'react-router-dom';
import {Popover} from '../../components/common/Popover';
import {MoreVertical,History,Plus,ArrowDownToLine,ArrowUpFromLine} from 'lucide-react';
import {Select} from '../../components/forms/Fields';
import {categoryService} from '../../services/catalogService';
import {stockStatus} from '../../utils/stock';
import {branchService} from '../../services/branchService';
import { useState } from "react";
import { DataTable } from "../../components/common/DataTable";
import { StockBadge } from "../../components/common/StockBadge";
import { Drawer } from "../../components/common/Drawer";
import { stockService } from "../../services/stockService";
import { useLocalData } from "../../services/useLocalData";
import { formatPHP } from "../../utils/money";
import { MovementHistory } from "./MovementHistory";
type Item = ReturnType<typeof stockService.items>[number];
export function Component() {
  useLocalData();
  const [view, setView] = useState<Item>();
  const [category,setCategory]=useState(''),[status,setStatus]=useState(''),[selected,setSelected]=useState<string[]>([]);
  const allRows = stockService.items(branchService.activeId());
  const rows=allRows.filter(r=>(!category||r.product.categoryId===category)&&(!status||stockStatus(r.stock,r.product.reorderLevel)===status));
  const summary = {
    "Total items": allRows.length,
    "Total stock value": formatPHP(
      allRows.reduce((s, r) => s + r.stock * r.cost, 0),
    ),
    "Low stock": allRows.filter(
      (r) => r.stock > 0 && r.stock <= r.product.reorderLevel,
    ).length,
    "Out of stock": allRows.filter((r) => r.stock <= 0).length,
  };
  return (
    <InventoryWorkspace title="Stock List">
      <p className="mb-4 rounded-lg border border-indigo-200 p-3 text-sm dark:border-indigo-800"><T text={"Active branch: "}/><strong>{branchService.get(branchService.activeId())?.name}</strong></p>

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Object.entries(summary).map(([label, value]) => (
          <section className="card" key={label}>
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
          </section>
        ))}
      </div>
      <section className="card p-0"><div className="product-panel-heading"><h2><T text={"Stock List"}/></h2><Can permission="products:create"><Link className="btn-primary" to="/products/add"><Plus size={16}/><T text={" Add Product"}/></Link></Can></div><div className="product-filters border-0"><Select label="Stock status" value={status} onChange={e=>setStatus(e.target.value)}><option value=""><T text={"All stock statuses"}/></option>{['In stock','Low stock','Out of stock'].map(s=><option key={s}>{s}</option>)}</Select><Select label="Category" value={category} onChange={e=>setCategory(e.target.value)}><option value=""><T text={"All categories"}/></option>{categoryService.list().map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</Select></div>
        <DataTable
          caption="Stock items"
          rows={rows}
          selection={selected}
          onSelectionChange={setSelected}
          rowKey={(r) => r.key}
          searchText={(r) => `${r.name} ${r.sku} ${r.category}`}
          columns={[
            {
              id: "name",
              header: "Product / variant",
              cell: (r) => <div className="flex items-center gap-3"><ProductImage name={r.product.name} imageId={r.product.imageId}/><strong className="font-semibold">{r.name}</strong></div>,
              sortValue: (r) => r.name,
            },
            {
              id: "sku",
              header: "SKU",
              cell: (r) => r.sku,
              sortValue: (r) => r.sku,
            },
            {
              id: "category",
              header: "Category",
              cell: (r) => r.category,
              sortValue: (r) => r.category,
            },
            {
              id: "stock",
              header: "Current stock",
              cell: (r) => r.stock,
              sortValue: (r) => r.stock,
            },
            {
              id: "reorder",
              header: "Reorder level",
              cell: (r) => r.product.reorderLevel,
              sortValue: (r) => r.product.reorderLevel,
            },
            {
              id:"cost",header:"Cost (PHP)",cell:r=>formatPHP(r.cost),sortValue:r=>r.cost,
            },
            {id:"price",header:"Price (PHP)",cell:r=>formatPHP(r.variant?.sellingPrice??r.product.sellingPrice),sortValue:r=>r.variant?.sellingPrice??r.product.sellingPrice},
            {
              id: "value",
              header: "Stock value",
              cell: (r) => formatPHP(r.stock * r.cost),
              sortValue: (r) => r.stock * r.cost,
            },
            {
              id: "status",
              header: "Stock status",
              cell: (r) => (
                <StockBadge
                  stock={r.stock}
                  reorderLevel={r.product.reorderLevel}
                />
              ),
            },
          ]}
          actions={(r) => <Popover label={`Actions for ${r.name}`} trigger={<MoreVertical size={16}/>} className="icon-btn border-transparent"><div className="flex min-w-44 flex-col gap-1 p-2"><button className="flex items-center gap-3 rounded p-2 text-left hover:bg-indigo-50 dark:hover:bg-slate-800" onClick={()=>setView(r)}><History size={16}/><T text={" View history"}/></button><Can permission="inventory:adjust"><Link className="flex items-center gap-3 rounded p-2 hover:bg-indigo-50 dark:hover:bg-slate-800" to="/inventory/stock-in"><ArrowDownToLine size={16}/><T text={" Add stock in"}/></Link><Link className="flex items-center gap-3 rounded p-2 hover:bg-indigo-50 dark:hover:bg-slate-800" to="/inventory/stock-out"><ArrowUpFromLine size={16}/><T text={" Add stock out"}/></Link></Can></div></Popover>}
        />
      </section>
      {view && (
        <Drawer open title={view.name} onClose={() => setView(undefined)}>
          <MovementHistory
            productId={view.product.id}
            variantId={view.variant?.id}
          />
        </Drawer>
      )}
    </InventoryWorkspace>
  );
}
