import { T } from "../../i18n/T";
import {ProductWorkspace,CatalogStatus} from '../../components/products/ProductWorkspace';
import {Popover} from '../../components/common/Popover';
import {MoreVertical,Eye,Pencil,Trash2,Plus,Download,Package,CheckCircle2,TriangleAlert,Archive} from 'lucide-react';
import {branchService} from '../../services/branchService';
import {Can} from '../../components/auth/Can';
import { stockStatus } from "../../utils/stock";
import { ProductDetails } from "./ProductDetails";
import { useState } from "react";
import { Link } from "react-router-dom";
import { DataTable } from "../../components/common/DataTable";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { PageActions } from "../../components/common/PageActions";
import { ProductImage } from "../../components/common/ProductImage";
import { StockBadge } from "../../components/common/StockBadge";
import { Select } from "../../components/forms/Fields";
import { productService } from "../../services/productService";
import {
  categoryService,
  brandService,
  unitService,
} from "../../services/catalogService";
import { stockService } from "../../services/stockService";
import { useLocalData } from "../../services/useLocalData";
import { toast } from "../../services/toastService";
import { formatPHP } from "../../utils/money";
import { exportCSV } from "../../utils/csv";
export function Component() {
  useLocalData();
  const [view, setView] = useState<string>();
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [status, setStatus] = useState("");
  const [stock, setStock] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [deleting, setDeleting] = useState<string[]>([]);
  const categories = categoryService.list(),
    brands = brandService.list(),
    units = unitService.list();
  const rows = productService
    .list()
    .filter(
      (p) =>
        (!category || p.categoryId === category) &&
        (!brand || p.brandId === brand) &&
        (!status || p.status === status) &&
        (!stock ||
          stockStatus(stockService.getStock(p.id,undefined,branchService.activeId()), p.reorderLevel) === stock),
    );
  return (
    <ProductWorkspace title="All Products">
      <div className="product-metrics">{[[Package,productService.list().length,"All products"],[CheckCircle2,productService.list().filter(p=>p.status==='active').length,"Active products"],[TriangleAlert,productService.list().filter(p=>stockService.getStock(p.id,undefined,branchService.activeId())<=p.reorderLevel).length,"Low or empty stock"],[Archive,productService.list().filter(p=>p.status==='inactive').length,"Inactive products"]].map(([Icon,value,label])=>{const Mark=Icon as typeof Package;return <div className="product-metric" key={String(label)}><span className="rounded-lg bg-indigo-50 p-3 text-indigo-600 dark:bg-indigo-500/15"><Mark size={22}/></span><div><strong>{String(value)}</strong><span>{String(label)}</span></div></div>;})}</div>
      <PageActions title="All Products">
        <button
          className="btn"
          onClick={() =>
            exportCSV("products.csv", [
              ["Name", "SKU", "Cost", "Price", "Stock"],
              ...rows.map((p) => [
                p.name,
                p.sku,
                p.costPrice,
                p.sellingPrice,
                stockService.getStock(p.id,undefined,branchService.activeId()),
              ]),
            ])
          }
        >
          <Download size={15}/><T text={"Export CSV"}/></button>
        <Can permission="products:create"><Link className="btn-primary" to="/products/add">
          <Plus size={16}/><T text={"Add Product"}/></Link></Can>
      </PageActions>
      <div className="product-filters">
        <Select
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value=""><T text={"All categories"}/></option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select
          label="Brand"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
        >
          <option value=""><T text={"All brands"}/></option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </Select>
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value=""><T text={"All statuses"}/></option>
          <option value="active"><T text={"Active"}/></option>
          <option value="inactive"><T text={"Inactive"}/></option>
        </Select>
        <Select
          label="Stock status"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
        >
          <option value=""><T text={"All stock"}/></option>
          {["In stock", "Low stock", "Out of stock"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </Select>
      </div>
      {selected.length > 0 && (
        <Can permission="products:delete"><button
          className="btn mb-3 text-red-500"
          onClick={() => setDeleting(selected)}
        >
          Delete selected ({selected.length})
        </button></Can>
      )}
      <section className="card p-0">
        <DataTable
          caption="Products"
          rows={rows}
          rowKey={(p) => p.id}
          searchText={(p) => `${p.name} ${p.sku} ${p.barcode ?? ""}`}
          selection={selected}
          onSelectionChange={setSelected}
          columns={[
            {
              id: "sku", header:"Product ID", cell:p=><span className="text-slate-500">{p.sku}</span>, sortValue:p=>p.sku,
            },
            {
              id: "product",
              header: "Product",
              sortValue: (p) => p.name,
              cell: (p) => (
                <div className="flex items-center gap-3">
                  <ProductImage imageId={p.imageId} name={p.name} />
                  <div className="font-medium">
                    {p.name}
                    <p className="mt-1 text-xs font-normal text-slate-500">
                      {p.sku}
                    </p>
                  </div>
                </div>
              ),
            },
            {
              id: "category",
              header: "Category",
              cell: (p) => categories.find((c) => c.id === p.categoryId)?.name,
              sortValue: (p) =>
                categories.find((c) => c.id === p.categoryId)?.name ?? "",
            },
            {
              id: "brand",
              header: "Brand",
              cell: (p) => brands.find((b) => b.id === p.brandId)?.name ?? "—",
            },
            {
              id: "unit",
              header: "Unit",
              cell: (p) => units.find((u) => u.id === p.unitId)?.shortName,
            },
            {
              id: "cost",
              header: "Cost",
              cell: (p) => formatPHP(p.costPrice),
              sortValue: (p) => p.costPrice,
            },
            {
              id: "price",
              header: "Price",
              cell: (p) => <div>{!!p.discountPercent&&<del className="mr-2 text-xs text-slate-400">{formatPHP(p.sellingPrice)}</del>}<span className={p.discountPercent?"font-semibold text-rose-500":"font-medium"}>{formatPHP(p.sellingPrice*(1-(p.discountPercent??0)/100))}</span></div>,
              sortValue: (p) => p.sellingPrice,
            },
            {
              id: "stock",
              header: "Stock",
              cell: (p) => (
                <div className="flex items-center gap-2">
                  {stockService.getStock(p.id,undefined,branchService.activeId())}
                  <StockBadge
                    stock={stockService.getStock(p.id,undefined,branchService.activeId())}
                    reorderLevel={p.reorderLevel}
                  />
                </div>
              ),
              sortValue: (p) => stockService.getStock(p.id,undefined,branchService.activeId()),
            },
            {
              id: "status",
              header: "Status",
              cell: (p) => <CatalogStatus status={p.status}/>,
              sortValue: (p) => p.status,
            },
          ]}
          actions={(p) => (
            <Popover label={`Actions for ${p.name}`} trigger={<MoreVertical size={16}/>} className="icon-btn border-transparent">
              <div className="flex min-w-40 flex-col gap-1 p-2"><button
                className="flex items-center gap-3 rounded p-2 text-left hover:bg-indigo-50 dark:hover:bg-slate-800"
                onClick={() => setView(p.id)}
                aria-label={`View ${p.name}`}
              >
                <Eye size={16}/><T text={"Overview"}/></button>
              <Can permission="products:edit"><Link
                className="flex items-center gap-3 rounded p-2 text-left hover:bg-indigo-50 dark:hover:bg-slate-800"
                to={`/products/${p.id}/edit`}
                aria-label={`Edit ${p.name}`}
              >
                <Pencil size={16}/><T text={"Edit"}/></Link></Can>
              <Can permission="products:delete"><button
                className="flex items-center gap-3 rounded p-2 text-left text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                onClick={() => setDeleting([p.id])}
                aria-label={`Delete ${p.name}`}
              >
                <Trash2 size={16}/><T text={"Delete"}/></button></Can>
            </div></Popover>
          )}
        />
      </section>
      {view && <ProductDetails id={view} onClose={() => setView(undefined)} />}
      {deleting.length > 0 && (
        <ConfirmDialog
          open
          title="Delete products?"
          message={`Delete ${deleting.length} product(s), their variants and stock history? This cannot be undone.`}
          onClose={() => setDeleting([])}
          onConfirm={() => {
            productService.removeMany(deleting);
            setSelected([]);
            toast.success("Products deleted");
          }}
        />
      )}
    </ProductWorkspace>
  );
}
